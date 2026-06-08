const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export type Session = {
  sessionId: string;
  key: CryptoKey;
};

export type EncryptedEnvelope = {
  sessionId: string;
  aad: string;
  iv: string;
  cipherText: string;
  tag: string;
};

type ExpectedResponseAad = {
  sessionId: string;
  method: string;
  path: string;
};

const MAX_CLOCK_SKEW_MS = 2 * 60 * 1000;
const usedResponseNonces = new Map<string, number>();

export async function genClientEphemeral() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits", "deriveKey"],
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  return { kp: keyPair, pubJwk: publicJwk } as const;
}

export async function deriveSessionKey(
  clientPrivateKey: CryptoKey,
  serverPubJwk: JsonWebKey,
  salt: Uint8Array,
  info: string,
): Promise<CryptoKey> {
  const serverPublicKey = await crypto.subtle.importKey(
    "jwk",
    serverPubJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: serverPublicKey },
    clientPrivateKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(sharedBits),
    "HKDF",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt as BufferSource,
      info: textEncoder.encode(info) as BufferSource,
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function aesGcmEncrypt(
  key: CryptoKey,
  payload: unknown,
  aadObject: unknown,
) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = textEncoder.encode(JSON.stringify(payload));
  const aadBytes = textEncoder.encode(JSON.stringify(aadObject));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: aadBytes as BufferSource,
      tagLength: 128,
    },
    key,
    plaintext as BufferSource,
  );

  const output = new Uint8Array(encrypted);
  return {
    iv,
    ct: output.slice(0, output.length - 16),
    tag: output.slice(output.length - 16),
    aadBytes,
  };
}

export async function aesGcmDecrypt(
  key: CryptoKey,
  iv: Uint8Array,
  cipherText: Uint8Array,
  tag: Uint8Array,
  aadBytes: Uint8Array,
): Promise<unknown> {
  const sealed = new Uint8Array(cipherText.length + tag.length);
  sealed.set(cipherText, 0);
  sealed.set(tag, cipherText.length);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: aadBytes as BufferSource,
      tagLength: 128,
    },
    key,
    sealed as BufferSource,
  );
  return JSON.parse(textDecoder.decode(decrypted));
}

export async function decryptE2eeResponse(
  key: CryptoKey,
  envelope: EncryptedEnvelope,
  expected: ExpectedResponseAad,
): Promise<unknown> {
  if (envelope.sessionId !== expected.sessionId) {
    throw new Error("E2EE response session mismatch");
  }

  const aadBytes = decodeBase64Url(envelope.aad);
  const payload = await aesGcmDecrypt(
    key,
    decodeBase64Url(envelope.iv),
    decodeBase64Url(envelope.cipherText),
    decodeBase64Url(envelope.tag),
    aadBytes,
  );
  validateResponseAad(aadBytes, expected);
  return payload;
}

function validateResponseAad(
  aadBytes: Uint8Array,
  expected: ExpectedResponseAad,
) {
  let aad: Record<string, unknown>;
  try {
    aad = JSON.parse(textDecoder.decode(aadBytes)) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid E2EE response AAD");
  }

  if (
    aad.sessionId !== expected.sessionId ||
    aad.method !== expected.method.toUpperCase() ||
    aad.path !== expected.path ||
    aad.direction !== "response" ||
    typeof aad.timestamp !== "number" ||
    typeof aad.nonce !== "string" ||
    !aad.nonce
  ) {
    throw new Error("E2EE response AAD mismatch");
  }
  if (Math.abs(Date.now() - aad.timestamp) > MAX_CLOCK_SKEW_MS) {
    throw new Error("E2EE response timestamp expired");
  }

  cleanupResponseNonces();
  const nonceKey = `${expected.sessionId}:${aad.nonce}`;
  if (usedResponseNonces.has(nonceKey)) {
    throw new Error("E2EE response replay detected");
  }
  usedResponseNonces.set(nonceKey, Date.now());
}

function cleanupResponseNonces() {
  const cutoff = Date.now() - MAX_CLOCK_SKEW_MS;
  usedResponseNonces.forEach((timestamp, nonce) => {
    if (timestamp < cutoff) {
      usedResponseNonces.delete(nonce);
    }
  });
}

function decodeBase64Url(value: string): Uint8Array {
  const padding = value.length % 4 === 0
    ? ""
    : "=".repeat(4 - (value.length % 4));
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + padding;
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}
