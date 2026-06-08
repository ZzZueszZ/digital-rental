import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { baseAxios } from "./axios";
import { b64u } from "./base64url";
import {
  aesGcmEncrypt,
  decryptE2eeResponse,
  type EncryptedEnvelope,
  type Session,
} from "./crypto";
import { shouldEncryptRequest } from "./e2eeRoutePolicy";
import { getSession } from "./keyManager";

type E2eeRequestConfig = InternalAxiosRequestConfig & {
  _e2eeSession?: Session;
};

const isE2eeEnabled = process.env.NEXT_PUBLIC_E2EE_ENABLED === "true";

export const secureApi = baseAxios;

secureApi.interceptors.request.use(async (config) => {
  if (!shouldApplyE2ee(config)) return config;

  const session = await getSession();
  const method = (config.method || "GET").toUpperCase();
  const path = resolveRequestPath(config);
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const aad = {
    sessionId: session.sessionId,
    method,
    path,
    timestamp: Date.now(),
    nonce: b64u.enc(nonce),
    direction: "request",
  };

  const { iv, ct, tag, aadBytes } = await aesGcmEncrypt(
    session.key,
    config.data ?? {},
    aad,
  );

  (config as E2eeRequestConfig)._e2eeSession = session;
  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("X-E2EE-Enabled", "true");
  config.headers = headers;
  config.data = {
    sessionId: session.sessionId,
    aad: b64u.enc(aadBytes),
    iv: b64u.enc(iv),
    cipherText: b64u.enc(ct),
    tag: b64u.enc(tag),
  };

  return config;
});

secureApi.interceptors.response.use(
  async (response) => {
    if (!isEncryptedEnvelope(response.data)) return response;

    const session = (response.config as E2eeRequestConfig)._e2eeSession ?? await getSession();
    response.data = await decryptE2eeResponse(
      session.key,
      response.data,
      {
        sessionId: session.sessionId,
        method: (response.config.method || "GET").toUpperCase(),
        path: resolveRequestPath(response.config),
      },
    );
    return response;
  },
  async (error: AxiosError) => {
    if (!error.config || !error.response || !isEncryptedEnvelope(error.response.data)) {
      return Promise.reject(error);
    }

    const session = (error.config as E2eeRequestConfig)._e2eeSession;
    if (!session) return Promise.reject(error);

    error.response.data = await decryptE2eeResponse(
      session.key,
      error.response.data,
      {
        sessionId: session.sessionId,
        method: (error.config.method || "GET").toUpperCase(),
        path: resolveRequestPath(error.config),
      },
    );
    return Promise.reject(error);
  },
);

const shouldApplyE2ee = (config: InternalAxiosRequestConfig) => {
  if (!isE2eeEnabled || typeof window === "undefined") return false;
  if (config.data instanceof FormData) return false;
  const method = (config.method || "GET").toUpperCase();
  return shouldEncryptRequest(method, resolveRequestPath(config));
};

const resolveRequestPath = (config: InternalAxiosRequestConfig) => {
  const url = new URL(config.url || "/", config.baseURL || "http://localhost:8080/api");
  return url.pathname;
};

const isEncryptedEnvelope = (
  value: unknown,
): value is EncryptedEnvelope => {
  if (!isE2eeEnabled || !value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.sessionId === "string" &&
    typeof candidate.aad === "string" &&
    typeof candidate.iv === "string" &&
    typeof candidate.cipherText === "string" &&
    typeof candidate.tag === "string"
  );
};
