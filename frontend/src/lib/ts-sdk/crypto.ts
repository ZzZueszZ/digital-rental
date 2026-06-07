// src/libs/ts-sdk/crypto.ts
const te = new TextEncoder();
const td = new TextDecoder();

export type Session = {
  sessionId: string;
  key: CryptoKey; // AES-GCM 256
};

// Tạo keypair ECDH P-256 phía client
export async function genClientEphemeral() {
  const subtle = crypto.subtle;

  const kp = await subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits", "deriveKey"]
  );
  const pubJwk = await subtle.exportKey("jwk", kp.publicKey);
  return { kp, pubJwk } as const;
}

// HKDF-SHA256 → derive AES-GCM key
export async function deriveSessionKey(
  clientPrivateKey: CryptoKey,
  serverPubJwk: JsonWebKey,
  salt: Uint8Array,
  info: string
): Promise<CryptoKey> {
  const subtle = crypto.subtle;

  const serverPubKey = await subtle.importKey(
    "jwk",
    serverPubJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const sharedBits = await subtle.deriveBits(
    { name: "ECDH", public: serverPubKey },
    clientPrivateKey,
    256
  );

  const ikm = new Uint8Array(sharedBits);
  const hkdfKey = await subtle.importKey("raw", ikm, "HKDF", false, [
    "deriveKey",
  ]);

  const infoBytes = te.encode(info);

  const aesKey = await subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt as BufferSource,
      info: infoBytes as BufferSource,
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return aesKey;
}

// Encrypt JSON payload bằng AES-GCM + AAD
export async function aesGcmEncrypt(
  key: CryptoKey,
  payload: unknown,
  aadObj: unknown
) {
  const subtle = crypto.subtle;

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit
  const ptBytes = te.encode(JSON.stringify(payload));
  const aadBytes = te.encode(JSON.stringify(aadObj));

  const enc = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: aadBytes as BufferSource,
      tagLength: 128,
    },
    key,
    ptBytes as BufferSource
  );

  const out = new Uint8Array(enc);
  const tag = out.slice(out.length - 16);
  const ct = out.slice(0, out.length - 16);

  return { iv, ct, tag, aadBytes };
}

// Decrypt JSON payload
export async function aesGcmDecrypt(
  key: CryptoKey,
  iv: Uint8Array,
  ct: Uint8Array,
  tag: Uint8Array,
  aadBytes: Uint8Array
): Promise<any> {
  const subtle = crypto.subtle;

  const sealed = new Uint8Array(ct.length + tag.length);
  sealed.set(ct, 0);
  sealed.set(tag, ct.length);

  const dec = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: aadBytes as BufferSource,
      tagLength: 128,
    },
    key,
    sealed as BufferSource
  );

  const jsonStr = td.decode(dec);
  return JSON.parse(jsonStr);
}
