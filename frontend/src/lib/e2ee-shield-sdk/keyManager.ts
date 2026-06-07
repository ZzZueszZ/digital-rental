import { b64u } from "./base64url";
import { deriveSessionKey, genClientEphemeral, Session } from "./crypto";

const BE_BASE = process.env.NEXT_PUBLIC_BE || "http://localhost:8080";

let currentSession: Session | null = null;
let expiresAt = 0;

// ✅ Public key định danh của server load từ .env.local
const SERVER_IDENTITY_JWK: JsonWebKey = {
  kty: "EC",
  crv: "P-256",
  x: process.env.NEXT_PUBLIC_SERVER_JWK_X!,
  y: process.env.NEXT_PUBLIC_SERVER_JWK_Y!,
};

async function doHandshake(): Promise<Session> {
  const { kp, pubJwk } = await genClientEphemeral();
  const clientNonce = crypto.getRandomValues(new Uint8Array(16));

  const res = await fetch(`${BE_BASE}/shield/handshake`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      clientPubJwk: pubJwk,
      clientNonce: b64u.enc(clientNonce),
    }),
  });

  if (!res.ok) throw new Error(`Handshake failed: ${res.status}`);
  const body = await res.json();

  // Verify chữ ký handshake
  const payload = `${body.sessionId}.${body.serverNonceB64u}.${body.serverPubJwk.x}.${body.serverPubJwk.y}`;
  const verifyKey = await crypto.subtle.importKey(
    "jwk",
    SERVER_IDENTITY_JWK,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );

  const signatureBytes = b64u.dec(body.signatureB64u);
  const payloadBytes = new TextEncoder().encode(payload);

  const valid = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    verifyKey,
    signatureBytes as BufferSource,
    payloadBytes as BufferSource
  );

  if (!valid) throw new Error("❌ Invalid server signature — possible MITM!");
  console.info("✅ Server signature verified.");

  // Derive session key
  const serverNonce = b64u.dec(body.serverNonceB64u);
  const salt = new Uint8Array(clientNonce.length + serverNonce.length);
  salt.set(clientNonce, 0);
  salt.set(serverNonce, clientNonce.length);

  const key = await deriveSessionKey(
    kp.privateKey,
    body.serverPubJwk,
    salt,
    "E2EE-SHIELD/v1"
  );

  const sessionId = body.sessionId;
  currentSession = { sessionId, key };
  expiresAt = Date.now() + 30 * 60 * 1000;
  return currentSession;
}

export async function getSession(): Promise<Session> {
  if (currentSession && Date.now() < expiresAt) return currentSession;
  return doHandshake();
}

export function clearSession() {
  currentSession = null;
  expiresAt = 0;
}
