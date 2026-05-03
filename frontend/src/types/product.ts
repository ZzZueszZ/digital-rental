export interface ProductSpecificationDto {
  specKey: string;
  specValue: string;
}

export interface ProductSpecificationResponse {
  id: number;
  specKey: string;
  specValue: string;
}

export interface GalleryImageResponse {
  id: number;
  url: string;
}

export interface PriceHistoryResponse {
  id: number;
  priceType: "RENT" | "SALE";
  oldPrice: number;
  newPrice: number;
  percentChange: number;
  changeType: "INCREASE" | "DECREASE" | "NONE";
  changedBy: string;
  createdAt: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  rentPricePerDay: number;
  salePrice: number;
  isForRent: boolean;
  isForSale: boolean;
  mainImageUrl: string;
  brand: string;
  specifications: ProductSpecificationResponse[];
  quantity: number;
  active: boolean;
  categoryId: number;
  categoryName: string;
  gallery: GalleryImageResponse[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ProductCriteria {
  name?: string;
  categories?: string[];
  brand?: string;
  minRentPrice?: number;
  maxRentPrice?: number;
  minSalePrice?: number;
  maxSalePrice?: number;
  isForRent?: boolean;
  isForSale?: boolean;
  isActive?: boolean;
}

export interface ProductRequest {
  name: string;
  description?: string;
  rentPricePerDay?: number;
  salePrice?: number;
  isForRent?: boolean;
  isForSale?: boolean;
  brand?: string;
  specifications?: ProductSpecificationDto[];
  categoryId?: number;
}

export interface ProductInfoUpdateRequest {
  name?: string;
  description?: string;
  brand?: string;
  specifications?: ProductSpecificationDto[];
  categoryId?: number;
}

export interface ProductPriceUpdateRequest {
  rentPricePerDay?: number;
  salePrice?: number;
  isForRent?: boolean;
  isForSale?: boolean;
}
