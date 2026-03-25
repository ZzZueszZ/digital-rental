import axios, { AxiosError } from 'axios';
import { getAccessToken, setAccessToken, useAuthStore } from '@/store/auth';
import { getRefreshTokenFromCookie, removeRefreshTokenCookie, persistRefreshTokenCookie } from './refresh-token-client';
import Routers from '@/constants/routers';

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isLoggingOut = false;
export const setIsLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry && !isLoggingOut) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshTokenFromCookie();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${http.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

        setAccessToken(newAccessToken);
        await persistRefreshTokenCookie(newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return http(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clear();
        await removeRefreshTokenCookie();
        if (typeof window !== 'undefined') {
          window.location.href = Routers.LOGIN;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshTokenFromCookie();
    if (!refreshToken) return null;

    const { data } = await axios.post(`${http.defaults.baseURL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = data.data;
    setAccessToken(accessToken);
    await persistRefreshTokenCookie(newRefreshToken);
    return accessToken;
  } catch (error) {
    return null;
  }
};
