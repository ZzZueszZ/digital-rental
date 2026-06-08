import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { b64u } from "@/lib/e2ee-shield-sdk/base64url";
import { aesGcmDecrypt, aesGcmEncrypt, type Session } from "@/lib/e2ee-shield-sdk/crypto";
import { shouldEncryptRequest } from "@/lib/e2ee-shield-sdk/e2eeRoutePolicy";
import { getSession } from "@/lib/e2ee-shield-sdk/keyManager";
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

type E2eeRequestConfig = InternalAxiosRequestConfig & {
  _e2eeSession?: Session;
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
      };
      const { iv, ct, tag, aadBytes } = await aesGcmEncrypt(
        session.key,
        config.data ?? {},
        aad,
      );

      (config as E2eeRequestConfig)._e2eeSession = session;
      config.data = {
        sessionId: session.sessionId,
        aad: b64u.enc(aadBytes),
        iv: b64u.enc(iv),
        cipherText: b64u.enc(ct),
        tag: b64u.enc(tag),
      };
      config.headers = config.headers ?? {};
      config.headers["Content-Type"] = "application/json";
      config.headers["X-E2EE-Enabled"] = "true";
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
      const session = (response.config as E2eeRequestConfig)._e2eeSession ?? await getSession();
      response.data = await aesGcmDecrypt(
        session.key,
        b64u.dec(response.data.iv),
        b64u.dec(response.data.cipherText),
        b64u.dec(response.data.tag),
        b64u.dec(response.data.aad),
      );
    }
    useLoadingStore.getState().stopLoading();
    return response;
  },
  async (error: AxiosError) => {
    useLoadingStore.getState().stopLoading();

    // If logging out, ignore 401s to prevent refresh attempts
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      // If another request is already refreshing, queue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (token) {
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
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

const resolveRequestPath = (config: InternalAxiosRequestConfig) => {
  const url = new URL(config.url || "/", config.baseURL || apiBaseUrl);
  return url.pathname;
};

const isEncryptedEnvelope = (
  value: unknown,
): value is { aad: string; iv: string; cipherText: string; tag: string } => {
  if (!isE2eeEnabled || !value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.aad === "string" &&
    typeof candidate.iv === "string" &&
    typeof candidate.cipherText === "string" &&
    typeof candidate.tag === "string"
  );
};
