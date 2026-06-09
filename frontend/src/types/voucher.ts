
export type VoucherType = "PERCENTAGE" | "FIXED_AMOUNT";
export type VoucherScope = "GLOBAL" | "CATEGORY" | "PRODUCT";
export type VoucherStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface VoucherResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  type: VoucherType;
  scope: VoucherScope;
  discountValue: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  maxUsagePerUser: number;
  maxUsage: number;
  usedCount: number;
  status: VoucherStatus;
  startDate: string;
  endDate: string;
}

export interface VoucherCreateRequest {
  code: string;
  name: string;
  description?: string;
  type: VoucherType;
  scope?: VoucherScope;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  maxUsagePerUser?: number;
  maxUsage?: number;
  startDate?: string;
  endDate?: string;
}

export interface VoucherUpdateRequest {
  name?: string;
  description?: string;
  type?: VoucherType;
  scope?: VoucherScope;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  maxUsagePerUser?: number;
  maxUsage?: number;
  startDate?: string;
  endDate?: string;
}

export interface VoucherApplyRequest {
  code: string;
  cartTotal: number;
}

export interface VoucherApplyResponse {
  valid: boolean;
  message: string;
  cartTotal: number;
  discountAmount: number;
  finalPayable: number;
}
