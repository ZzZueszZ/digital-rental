import axios from "axios";
import "dotenv/config";

const instance = axios.create({
  baseURL: process.env.NEXT_BASE_BE || "http://localhost:8080/api",
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const AUTH_WHITELIST = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
  "/auth/verify-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
];

instance.interceptors.request.use(
  function (config) {
    const rawUrl = config.url ?? "";
    let pathname = rawUrl;
    try {
      const u = new URL(rawUrl, config.baseURL || "http://localhost");
      pathname = u.pathname;
    } catch {}

    if (AUTH_WHITELIST.some((p) => pathname.startsWith(p))) {
      if (config.headers) {
        delete (config.headers as any)["Authorization"];
      }
      return config;
    }

    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any)["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    if (response && response.data) return response.data;
    return response;
  },
  function (error) {
    if (error && error.response && error.response.data) {
      return error.response.data;
    }
    return Promise.reject(error);
  }
);

export default instance;
