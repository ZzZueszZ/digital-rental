import { IBackendRes } from "./global";

export enum City {
  AN_GIANG = "AN_GIANG",
  BA_RIA_VUNG_TAU = "BA_RIA_VUNG_TAU",
  BAC_GIANG = "BAC_GIANG",
  BAC_KAN = "BAC_KAN",
  BAC_LIEU = "BAC_LIEU",
  BAC_NINH = "BAC_NINH",
  BEN_TRE = "BEN_TRE",
  BINH_DINH = "BINH_DINH",
  BINH_DUONG = "BINH_DUONG",
  BINH_PHUOC = "BINH_PHUOC",
  BINH_THUAN = "BINH_THUAN",
  CA_MAU = "CA_MAU",
  CAO_BANG = "CAO_BANG",
  CAN_THO = "CAN_THO",
  DA_NANG = "DA_NANG",
  DAK_LAK = "DAK_LAK",
  DAK_NONG = "DAK_NONG",
  DIEN_BIEN = "DIEN_BIEN",
  DONG_NAI = "DONG_NAI",
  DONG_THAP = "DONG_THAP",
  GIA_LAI = "GIA_LAI",
  HA_GIANG = "HA_GIANG",
  HA_NAM = "HA_NAM",
  HA_NOI = "HA_NOI",
  HA_TINH = "HA_TINH",
  HAI_DUONG = "HAI_DUONG",
  HAI_PHONG = "HAI_PHONG",
  HAU_GIANG = "HAU_GIANG",
  HOA_BINH = "HOA_BINH",
  HO_CHI_MINH = "HO_CHI_MINH",
  HUE = "HUE",
  HUNG_YEN = "HUNG_YEN",
  KHANH_HOA = "KHANH_HOA",
  KIEN_GIANG = "KIEN_GIANG",
  KON_TUM = "KON_TUM",
  LAI_CHAU = "LAI_CHAU",
  LAM_DONG = "LAM_DONG",
  LANG_SON = "LANG_SON",
  LAO_CAI = "LAO_CAI",
  LONG_AN = "LONG_AN",
  NAM_DINH = "NAM_DINH",
  NGHE_AN = "NGHE_AN",
  NINH_BINH = "NINH_BINH",
  NINH_THUAN = "NINH_THUAN",
  PHU_THO = "PHU_THO",
  PHU_YEN = "PHU_YEN",
  QUANG_BINH = "QUANG_BINH",
  QUANG_NAM = "QUANG_NAM",
  QUANG_NGAI = "QUANG_NGAI",
  QUANG_NINH = "QUANG_NINH",
  QUANG_TRI = "QUANG_TRI",
  SOC_TRANG = "SOC_TRANG",
  SON_LA = "SON_LA",
  TAY_NINH = "TAY_NINH",
  THAI_BINH = "THAI_BINH",
  THAI_NGUYEN = "THAI_NGUYEN",
  THANH_HOA = "THANH_HOA",
  TIEN_GIANG = "TIEN_GIANG",
  TRA_VINH = "TRA_VINH",
  TUYEN_QUANG = "TUYEN_QUANG",
  THU_DUC = "THU_DUC",
  VINH_LONG = "VINH_LONG",
  VINH_PHUC = "VINH_PHUC",
  YEN_BAI = "YEN_BAI",
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
  [City.AN_GIANG]: "Tỉnh An Giang",
  [City.BA_RIA_VUNG_TAU]: "Tỉnh Bà Rịa - Vũng Tàu",
  [City.BAC_GIANG]: "Tỉnh Bắc Giang",
  [City.BAC_KAN]: "Tỉnh Bắc Kạn",
  [City.BAC_LIEU]: "Tỉnh Bạc Liêu",
  [City.BAC_NINH]: "Tỉnh Bắc Ninh",
  [City.BEN_TRE]: "Tỉnh Bến Tre",
  [City.BINH_DINH]: "Tỉnh Bình Định",
  [City.BINH_DUONG]: "Tỉnh Bình Dương",
  [City.BINH_PHUOC]: "Tỉnh Bình Phước",
  [City.BINH_THUAN]: "Tỉnh Bình Thuận",
  [City.CA_MAU]: "Tỉnh Cà Mau",
  [City.CAO_BANG]: "Tỉnh Cao Bằng",
  [City.CAN_THO]: "Thành phố Cần Thơ",
  [City.DA_NANG]: "Thành phố Đà Nẵng",
  [City.DAK_LAK]: "Tỉnh Đắk Lắk",
  [City.DAK_NONG]: "Tỉnh Đắk Nông",
  [City.DIEN_BIEN]: "Tỉnh Điện Biên",
  [City.DONG_NAI]: "Tỉnh Đồng Nai",
  [City.DONG_THAP]: "Tỉnh Đồng Tháp",
  [City.GIA_LAI]: "Tỉnh Gia Lai",
  [City.HA_GIANG]: "Tỉnh Hà Giang",
  [City.HA_NAM]: "Tỉnh Hà Nam",
  [City.HA_NOI]: "Thành phố Hà Nội",
  [City.HA_TINH]: "Tỉnh Hà Tĩnh",
  [City.HAI_DUONG]: "Tỉnh Hải Dương",
  [City.HAI_PHONG]: "Thành phố Hải Phòng",
  [City.HAU_GIANG]: "Tỉnh Hậu Giang",
  [City.HOA_BINH]: "Tỉnh Hòa Bình",
  [City.HO_CHI_MINH]: "Thành phố Hồ Chí Minh",
  [City.HUE]: "Thành phố Huế",
  [City.HUNG_YEN]: "Tỉnh Hưng Yên",
  [City.KHANH_HOA]: "Tỉnh Khánh Hòa",
  [City.KIEN_GIANG]: "Tỉnh Kiên Giang",
  [City.KON_TUM]: "Tỉnh Kon Tum",
  [City.LAI_CHAU]: "Tỉnh Lai Châu",
  [City.LAM_DONG]: "Tỉnh Lâm Đồng",
  [City.LANG_SON]: "Tỉnh Lạng Sơn",
  [City.LAO_CAI]: "Tỉnh Lào Cai",
  [City.LONG_AN]: "Tỉnh Long An",
  [City.NAM_DINH]: "Tỉnh Nam Định",
  [City.NGHE_AN]: "Tỉnh Nghệ An",
  [City.NINH_BINH]: "Tỉnh Ninh Bình",
  [City.NINH_THUAN]: "Tỉnh Ninh Thuận",
  [City.PHU_THO]: "Tỉnh Phú Thọ",
  [City.PHU_YEN]: "Tỉnh Phú Yên",
  [City.QUANG_BINH]: "Tỉnh Quảng Bình",
  [City.QUANG_NAM]: "Tỉnh Quảng Nam",
  [City.QUANG_NGAI]: "Tỉnh Quảng Ngãi",
  [City.QUANG_NINH]: "Tỉnh Quảng Ninh",
  [City.QUANG_TRI]: "Tỉnh Quảng Trị",
  [City.SOC_TRANG]: "Tỉnh Sóc Trăng",
  [City.SON_LA]: "Tỉnh Sơn La",
  [City.TAY_NINH]: "Tỉnh Tây Ninh",
  [City.THAI_BINH]: "Tỉnh Thái Bình",
  [City.THAI_NGUYEN]: "Tỉnh Thái Nguyên",
  [City.THANH_HOA]: "Tỉnh Thanh Hóa",
  [City.TIEN_GIANG]: "Tỉnh Tiền Giang",
  [City.TRA_VINH]: "Tỉnh Trà Vinh",
  [City.TUYEN_QUANG]: "Tỉnh Tuyên Quang",
  [City.THU_DUC]: "Thành phố Thủ Đức",
  [City.VINH_LONG]: "Tỉnh Vĩnh Long",
  [City.VINH_PHUC]: "Tỉnh Vĩnh Phúc",
  [City.YEN_BAI]: "Tỉnh Yên Bái",
};
