import { IBackendRes } from "./global";

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface RemoveCartItemsRequest {
  cartItemIds: number[];
}

export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null;
  mainImageUrl?: string | null;
  rentPricePerDay: number;
  salePrice: number;
  quantity: number;
  availableStock: number;
}

export type ICartRes = IBackendRes<CartItemResponse[]>;
export type ICartItemRes = IBackendRes<CartItemResponse>;
