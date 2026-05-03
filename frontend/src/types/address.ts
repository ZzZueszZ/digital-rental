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
export const CITY_LABELS: Record<City, string> = {
  [City.TUYEN_QUANG]: "Tỉnh Tuyên Quang",
  [City.LAO_CAI]: "Tỉnh Lào Cai",
  [City.THAI_NGUYEN]: "Tỉnh Thái Nguyên",
  [City.PHU_THO]: "Tỉnh Phú Thọ",
  [City.BAC_NINH]: "Tỉnh Bắc Ninh",
  [City.HUNG_YEN]: "Tỉnh Hưng Yên",
  [City.HAI_PHONG]: "Thành phố Hải Phòng",
  [City.NINH_BINH]: "Tỉnh Ninh Bình",
  [City.QUANG_TRI]: "Tỉnh Quảng Trị",
  [City.DA_NANG]: "Thành phố Đà Nẵng",
  [City.QUANG_NGAI]: "Tỉnh Quảng Ngãi",
  [City.GIA_LAI]: "Tỉnh Gia Lai",
  [City.KHANH_HOA]: "Tỉnh Khánh Hoà",
  [City.LAM_DONG]: "Tỉnh Lâm Đồng",
  [City.DAK_LAK]: "Tỉnh Đắk Lắk",
  [City.HO_CHI_MINH]: "Thành phố Hồ Chí Minh",
  [City.DONG_NAI]: "Tỉnh Đồng Nai",
  [City.TAY_NINH]: "Tỉnh Tây Ninh",
  [City.CAN_THO]: "Thành phố Cần Thơ",
  [City.VINH_LONG]: "Tỉnh Vĩnh Long",
  [City.DONG_THAP]: "Tỉnh Đồng Tháp",
  [City.CA_MAU]: "Tỉnh Cà Mau",
  [City.AN_GIANG]: "Tỉnh An Giang",
  [City.HA_NOI]: "Thành phố Hà Nội",
  [City.HUE]: "Thành phố Huế",
  [City.LAI_CHAU]: "Tỉnh Lai Châu",
  [City.DIEN_BIEN]: "Tỉnh Điện Biên",
  [City.SON_LA]: "Tỉnh Sơn La",
  [City.LANG_SON]: "Tỉnh Lạng Sơn",
  [City.QUANG_NINH]: "Tỉnh Quảng Ninh",
  [City.THANH_HOA]: "Tỉnh Thanh Hoá",
  [City.NGHE_AN]: "Tỉnh Nghệ An",
  [City.HA_TINH]: "Tỉnh Hà Tĩnh",
  [City.CAO_BANG]: "Tỉnh Cao Bằng",
};
