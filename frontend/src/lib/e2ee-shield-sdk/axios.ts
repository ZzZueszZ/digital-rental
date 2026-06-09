// src/libs/ts-sdk/axios.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const baseAxios = axios.create({
  baseURL: API_BASE,
});
