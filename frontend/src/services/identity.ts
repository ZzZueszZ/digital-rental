import { http } from "@/lib/http";

export interface KycSessionResponse {
  id: number;
  userId: number;
  userEmail: string;
  status: "CREATED" | "UPLOADING" | "PROCESSING" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "FAILED" | "CANCELLED" | "NOT_STARTED";
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  failureReason?: string;
  reviewNote?: string;
  identityNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  placeOfOrigin?: string;
  placeOfResidence?: string;
  issuedDate?: string;
  expiryDate?: string;
  faceMatchScore?: number;
  faceMatchPassed?: boolean;
  livenessScore?: number;
  livenessPassed?: boolean;
  spoofDetected?: boolean;
  multipleFacesDetected?: boolean;
  ocrConfidence?: number;
  riskScore?: number;
  riskLevel?: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK";
  riskReason?: string;
  manualReviewRequired?: boolean;
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieImageUrl?: string;
  livenessVideoUrl?: string;
}

export interface SubmitKycRequest {
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  livenessVideoUrl: string;
}

export interface OcrPreviewRequest {
  frontImageUrl: string;
  backImageUrl: string;
}

export interface KycOcrPreviewResponse {
  sessionId: number;
  frontImageUrl: string;
  backImageUrl: string;
  identityNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  placeOfOrigin?: string;
  placeOfResidence?: string;
  issuedDate?: string;
  expiryDate?: string;
  ocrConfidence?: number;
  documentType?: string;
  successful?: boolean;
  previewStatus?: "READY" | "NEEDS_REVIEW";
  warnings?: string[];
}

export interface ResolveKycRequest {
  approved: boolean;
  note?: string;
}

export const identityService = {
  initiateKyc: async () => {
    const res = await http.post<{ success: boolean; data: KycSessionResponse }>("/ekyc/initiate");
    return res.data.data;
  },

  submitKyc: async (req: SubmitKycRequest) => {
    const res = await http.post<{ success: boolean; data: KycSessionResponse }>("/ekyc/submit", req);
    return res.data.data;
  },

  previewOcr: async (req: OcrPreviewRequest) => {
    const res = await http.post<{ success: boolean; data: KycOcrPreviewResponse }>("/ekyc/ocr-preview", req);
    return res.data.data;
  },

  getKycStatus: async () => {
    const res = await http.get<{ success: boolean; data: KycSessionResponse }>("/ekyc/status");
    return res.data.data;
  },

  getPendingKycSessions: async (page = 0, size = 10) => {
    const res = await http.get<IBackendRes<KycSessionResponse[]>>(
      `/admin/ekyc/pending?page=${page}&size=${size}`
    );
    return res.data;
  },

  resolveKycSession: async (sessionId: number, req: ResolveKycRequest) => {
    const endpoint = req.approved ? `/admin/ekyc/${sessionId}/approve` : `/admin/ekyc/${sessionId}/reject`;
    const res = await http.put<{ success: boolean; data: KycSessionResponse }>(
      endpoint,
      { note: req.note }
    );
    return res.data.data;
  },

  uploadFront: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await http.post<{ success: boolean; data: { url: string } }>("/ekyc/upload-front", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url;
  },

  uploadBack: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await http.post<{ success: boolean; data: { url: string } }>("/ekyc/upload-back", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url;
  },

  uploadSelfie: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await http.post<{ success: boolean; data: { url: string } }>("/ekyc/upload-selfie", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url;
  },

  uploadLivenessVideo: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await http.post<{ success: boolean; data: { url: string } }>("/ekyc/upload-liveness-video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url;
  },
};
