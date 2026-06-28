import { IBackendRes } from "./global";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export enum PaymentMethod {
  COD = "COD",
  ONLINE = "ONLINE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface CheckoutItemRequest {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItemRequest[];
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingAddressId?: number;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
}

export interface CheckoutFromCartRequest {
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingAddressId?: number;
  paymentMethod: PaymentMethod;
  cartItemIds?: number[];
  voucherCode?: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productMainImage: string | null;
  mainImageUrl?: string | null;
  productMainImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  code: string;
  userId: number;
  userEmail: string;
  totalPrice: number;
  discountAmount: number;
  shippingFee: number;
  shippingDiscount: number;
  voucherCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  canceledAt?: string;
  createdAt: string;
  cancelReason?: string;
  canceledBy?: "CUSTOMER" | "STAFF_OR_ADMIN" | "STAFF" | "ADMIN" | "SYSTEM" | string;
  refundRequired?: boolean;
  refundNote?: string;
  isReviewed?: boolean;
  items: OrderItemResponse[];
}

export type IOrderRes = IBackendRes<OrderResponse>;
export type IOrderListRes = IBackendRes<OrderResponse[]>;
