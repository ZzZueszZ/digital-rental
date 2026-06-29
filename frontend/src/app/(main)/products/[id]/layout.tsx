import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildUrl,
  createPageMetadata,
  fetchProductForSeo,
  getProductCanonicalPath,
  normalizeImageUrl,
  productToDescription,
  SITE_NAME,
} from "@/lib/seo";

type ProductLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductForSeo(id);

  if (!product) {
    return createPageMetadata({
      title: "Thiết bị không tồn tại - Lenshub Studio",
      description:
        "Không tìm thấy thiết bị yêu cầu. Khám phá danh sách thiết bị máy ảnh, ống kính, gimbal và phụ kiện tại Lenshub Studio.",
      path: getProductCanonicalPath(id),
      noIndex: true,
    });
  }

  const description = productToDescription(product);

  return createPageMetadata({
    title: `${product.name} | Thuê và mua tại Lenshub Studio`,
    description,
    path: getProductCanonicalPath(product.id),
    image: normalizeImageUrl(product.mainImageUrl),
  });
}

export default async function ProductSeoLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { id } = await params;
  const product = await fetchProductForSeo(id);

  if (!product) return children;

  const hasSaleOffer =
    product.salePrice && (product.forSale || product.isForSale);
  const hasRentOffer =
    product.rentPricePerDay && (product.forRent || product.isForRent);
  const availability =
    (product.quantity ?? 0) > 0 || (product.rentalQuantity ?? 0) > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: productToDescription(product),
          brand: product.brand
            ? {
                "@type": "Brand",
                name: product.brand,
              }
            : undefined,
          category: product.categoryName,
          image: normalizeImageUrl(product.mainImageUrl),
          url: buildUrl(getProductCanonicalPath(product.id)),
          offers: {
            "@type": "Offer",
            priceCurrency: "VND",
            price:
              (hasSaleOffer ? product.salePrice : product.rentPricePerDay) ?? 0,
            availability,
            seller: {
              "@type": "Organization",
              name: SITE_NAME,
            },
            description: hasRentOffer
              ? `Giá thuê từ ${Number(product.rentPricePerDay).toLocaleString("vi-VN")}đ/ngày.`
              : undefined,
          },
        }}
      />
      {children}
    </>
  );
}
