import { IBackendRes } from "./global";

export enum City {
  TUYEN_QUANG = "TUYEN_QUANG",
  LAO_CAI = "LAO_CAI",
  THAI_NGUYEN = "THAI_NGUYEN",
  PHU_THO = "PHU_THO",
  BAC_NINH = "BAC_NINH",
  HUNG_YEN = "HUNG_YEN",
  HAI_PHONG = "HAI_PHONG",
  NINH_BINH = "NINH_BINH",
  QUANG_TRI = "QUANG_TRI",
  DA_NANG = "DA_NANG",
  QUANG_NGAI = "QUANG_NGAI",
  GIA_LAI = "GIA_LAI",
  KHANH_HOA = "KHANH_HOA",
  LAM_DONG = "LAM_DONG",
  DAK_LAK = "DAK_LAK",
  HO_CHI_MINH = "HO_CHI_MINH",
  DONG_NAI = "DONG_NAI",
  TAY_NINH = "TAY_NINH",
  CAN_THO = "CAN_THO",
  VINH_LONG = "VINH_LONG",
  DONG_THAP = "DONG_THAP",
  CA_MAU = "CA_MAU",
  AN_GIANG = "AN_GIANG",
  HA_NOI = "HA_NOI",
  HUE = "HUE",
  LAI_CHAU = "LAI_CHAU",
  DIEN_BIEN = "DIEN_BIEN",
  SON_LA = "SON_LA",
  LANG_SON = "LANG_SON",
  QUANG_NINH = "QUANG_NINH",
  THANH_HOA = "THANH_HOA",
  NGHE_AN = "NGHE_AN",
  HA_TINH = "HA_TINH",
  CAO_BANG = "CAO_BANG",
}

export interface ShippingAddressRequest {
  receiverName: string;
  receiverPhone: string;
  fullAddress: string;
  province: City | "";
  district: string;
  ward: string;
  detailAddress: string;
  setAsDefault: boolean;
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
