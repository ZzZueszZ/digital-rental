import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { authApi } from '@/services/authApi.ts';
import store from '@/store';
import { setAuthToken, logOut } from '@/store/auth/slice';
import { LoginResult } from '@/store/auth/data';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  headers: {
    Accept: 'application/json',
  },
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type FailedRequest = {
  resolve: (loginResult: LoginResult) => void;
  reject: (error?: Error) => void; // Use Error type for better type safety
};
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error?: Error, loginResult?: LoginResult) => {
  failedQueue.forEach(prom => {
    if (loginResult) {
      prom.resolve(loginResult);
    } else {
      prom.reject(error);
    }
  });

  failedQueue = [];
};

http.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    if (!config.headers) {
      config.headers = {} as AxiosHeaders; // Initialize headers if not present
    }
    config.headers['Client-Time'] = new Date().toISOString();
    config.headers['Accept-Language'] = 'vi_VN';
    const state = store.getState(); // Get the current state from Redux store
    if (state.auth.authUser) {
      if (!config.headers) {
        config.headers = {} as AxiosHeaders; // Initialize headers if not present
      }
      const u = state.auth.authUser as LoginResult;
      config.headers['Authorization'] = `Bearer ${u.accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle 401 errors and retry requests
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as CustomAxiosRequestConfig;
    if (error.response?.status === 401 && error.response.config.url === '/pub/authenticate/refresh-token') {
      store.dispatch(logOut());
      isRefreshing = false;
    } else if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (!originalRequest.headers) {
              originalRequest.headers = {} as AxiosHeaders;
            }
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return http(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const state = store.getState().auth.authUser as LoginResult;
        if (!state || !state.refreshToken) {
          window.location.replace("/login");
        }
        const newToken = await authApi.refreshToken({ refreshToken: state.refreshToken });
        store.dispatch(setAuthToken(newToken));
        processQueue(undefined, newToken);
        return http(originalRequest as AxiosRequestConfig);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default http;
