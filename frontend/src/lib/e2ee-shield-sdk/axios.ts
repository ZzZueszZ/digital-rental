// src/libs/ts-sdk/axios.ts
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.lenshub.shop/api";

export const baseAxios = axios.create({
  baseURL: API_BASE,
});
