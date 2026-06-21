import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { b64u } from "@/lib/e2ee-shield-sdk/base64url";
import {
  aesGcmEncrypt,
  decryptE2eeResponse,
  type EncryptedEnvelope,
  type Session,
} from "@/lib/e2ee-shield-sdk/crypto";
import { shouldEncryptRequest } from "@/lib/e2ee-shield-sdk/e2eeRoutePolicy";
import { clearSession, getSession } from "@/lib/e2ee-shield-sdk/keyManager";
import {
  removeRefreshTokenCookie,
  persistRefreshTokenCookie,
} from "@/lib/refresh-token-client";
import { getAccessToken, setAccessToken, useAuthStore } from "@/store/auth";
import { useLoadingStore } from "@/store/loading";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

const isE2eeEnabled = process.env.NEXT_PUBLIC_E2EE_ENABLED === "true";
const textEncoder = new TextEncoder();

type E2eeRequestConfig = InternalAxiosRequestConfig & {
  _e2eeSession?: Session;
  _e2eeOriginalData?: unknown;
  _e2eeHasOriginal?: boolean;
  _e2eeRetry?: boolean;
  _e2eeResponseOnly?: boolean;
};

// Separate axios instance for refresh – avoids interceptor loops
const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

let isLoggingOut = false;

export const setIsLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

const processQueue = (token: string | null) => {
  pendingQueue.forEach((callback) => callback(token));
  pendingQueue = [];
};

export const refreshAccessToken = async () => {
  // If we are logging out, don't attempt to refresh
  if (isLoggingOut) return null;

  isRefreshing = true;
  try {
    const res = await refreshClient.post<{
      data?: { accessToken?: string; refreshToken?: string };
    }>("/auth/refresh");

    const newToken = res.data?.data?.accessToken ?? null;
    const newRefreshToken = res.data?.data?.refreshToken ?? null;

    // store access token in memory
    setAccessToken(newToken ?? undefined);

    // if backend returned a refresh token, persist it to httpOnly cookie
    if (newRefreshToken) {
      try {
        await persistRefreshTokenCookie(newRefreshToken);
      } catch (err) {
        console.warn("[http] failed to persist refresh token cookie", err);
      }
    }

    return newToken;
  } catch {
    setAccessToken(undefined);
    return null;
  } finally {
    isRefreshing = false;
  }
};

// ── Request interceptor ──
http.interceptors.request.use(
  async (config) => {
    useLoadingStore.getState().startLoading();

    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (shouldApplyE2ee(config)) {
      const e2eeConfig = config as E2eeRequestConfig;
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

      e2eeConfig._e2eeSession = session;
      config.headers = config.headers ?? {};
      config.headers["X-E2EE-Enabled"] = "true";

      if (isResponseOnlyE2eeMethod(method)) {
        e2eeConfig._e2eeResponseOnly = true;
        config.headers["X-E2EE-Session-Id"] = session.sessionId;
        config.headers["X-E2EE-AAD"] = b64u.enc(
          textEncoder.encode(JSON.stringify(aad)),
        );
        return config;
      }

      if (!e2eeConfig._e2eeHasOriginal) {
        e2eeConfig._e2eeOriginalData = config.data;
        e2eeConfig._e2eeHasOriginal = true;
      }

      const { iv, ct, tag, aadBytes } = await aesGcmEncrypt(
        session.key,
        config.data ?? {},
        aad,
      );

      config.data = {
        sessionId: session.sessionId,
        aad: b64u.enc(aadBytes),
        iv: b64u.enc(iv),
        cipherText: b64u.enc(ct),
        tag: b64u.enc(tag),
      };
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    useLoadingStore.getState().stopLoading();
    return Promise.reject(error);
  },
);

// ── Response interceptor ──
http.interceptors.response.use(
  async (response) => {
    if (isEncryptedEnvelope(response.data)) {
      const session =
        (response.config as E2eeRequestConfig)._e2eeSession ??
        (await getSession());
      response.data = await decryptE2eeResponse(session.key, response.data, {
        sessionId: session.sessionId,
        method: (response.config.method || "GET").toUpperCase(),
        path: resolveRequestPath(response.config),
      });
    }
    useLoadingStore.getState().stopLoading();
    return response;
  },
  async (error: AxiosError) => {
    useLoadingStore.getState().stopLoading();

    const originalRequest = error.config as E2eeRequestConfig & {
      _retry?: boolean;
    };

    if (error.response && isEncryptedEnvelope(error.response.data)) {
      const session = originalRequest?._e2eeSession;
      if (!session || !originalRequest) {
        return Promise.reject(error);
      }
      error.response.data = await decryptE2eeResponse(
        session.key,
        error.response.data,
        {
          sessionId: session.sessionId,
          method: (originalRequest.method || "GET").toUpperCase(),
          path: resolveRequestPath(originalRequest),
        },
      );
    }

    if (
      error.response?.status === 401 &&
      isExpiredE2eeSessionError(error.response.data) &&
      originalRequest &&
      !originalRequest._e2eeRetry
    ) {
      originalRequest._e2eeRetry = true;
      clearSession();
      restoreOriginalE2eeData(originalRequest);
      return http(originalRequest);
    }

    // If logging out, ignore 401s to prevent refresh attempts
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      // If another request is already refreshing, queue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (token) {
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
              restoreOriginalE2eeData(originalRequest);
              resolve(http(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      const newToken = await refreshAccessToken();
      processQueue(newToken);

      if (newToken) {
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        restoreOriginalE2eeData(originalRequest);
        return http(originalRequest);
      }

      // Refresh failed – clear auth state (no hard redirect)
      useAuthStore.getState().clear();
      void removeRefreshTokenCookie();
    }

    return Promise.reject(error);
  },
);

const shouldApplyE2ee = (config: InternalAxiosRequestConfig) => {
  if (!isE2eeEnabled || typeof window === "undefined") return false;
  if (config.data instanceof FormData) return false;
  const method = (config.method || "GET").toUpperCase();
  return shouldEncryptRequest(method, resolveRequestPath(config));
};

const isResponseOnlyE2eeMethod = (method: string) => {
  return method === "GET" || method === "HEAD";
};

const resolveRequestPath = (config: InternalAxiosRequestConfig) => {
  const requestUrl = config.url || "/";
  if (/^https?:\/\//i.test(requestUrl)) {
    return new URL(requestUrl).pathname;
  }

  const baseUrl = new URL(config.baseURL || apiBaseUrl);
  const normalizedBase = baseUrl.pathname.endsWith("/")
    ? baseUrl.pathname
    : `${baseUrl.pathname}/`;
  return new URL(
    requestUrl.replace(/^\/+/, ""),
    `${baseUrl.origin}${normalizedBase}`,
  ).pathname;
};

const isEncryptedEnvelope = (value: unknown): value is EncryptedEnvelope => {
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

const restoreOriginalE2eeData = (config: E2eeRequestConfig) => {
  if (config._e2eeHasOriginal) {
    config.data = config._e2eeOriginalData;
  }
};

const isExpiredE2eeSessionError = (value: unknown) => {
  if (!value || typeof value !== "object") return false;
  return (
    (value as Record<string, unknown>).error ===
    "invalid_or_expired_e2ee_session"
  );
};
