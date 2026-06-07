import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http as axios } from "@/lib/http";
import { IBackendRes } from "@/types/global";

export enum RentalOrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID_RENTAL_FEE = "PAID_RENTAL_FEE",
  WAITING_PICKUP = "WAITING_PICKUP",
  RENTING = "RENTING",
  RETURNED = "RETURNED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum DeviceStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  RENTED = "RENTED",
  MAINTENANCE = "MAINTENANCE",
  DAMAGED = "DAMAGED",
  LOST = "LOST"
}

export enum ContractStatus {
  DRAFT = "DRAFT",
  SIGNED = "SIGNED",
  CANCELLED = "CANCELLED"
}

export enum DepositStatus {
  NOT_COLLECTED = "NOT_COLLECTED",
  PAID = "PAID",
  PARTIALLY_DEDUCTED = "PARTIALLY_DEDUCTED",
  FULLY_DEDUCTED = "FULLY_DEDUCTED",
  REFUNDED = "REFUNDED"
}

export enum RiskLevel {
  LOW_RISK = "LOW_RISK",
  MEDIUM_RISK = "MEDIUM_RISK",
  HIGH_RISK = "HIGH_RISK"
}
export interface PaginationMeta {
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
}

export interface RentalOrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productMainImageUrl?: string;
  deviceId?: number;
  deviceSerialNumber?: string;
  pricePerDay: number;
  conditionBeforeHandover?: string;
  conditionAfterReturn?: string;
}

export interface RentalContractResponse {
  id: number;
  contractNumber: string;
  contractVersion: number;
  termsAndConditions: string;
  contractHash?: string;
  signedAt?: string;
  signerUserId?: number;
  signerIp?: string;
  isLocked: boolean;
  locked?: boolean;
  status: ContractStatus;
  lessorSignature?: string;
  lessorSignedAt?: string;
  generatedAt?: string;
}

export interface RentalHandoverReportResponse {
  id: number;
  serialNumber: string;
  bodyCondition: string;
  lensCondition: string;
  batteryCondition: string;
  accessoryCondition: string;
  riskLevel: RiskLevel;
  finalDepositAmount: number;
  depositPaymentMethod: string;
  note?: string;
  staffName?: string;
  createdAt: string;
}

export interface RentalReturnReportResponse {
  id: number;
  returnDate: string;
  bodyConditionAfter: string;
  lensConditionAfter: string;
  batteryConditionAfter: string;
  accessoryConditionAfter: string;
  lateDays: number;
  lateFee: number;
  damageFee: number;
  missingAccessoryFee: number;
  totalPenalty: number;
  refundAmount: number;
  extraPaymentAmount: number;
  note?: string;
  staffName?: string;
  createdAt: string;
}

export interface RentalOrderResponse {
  id: number;
  code: string;
  userId: number;
  userEmail: string;
  userPhone: string;
  startDate: string;
  endDate: string;
  status: RentalOrderStatus;
  rentalFee: number;
  estimatedDepositAmount?: number;
  finalDepositAmount?: number;
  additionalFee: number;
  depositStatus?: DepositStatus;
  riskLevel?: RiskLevel;
  paymentMethod: "COD" | "ONLINE" | "CASH" | "BANK_TRANSFER" | "POS";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  refundStatus?: "PENDING" | "SUCCESS" | "FAILED";
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  handedOverAt?: string;
  returnedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  items: RentalOrderItemResponse[];
  contract?: RentalContractResponse;
  handoverReport?: RentalHandoverReportResponse;
  returnReport?: RentalReturnReportResponse;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceResponse {
  id: number;
  productId: number;
  productName: string;
  serialNumber: string;
  status: DeviceStatus;
  conditionDetails?: string;
  createdAt: string;
  updatedAt: string;
}

// ----- DTOs -----
export interface PrepareRentalRequest {
  itemDeviceAssignments: Record<number, number>; // itemId -> deviceId
  estimatedDepositAmount?: number;
  riskLevel?: RiskLevel;
}

export interface HandoverReportRequest {
  serialNumber: string;
  bodyCondition: string;
  lensCondition: string;
  batteryCondition: string;
  accessoryCondition: string;
  riskLevel: RiskLevel;
  finalDepositAmount: number;
  note?: string;
  itemConditions?: Record<number, string>;
}

export interface CollectDepositRequest {
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "POS";
}

export interface HandoverDevicesRequest {
  note?: string;
}

export interface ReturnReportRequest {
  returnDate: string;
  bodyConditionAfter: string;
  lensConditionAfter: string;
  batteryConditionAfter: string;
  accessoryConditionAfter: string;
  lateDays: number;
  lateFee: number;
  damageFee: number;
  missingAccessoryFee: number;
  note?: string;
  itemConditions?: Record<number, string>;
}

export interface CompleteRentalRequest {
  refundMethod: "CASH" | "BANK_TRANSFER";
  note?: string;
}

export const rentalService = {
  // USER
  checkAvailability: async (productId: number, startDate: string, endDate: string, quantity = 1): Promise<{ success: boolean; data: boolean }> => {
    const response = await axios.get<{ success: boolean; data: boolean }>(`/rentals/products/${productId}/availability`, {
      params: { startDate, endDate, quantity }
    });
    return response.data;
  },

  checkout: async (data: {
    items: { productId: number; quantity: number }[];
    startDate: string;
    endDate: string;
    pickupTimeSlot?: string;
    paymentMethod: "COD" | "ONLINE";
  }): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>("/rentals/checkout", data);
    return response.data;
  },

  getMyRentals: async (params: { page?: number; size?: number; status?: RentalOrderStatus }): Promise<{ success: boolean; data: RentalOrderResponse[]; meta?: PaginationMeta }> => {
    const response = await axios.get<{ success: boolean; data: RentalOrderResponse[]; meta?: PaginationMeta }>("/rentals/my", { params });
    return response.data;
  },

  getRentalDetail: async (id: number): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.get<{ success: boolean; data: RentalOrderResponse }>(`/rentals/${id}`);
    return response.data;
  },

  getContract: async (id: number): Promise<{ success: boolean; data: RentalContractResponse }> => {
    const response = await axios.get<{ success: boolean; data: RentalContractResponse }>(`/rentals/${id}/contract`);
    return response.data;
  },

  sendSigningOtp: async (id: number): Promise<{ success: boolean; data: null }> => {
    const response = await axios.post<{ success: boolean; data: null }>(`/rentals/${id}/contract/send-otp`);
    return response.data;
  },

  signContract: async (id: number, data: { signature: string; otpCode: string }): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/${id}/contract/sign`, data);
    return response.data;
  },

  // STAFF
  getStaffRentals: async (params: { page?: number; size?: number; status?: RentalOrderStatus }): Promise<{ success: boolean; data: RentalOrderResponse[]; meta?: PaginationMeta }> => {
    const response = await axios.get<{ success: boolean; data: RentalOrderResponse[]; meta?: PaginationMeta }>("/rentals/staff", { params });
    return response.data;
  },

  getStaffRentalDetail: async (id: number): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.get<{ success: boolean; data: RentalOrderResponse }>(`/rentals/staff/${id}`);
    return response.data;
  },

  prepareRental: async (id: number, req: PrepareRentalRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/staff/${id}/prepare`, req);
    return response.data;
  },

  createHandoverReport: async (id: number, req: HandoverReportRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/staff/${id}/handover-report`, req);
    return response.data;
  },

  collectDeposit: async (id: number, req: CollectDepositRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/staff/${id}/collect-deposit`, req);
    return response.data;
  },

  handoverDevices: async (id: number, req?: HandoverDevicesRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/staff/${id}/handover`, req);
    return response.data;
  },

  createReturnReport: async (id: number, req: ReturnReportRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/staff/${id}/return-report`, req);
    return response.data;
  },

  completeRental: async (id: number, req: CompleteRentalRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/staff/${id}/complete`, req);
    return response.data;
  },




  getAvailableDevices: async (productId: number): Promise<{ success: boolean; data: DeviceResponse[] }> => {
    const response = await axios.get<{ success: boolean; data: DeviceResponse[] }>(`/rentals/admin/products/${productId}/devices/available`);
    return response.data;
  },

  getDevicesByProduct: async (productId: number): Promise<{ success: boolean; data: DeviceResponse[] }> => {
    const response = await axios.get<{ success: boolean; data: DeviceResponse[] }>(`/rentals/admin/products/${productId}/devices`);
    return response.data;
  },

  createDevice: async (req: { productId: number; serialNumber: string; conditionDetails: string }): Promise<{ success: boolean; data: DeviceResponse }> => {
    const response = await axios.post<{ success: boolean; data: DeviceResponse }>(`/rentals/admin/devices`, req);
    return response.data;
  },

  updateDevice: async (id: number, req: { status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "BROKEN"; conditionDetails: string }): Promise<{ success: boolean; data: DeviceResponse }> => {
    const response = await axios.put<{ success: boolean; data: DeviceResponse }>(`/rentals/admin/devices/${id}`, req);
    return response.data;
  }
};

// React Query Hooks
export const useMyRentals = (params: { page?: number; size?: number; status?: RentalOrderStatus }) => {
  return useQuery({
    queryKey: ["rentals", "my", params],
    queryFn: () => rentalService.getMyRentals(params)
  });
};

export const useRentalDetail = (id: number) => {
  return useQuery({
    queryKey: ["rentals", "detail", id],
    queryFn: () => rentalService.getRentalDetail(id),
    enabled: !!id
  });
};

export const useSendSigningOtp = () => {
  return useMutation({
    mutationFn: (id: number) => rentalService.sendSigningOtp(id)
  });
};

export const useSignContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, signature, otpCode }: { id: number; signature: string; otpCode: string }) =>
      rentalService.signContract(id, { signature, otpCode }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["rentals", "detail", variables.id] });
    }
  });
};

export const useStaffRentals = (params: { page?: number; size?: number; status?: RentalOrderStatus }) => {
  return useQuery({
    queryKey: ["rentals", "staff", params],
    queryFn: () => rentalService.getStaffRentals(params)
  });
};

export const useStaffRentalDetail = (id: number) => {
  return useQuery({
    queryKey: ["rentals", "staff", "detail", id],
    queryFn: () => rentalService.getStaffRentalDetail(id),
    enabled: !!id
  });
};

export const usePrepareRental = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: PrepareRentalRequest }) => rentalService.prepareRental(id, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rentals"] })
  });
};

export const useCreateHandoverReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: HandoverReportRequest }) => rentalService.createHandoverReport(id, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rentals"] })
  });
};

export const useCollectDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CollectDepositRequest }) => rentalService.collectDeposit(id, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rentals"] })
  });
};

export const useHandoverDevices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req?: HandoverDevicesRequest }) => rentalService.handoverDevices(id, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rentals"] })
  });
};

export const useCreateReturnReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: ReturnReportRequest }) => rentalService.createReturnReport(id, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rentals"] })
  });
};

export const useCompleteRental = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CompleteRentalRequest }) => rentalService.completeRental(id, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rentals"] })
  });
};


export const useGetDevicesByProduct = (productId: number) => {
  return useQuery({
    queryKey: ["devices", productId],
    queryFn: () => rentalService.getDevicesByProduct(productId),
    enabled: !!productId
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rentalService.createDevice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["devices", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
};

export const useUpdateDevice = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: Parameters<typeof rentalService.updateDevice>[1] }) => rentalService.updateDevice(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
};


export const useAvailableDevices = (productId: number) => {
  return useQuery({
    queryKey: ["devices", "available", productId],
    queryFn: () => rentalService.getAvailableDevices(productId),
    enabled: !!productId
  });
};
