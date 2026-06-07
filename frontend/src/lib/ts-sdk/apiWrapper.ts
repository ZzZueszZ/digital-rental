// src/libs/ts-sdk/apiWrapper.ts
import { AxiosHeaders } from "axios";
import { baseAxios } from "./axios";
import { b64u } from "./base64url";
import { aesGcmDecrypt, aesGcmEncrypt } from "./crypto";
import { getSession } from "./keyManager";

export const secureApi = baseAxios;

// REQUEST: encrypt body
secureApi.interceptors.request.use(async (config) => {
  // Nếu không có body (GET, v.v.) thì cho qua
  if (!config.data) return config;

  const session = await getSession();

  const method = (config.method || "get").toUpperCase();
  const path = new URL(
    config.url || "/",
    config.baseURL || window.location.origin
  ).pathname;

  const aadObj = {
    sessionId: session.sessionId,
    method,
    path,
    ts: Date.now(),
  };

  const { iv, ct, tag, aadBytes } = await aesGcmEncrypt(
    session.key,
    config.data,
    aadObj
  );

  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set("content-type", "application/json");
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

// RESPONSE: decrypt nếu payload mã hóa
secureApi.interceptors.response.use(
  async (response) => {
    const data = response.data;
    if (!data || !data.aad || !data.iv || !data.cipherText || !data.tag) {
      return response; // không phải payload mã hóa
    }

    const session = await getSession();

    const aadBytes = b64u.dec(data.aad);
    const ivBytes = b64u.dec(data.iv);
    const ctBytes = b64u.dec(data.cipherText);
    const tagBytes = b64u.dec(data.tag);

    const plain = await aesGcmDecrypt(
      session.key,
      ivBytes,
      ctBytes,
      tagBytes,
      aadBytes
    );

    response.data = plain; // từ đây FE thấy JSON plaintext
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
