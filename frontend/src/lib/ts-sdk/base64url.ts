// src/libs/ts-sdk/base64url.ts
export const b64u = {
  enc(buf: ArrayBuffer | Uint8Array): string {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return Buffer.from(u8)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  },

  dec(s: string): Uint8Array {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return Uint8Array.from(Buffer.from(b64, "base64"));
  },
};
