import { IBackendRes } from "./global";

export type City = string; // Will refine if enum values are provided

export interface ShippingAddressRequest {
  receiverName: string;
  receiverPhone: string;
  fullAddress: string;
  province?: City;
  district?: string;
  ward?: string;
  detailAddress?: string;
  setAsDefault?: boolean;
}

export interface ShippingAddressResponse {
  id: number;
  receiverName: string;
  receiverPhone: string;
  fullAddress: string;
  province: City;
  provinceDisplayName: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IAddressesRes = IBackendRes<ShippingAddressResponse[]>;
export type IAddressRes = IBackendRes<ShippingAddressResponse>;
