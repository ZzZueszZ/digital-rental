import type { Metadata } from "next";

export const SITE_NAME = "Lenshub Studio";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.lenshub.shop";
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://api.lenshub.shop/api";

export const DEFAULT_SEO_TITLE =
  "Lenshub Studio - Thuê máy ảnh, lens và thiết bị quay chụp chuyên nghiệp";
export const DEFAULT_SEO_DESCRIPTION =
  "Lenshub Studio cung cấp dịch vụ thuê và mua thiết bị máy ảnh, ống kính, gimbal, tripod và ánh sáng chuyên nghiệp. Hỗ trợ kiểm tra lịch thuê, thanh toán online và xác thực eKYC an toàn.";

export const SUPPORT_PHONE = "037 6600 545";
export const SUPPORT_EMAIL = "adminlenshub@gmail.com";

export const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/about",
  "/rental-process",
  "/trust",
  "/privacy",
  "/terms",
  "/cookies",
  "/warranty-returns",
  "/delivery-policy",
] as const;

export const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/staff",
  "/super-admin",
  "/profile",
  "/checkout",
  "/auth",
  "/api",
] as const;

export const SOCIAL_LINKS = [
  "https://www.facebook.com/truong.ai.nga.2025",
  "https://www.instagram.com/ainga_76",
  "https://github.com/AiNga04",
];

export const buildUrl = (path = "/") =>
  path.startsWith("http")
    ? path
    : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const createPageMetadata = ({
  title,
  description,
  path = "/",
  image = "/modern_photography_hero.png",
  keywords = [],
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata => {
  const url = buildUrl(path);
  const imageUrl = buildUrl(image);

  return {
    title,
    description,
    keywords: [
      "thuê máy ảnh",
      "thuê lens",
      "thuê thiết bị quay phim",
      "mua máy ảnh",
      "Lenshub Studio",
      ...keywords,
    ],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
};

export type ProductSeo = {
  id: number;
  name: string;
  description?: string | null;
  brand?: string | null;
  categoryName?: string | null;
  mainImageUrl?: string | null;
  salePrice?: number | null;
  rentPricePerDay?: number | null;
  quantity?: number | null;
  rentalQuantity?: number | null;
  gallery?: Array<{
    url?: string | null;
  }> | null;
  forSale?: boolean;
  forRent?: boolean;
  isForSale?: boolean;
  isForRent?: boolean;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type ApiResponse<T> = {
  data?: T;
  pagination?: {
    totalPages?: number;
  };
};

export const getProductCanonicalPath = (id: number | string) =>
  `/products/${id}`;

export const normalizeImageUrl = (url?: string | null) => {
  if (!url) return buildUrl("/product-placeholder.svg");
  if (url.startsWith("http")) {
    try {
      const parsed = new URL(url);
      if (["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
        return buildUrl("/product-placeholder.svg");
      }
    } catch {
      return buildUrl("/product-placeholder.svg");
    }
    return url;
  }
  return buildUrl(url);
};

export const getProductSeoImage = (product: ProductSeo) => {
  const image =
    product.mainImageUrl?.trim() ||
    product.gallery?.find((item) => item.url?.trim())?.url ||
    null;

  return normalizeImageUrl(image);
};

export const stripToPlainText = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function fetchProductForSeo(
  id: string,
): Promise<ProductSeo | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<ProductSeo>;
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchProductsForSitemap(): Promise<ProductSeo[]> {
  try {
    const res = await fetch(
      `${API_URL}/products?page=0&size=200&sortBy=updatedAt&direction=desc`,
      {
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as ApiResponse<ProductSeo[]>;
    return json.data ?? [];
  } catch {
    return [];
  }
}

export const productToDescription = (product: ProductSeo) => {
  const rentText =
    product.rentPricePerDay && (product.forRent || product.isForRent)
      ? ` Giá thuê từ ${Number(product.rentPricePerDay).toLocaleString("vi-VN")}đ/ngày.`
      : "";
  const saleText =
    product.salePrice && (product.forSale || product.isForSale)
      ? ` Giá bán ${Number(product.salePrice).toLocaleString("vi-VN")}đ.`
      : "";
  const base =
    stripToPlainText(product.description) ||
    `${product.name} tại Lenshub Studio, phù hợp cho nhu cầu chụp ảnh, quay phim và sản xuất nội dung chuyên nghiệp.`;

  return `${base}${rentText}${saleText}`.slice(0, 280);
};
