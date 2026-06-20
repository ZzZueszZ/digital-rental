import { IBackendRes } from "./global";
import { PaymentMethod, PaymentStatus } from "./order";

export enum RentalOrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID_RENTAL_FEE = "PAID_RENTAL_FEE",
  WAITING_PICKUP = "WAITING_PICKUP",
  RENTING = "RENTING",
  RETURNED = "RETURNED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum DepositStatus {
  NOT_COLLECTED = "NOT_COLLECTED",
  PAID = "PAID",
  PARTIALLY_DEDUCTED = "PARTIALLY_DEDUCTED",
  FULLY_DEDUCTED = "FULLY_DEDUCTED",
  REFUNDED = "REFUNDED",
}

export enum RiskLevel {
  LOW_RISK = "LOW_RISK",
  MEDIUM_RISK = "MEDIUM_RISK",
  HIGH_RISK = "HIGH_RISK",
}

export enum ContractStatus {
  DRAFT = "DRAFT",
  SIGNED = "SIGNED",
  CANCELLED = "CANCELLED",
}

export interface RentalOrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productMainImage: string;
  deviceId?: number;
  deviceSerialNumber?: string;
  deviceConditionDetails?: string;
  assetValue?: number;
  pricePerDay: number;
  conditionBeforeHandover?: string;
  conditionAfterReturn?: string;
}

export interface RentalOrderResponse {
  id: number;
  code: string;
  userId: number;
  userFullName?: string;
  userEmail: string;
  userPhone: string;
  identityNumber?: string;
  identityIssuedDate?: string;
  identityIssuedPlace?: string;
  permanentAddress?: string;
  currentAddress?: string;
  verificationLevel?: string;
  
  startDate: string;
  endDate: string;
  status: RentalOrderStatus;
  
  rentalFee: number;
  estimatedDepositAmount?: number;
  finalDepositAmount?: number;
  additionalFee?: number;
  
  depositStatus?: DepositStatus;
  riskLevel?: RiskLevel;
  
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  refundStatus?: PaymentStatus;
  
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  
  handedOverAt?: string;
  returnedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  createdAt: string;
  
  items: RentalOrderItemResponse[];
}

export type IRentalOrderRes = IBackendRes<RentalOrderResponse>;
export type IRentalOrderListRes = IBackendRes<RentalOrderResponse[]>;
