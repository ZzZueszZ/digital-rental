import { http } from "@/lib/http";

export interface KycSessionResponse {
  id: number;
  userId: number;
  userEmail: string;
  status: "NOT_STARTED" | "STARTED" | "SUBMITTED" | "APPROVED" | "REJECTED";
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
  ocrConfidence?: number;
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieImageUrl?: string;
}

export interface SubmitKycRequest {
  identityNumber: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string; // MALE, FEMALE, OTHER
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  issuedDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
}

export interface ResolveKycRequest {
  approved: boolean;
  note?: string;
}

export const identityService = {
  initiateKyc: async () => {
    const res = await http.post<{ success: boolean; data: KycSessionResponse }>("/identity/ekyc/initiate");
    return res.data.data;
  },

  submitKyc: async (req: SubmitKycRequest) => {
    const res = await http.post<{ success: boolean; data: KycSessionResponse }>("/identity/ekyc/submit", req);
    return res.data.data;
  },

  getKycStatus: async () => {
    const res = await http.get<{ success: boolean; data: KycSessionResponse }>("/identity/ekyc/status");
    return res.data.data;
  },

  getPendingKycSessions: async (page = 0, size = 10) => {
    const res = await http.get<{ success: boolean; data: KycSessionResponse[]; meta?: any }>(
      `/identity/admin/ekyc/pending?page=${page}&size=${size}`
    );
    return res.data;
  },

  resolveKycSession: async (sessionId: number, req: ResolveKycRequest) => {
    const res = await http.post<{ success: boolean; data: KycSessionResponse }>(
      `/identity/admin/ekyc/${sessionId}/resolve`,
      req
    );
    return res.data.data;
  },
};
