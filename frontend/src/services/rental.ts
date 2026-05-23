import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http as axios } from "@/lib/http";

export enum RentalOrderStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  REJECTED = "REJECTED",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID_DEPOSIT = "PAID_DEPOSIT",
  CONTRACT_SIGNED = "CONTRACT_SIGNED",
  DEVICE_HANDED_OVER = "DEVICE_HANDED_OVER",
  RETURNED = "RETURNED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED"
}

export enum DeviceStatus {
  AVAILABLE = "AVAILABLE",
  RENTED = "RENTED",
  UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
  DAMAGED = "DAMAGED",
  LOST = "LOST"
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
  termsAndConditions: string;
  customerSignature?: string;
  signedAt?: string;
  isLocked: boolean;
}

export interface RentalOrderResponse {
  id: number;
  code: string;
  userId: number;
  userEmail: string;
  startDate: string;
  endDate: string;
  status: RentalOrderStatus;
  rentalFee: number;
  depositAmount: number;
  additionalFee: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  refundStatus: "UNPAID" | "PAID";
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  handedOverAt?: string;
  returnedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  items: RentalOrderItemResponse[];
  contract?: RentalContractResponse;
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

export interface ApproveRentalRequest {
  depositAmount: number;
  itemDeviceAssignments: Record<number, number>; // itemId -> deviceId
}

export interface HandoverRentalRequest {
  inspectorName: string;
  itemConditions: Record<number, string>; // itemId -> condition notes
}

export interface ReturnRentalRequest {
  inspectorName: string;
  damageFee: number;
  itemConditions: Record<number, string>; // itemId -> condition notes
}

export interface DeviceRequest {
  productId: number;
  serialNumber: string;
  status?: DeviceStatus;
  conditionDetails?: string;
}

export const rentalService = {
  // Check Product Availability
  checkAvailability: async (productId: number, startDate: string, endDate: string, quantity = 1): Promise<{ success: boolean; data: boolean }> => {
    const response = await axios.get<{ success: boolean; data: boolean }>(`/rentals/products/${productId}/availability`, {
      params: { startDate, endDate, quantity }
    });
    return response.data;
  },

  // Create Rental Order
  checkout: async (data: {
    items: { productId: number; quantity: number }[];
    startDate: string;
    endDate: string;
    shippingAddressId?: number;
    shippingName?: string;
    shippingPhone?: string;
    shippingAddress?: string;
    paymentMethod: "COD" | "ONLINE";
  }): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>("/rentals/checkout", data);
    return response.data;
  },

  // Get My Rental Orders
  getMyRentals: async (params: { page?: number; size?: number; status?: RentalOrderStatus }): Promise<{ success: boolean; data: RentalOrderResponse[]; meta?: any }> => {
    const response = await axios.get<{ success: boolean; data: RentalOrderResponse[]; meta?: any }>("/rentals/my", { params });
    return response.data;
  },

  // Get Rental Order Detail
  getRentalDetail: async (id: number): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.get<{ success: boolean; data: RentalOrderResponse }>(`/rentals/${id}`);
    return response.data;
  },

  // Sign Contract
  signContract: async (id: number, signature: string): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/${id}/contract/sign`, signature, {
      headers: { "Content-Type": "text/plain" }
    });
    return response.data;
  },

  // Admin/Staff: Get All Rentals
  getAllRentals: async (params: { page?: number; size?: number; status?: RentalOrderStatus }): Promise<{ success: boolean; data: RentalOrderResponse[]; meta?: any }> => {
    const response = await axios.get<{ success: boolean; data: RentalOrderResponse[]; meta?: any }>("/rentals/admin", { params });
    return response.data;
  },

  // Admin/Staff: Approve Rental and assign device serials
  approveRental: async (id: number, req: ApproveRentalRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/admin/${id}/approve`, req);
    return response.data;
  },

  // Admin/Staff: Record cash deposit payment / simulate VNPAY callback
  payDeposit: async (id: number): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/admin/${id}/pay-deposit`);
    return response.data;
  },

  // Admin/Staff: Reject rental request
  rejectRental: async (id: number, reason: string): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/admin/${id}/reject`, reason, {
      headers: { "Content-Type": "text/plain" }
    });
    return response.data;
  },

  // Admin/Staff: Confirm handover
  handoverDevices: async (id: number, req: HandoverRentalRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/admin/${id}/handover`, req);
    return response.data;
  },

  // Admin/Staff: Confirm return
  returnDevices: async (id: number, req: ReturnRentalRequest): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/admin/${id}/return`, req);
    return response.data;
  },

  // Admin/Staff: Settle additions and complete/refund
  settleAndComplete: async (id: number): Promise<{ success: boolean; data: RentalOrderResponse }> => {
    const response = await axios.post<{ success: boolean; data: RentalOrderResponse }>(`/rentals/admin/${id}/settle`);
    return response.data;
  },

  // Admin: Create new inventory physical device
  createDevice: async (req: DeviceRequest): Promise<{ success: boolean; data: DeviceResponse }> => {
    const response = await axios.post<{ success: boolean; data: DeviceResponse }>("/rentals/admin/devices", req);
    return response.data;
  },

  // Admin: Update inventory device
  updateDevice: async (id: number, req: DeviceRequest): Promise<{ success: boolean; data: DeviceResponse }> => {
    const response = await axios.put<{ success: boolean; data: DeviceResponse }>(`/rentals/admin/devices/${id}`, req);
    return response.data;
  },

  // Admin: Get physical devices of product
  getDevicesByProduct: async (productId: number): Promise<{ success: boolean; data: DeviceResponse[] }> => {
    const response = await axios.get<{ success: boolean; data: DeviceResponse[] }>(`/rentals/admin/products/${productId}/devices`);
    return response.data;
  },

  // Admin: Get AVAILABLE physical devices of product
  getAvailableDevices: async (productId: number): Promise<{ success: boolean; data: DeviceResponse[] }> => {
    const response = await axios.get<{ success: boolean; data: DeviceResponse[] }>(`/rentals/admin/products/${productId}/devices/available`);
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

export const useSignContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, signature }: { id: number; signature: string }) =>
      rentalService.signContract(id, signature),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    }
  });
};

export const useAllRentalsForAdmin = (params: { page?: number; size?: number; status?: RentalOrderStatus }) => {
  return useQuery({
    queryKey: ["rentals", "admin", params],
    queryFn: () => rentalService.getAllRentals(params)
  });
};

export const useApproveRental = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: ApproveRentalRequest }) =>
      rentalService.approveRental(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    }
  });
};

export const useRejectRental = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      rentalService.rejectRental(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    }
  });
};

export const usePayDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rentalService.payDeposit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    }
  });
};

export const useHandoverDevices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: HandoverRentalRequest }) =>
      rentalService.handoverDevices(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    }
  });
};

export const useReturnDevices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: ReturnRentalRequest }) =>
      rentalService.returnDevices(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    }
  });
};

export const useSettleAndComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rentalService.settleAndComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    }
  });
};

export const useProductDevices = (productId: number) => {
  return useQuery({
    queryKey: ["devices", "product", productId],
    queryFn: () => rentalService.getDevicesByProduct(productId),
    enabled: !!productId
  });
};

export const useAvailableDevices = (productId: number) => {
  return useQuery({
    queryKey: ["devices", "available", productId],
    queryFn: () => rentalService.getAvailableDevices(productId),
    enabled: !!productId
  });
};
