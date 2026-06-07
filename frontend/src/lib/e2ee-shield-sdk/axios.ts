// src/libs/ts-sdk/axios.ts
import axios from "axios";

const BE_BASE = process.env.NEXT_PUBLIC_BE || "http://localhost:8080";

export const baseAxios = axios.create({
  baseURL: BE_BASE,
});
