import { createPublicKey, webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const parseEnv = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        let value = line.slice(separator + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        return [line.slice(0, separator).trim(), value];
      }),
  );

const b64uEncode = (value) => Buffer.from(value).toString("base64url");
const b64uDecode = (value) => new Uint8Array(Buffer.from(value, "base64url"));
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const frontendEnv = parseEnv(
  await readFile(resolve(process.cwd(), ".env"), "utf8"),
);
const apiBase =
  process.env.E2EE_VERIFY_API_URL ||
  frontendEnv.NEXT_PUBLIC_API_URL ||
  "https://api.lenshub.shop/api";
const identityJwk = {
  kty: "EC",
  crv: "P-256",
  x: frontendEnv.NEXT_PUBLIC_SERVER_JWK_X,
  y: frontendEnv.NEXT_PUBLIC_SERVER_JWK_Y,
};

if (!identityJwk.x || !identityJwk.y) {
  throw new Error("Missing frontend E2EE identity JWK coordinates");
}

const clientKeyPair = await webcrypto.subtle.generateKey(
  { name: "ECDH", namedCurve: "P-256" },
  true,
  ["deriveBits"],
);
const clientPublicJwk = await webcrypto.subtle.exportKey(
  "jwk",
  clientKeyPair.publicKey,
);
const clientNonce = webcrypto.getRandomValues(new Uint8Array(16));

const response = await fetch(`${apiBase}/shield/handshake`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    clientPubJwk: clientPublicJwk,
    clientNonce: b64uEncode(clientNonce),
  }),
});

if (!response.ok) {
  throw new Error(`E2EE handshake failed with HTTP ${response.status}`);
}

const body = await response.json();
const signaturePayload = [
  body.sessionId,
  body.serverNonceB64u,
  body.serverPubJwk?.x,
  body.serverPubJwk?.y,
].join(".");
const verifyKey = await webcrypto.subtle.importKey(
  "jwk",
  identityJwk,
  { name: "ECDSA", namedCurve: "P-256" },
  false,
  ["verify"],
);
const signatureValid = await webcrypto.subtle.verify(
  { name: "ECDSA", hash: "SHA-256" },
  verifyKey,
  b64uDecode(body.signatureB64u),
  new TextEncoder().encode(signaturePayload),
);

if (!signatureValid) {
  throw new Error("E2EE handshake signature is invalid");
}

const serverPublicKey = await webcrypto.subtle.importKey(
  "jwk",
  body.serverPubJwk,
  { name: "ECDH", namedCurve: "P-256" },
  false,
  [],
);
const sharedBits = await webcrypto.subtle.deriveBits(
  { name: "ECDH", public: serverPublicKey },
  clientKeyPair.privateKey,
  256,
);
const hkdfKey = await webcrypto.subtle.importKey(
  "raw",
  sharedBits,
  "HKDF",
  false,
  ["deriveKey"],
);
const serverNonce = b64uDecode(body.serverNonceB64u);
const salt = new Uint8Array(clientNonce.length + serverNonce.length);
salt.set(clientNonce, 0);
salt.set(serverNonce, clientNonce.length);
const sessionKey = await webcrypto.subtle.deriveKey(
  {
    name: "HKDF",
    hash: "SHA-256",
    salt,
    info: encoder.encode("E2EE-SHIELD/v1"),
  },
  hkdfKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"],
);

const backendEnv = parseEnv(
  await readFile(resolve(process.cwd(), "../service/lenshub/.env"), "utf8"),
);
const backendPublicPem = Buffer.from(
  backendEnv.SERVER_IDENTITY_PUB_B64,
  "base64",
).toString("utf8");
const backendPublicJwk = createPublicKey(backendPublicPem).export({
  format: "jwk",
});

if (
  backendPublicJwk.x !== identityJwk.x ||
  backendPublicJwk.y !== identityJwk.y
) {
  throw new Error("Frontend identity JWK does not match backend public key");
}

const loginUrl = new URL(`${apiBase}/auth/login`);
const requestAad = {
  sessionId: body.sessionId,
  method: "POST",
  path: loginUrl.pathname,
  timestamp: Date.now(),
  nonce: b64uEncode(webcrypto.getRandomValues(new Uint8Array(16))),
  direction: "request",
};
const requestAadBytes = encoder.encode(JSON.stringify(requestAad));
const requestIv = webcrypto.getRandomValues(new Uint8Array(12));
const encryptedLogin = new Uint8Array(
  await webcrypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: requestIv,
      additionalData: requestAadBytes,
      tagLength: 128,
    },
    sessionKey,
    encoder.encode(
      JSON.stringify({
        email: "e2ee-probe@example.invalid",
        password: "not-a-real-password",
      }),
    ),
  ),
);
const encryptedLoginEnvelope = {
  sessionId: body.sessionId,
  aad: b64uEncode(requestAadBytes),
  iv: b64uEncode(requestIv),
  cipherText: b64uEncode(encryptedLogin.slice(0, -16)),
  tag: b64uEncode(encryptedLogin.slice(-16)),
};
const loginResponse = await fetch(loginUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(encryptedLoginEnvelope),
});
const loginEnvelope = await loginResponse.json();
if (
  !loginEnvelope.aad ||
  !loginEnvelope.iv ||
  !loginEnvelope.cipherText ||
  !loginEnvelope.tag
) {
  throw new Error("Protected login response is not encrypted");
}
const responseAadBytes = b64uDecode(loginEnvelope.aad);
const responseAad = JSON.parse(decoder.decode(responseAadBytes));
if (
  responseAad.sessionId !== body.sessionId ||
  responseAad.method !== "POST" ||
  responseAad.path !== loginUrl.pathname ||
  responseAad.direction !== "response"
) {
  throw new Error("Protected login response AAD mismatch");
}
const responseCipherText = b64uDecode(loginEnvelope.cipherText);
const responseTag = b64uDecode(loginEnvelope.tag);
const responseSealed = new Uint8Array(
  responseCipherText.length + responseTag.length,
);
responseSealed.set(responseCipherText);
responseSealed.set(responseTag, responseCipherText.length);
const decryptedLoginResponse = JSON.parse(
  decoder.decode(
    await webcrypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: b64uDecode(loginEnvelope.iv),
        additionalData: responseAadBytes,
        tagLength: 128,
      },
      sessionKey,
      responseSealed,
    ),
  ),
);
const replayResponse = await fetch(loginUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(encryptedLoginEnvelope),
});
const replayBody = await replayResponse.json();
if (
  replayResponse.status !== 400 ||
  replayBody.error !== "e2ee_replay_detected"
) {
  throw new Error("E2EE replay protection did not reject a reused envelope");
}

console.log(
  JSON.stringify({
    ok: true,
    apiBase,
    sessionId: body.sessionId,
    signatureValid,
    identityKeyMatches: true,
    encryptedLoginStatus: loginResponse.status,
    encryptedResponseVerified: Boolean(decryptedLoginResponse),
    replayRejected: true,
  }),
);
