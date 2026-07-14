import { isAxiosError } from "axios";
import { MAX_IMAGE_BYTES } from "./ekyc-constants";

export function dataUrlToFile(dataUrl: string, filename: string) {
  const [metadata, content] = dataUrl.split(",");
  const mimeType = metadata.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], filename, { type: mimeType });
}

export function getSupportedVideoMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return (
    ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    ) ?? ""
  );
}

export function getVideoExtension(mimeType: string) {
  return mimeType.includes("mp4") ? "mp4" : "webm";
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function revokePreviewUrl(url: string | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function formatScore(score: number | undefined) {
  return typeof score === "number" ? `${(score * 100).toFixed(1)}%` : "Chưa có";
}

export function getAssetImageUrl(url: string | null | undefined) {
  if (!url) return "";
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.lenshub.shop/api";
  const baseUrl = apiUrl.replace(/\/api$/, "");
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

export function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ chấp nhận tệp hình ảnh.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ảnh phải có dung lượng không quá 10 MB.");
  }
}
