import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

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
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

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
  (config) => {
    useLoadingStore.getState().startLoading();

    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
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
  (response) => {
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
