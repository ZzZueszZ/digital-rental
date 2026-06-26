import { http } from "@/lib/http";

export type FileAssetPurpose =
  | "PRODUCT_IMAGE"
  | "REVIEW_IMAGE"
  | "AVATAR"
  | "KYC_ID_FRONT"
  | "KYC_ID_BACK"
  | "KYC_SELFIE"
  | "KYC_LIVENESS_VIDEO"
  | "CONTRACT_PDF";

export interface FileAsset {
  id: string;
  purpose: FileAssetPurpose;
  contentType: string;
  sizeBytes: number;
  status: "PENDING" | "READY" | "FAILED" | "DELETED";
  createdAt: string;
}

export interface PresignedUpload {
  assetId: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const fileService = {
  async presignUpload(file: File, purpose: FileAssetPurpose): Promise<PresignedUpload> {
    const response = await http.post<ApiResponse<PresignedUpload>>("/files/presign-upload", {
      purpose,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });
    return response.data.data;
  },

  async complete(assetId: string): Promise<FileAsset> {
    const response = await http.post<ApiResponse<FileAsset>>(`/files/${assetId}/complete`);
    return response.data.data;
  },

  async getDownloadUrl(assetId: string): Promise<string> {
    const response = await http.get<ApiResponse<{ downloadUrl: string }>>(
      `/files/${assetId}/download-url`,
    );
    return response.data.data.downloadUrl;
  },

  async delete(assetId: string): Promise<void> {
    await http.delete(`/files/${assetId}`);
  },
};

export const uploadFileAsset = async (
  file: File,
  purpose: FileAssetPurpose,
  onProgress?: (progress: number) => void,
): Promise<FileAsset> => {
  const upload = await fileService.presignUpload(file, purpose);
  await putToStorage(upload.uploadUrl, upload.requiredHeaders, file, onProgress);
  return fileService.complete(upload.assetId);
};

const putToStorage = (
  uploadUrl: string,
  headers: Record<string, string>,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    Object.entries(headers).forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed with status ${request.status}`));
      }
    };
    request.onerror = () => reject(new Error("Storage upload failed"));
    request.send(file);
  });
