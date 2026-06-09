import { IBackendRes } from "./global.d";

export enum ReviewAction {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  REQUEST_MORE_INFO = "REQUEST_MORE_INFO",
}

export interface ReviewResponse {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  productId: number;
  productName?: string; // Added for UI convenience
  productImage?: string; // Added for UI convenience
  orderId: number;
  rating: number;
  content: string;
  hidden: boolean;
  reporterCount: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCreateRequest {
  productId: number;
  orderId?: number;
  rating: number;
  content: string;
}

export interface ReviewUpdateRequest {
  rating?: number;
  content?: string;
}

export interface ReviewListResponse {
  reviews: ReviewResponse[];
  averageRating: number;
  totalReviews: number;
}
