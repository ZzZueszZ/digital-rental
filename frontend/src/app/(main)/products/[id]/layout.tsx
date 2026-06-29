import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildUrl,
  createPageMetadata,
  fetchProductForSeo,
  getProductCanonicalPath,
  getProductSeoImage,
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
        "Không tìm thấy thiết bị yêu cầu. Khám phá danh sách máy ảnh, ống kính, gimbal và phụ kiện tại Lenshub Studio.",
      path: getProductCanonicalPath(id),
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${product.name} | Thuê và mua tại Lenshub Studio`,
    description: productToDescription(product),
    path: getProductCanonicalPath(product.id),
    image: getProductSeoImage(product),
    keywords: [
      product.name,
      product.brand || "",
      product.categoryName || "",
      `thuê ${product.name}`,
      `mua ${product.name}`,
    ].filter(Boolean),
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
  const url = buildUrl(getProductCanonicalPath(product.id));
  const offers = [
    hasSaleOffer
      ? {
          "@type": "Offer",
          name: `Mua ${product.name}`,
          url,
          priceCurrency: "VND",
          price: product.salePrice,
          availability,
          seller: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        }
      : null,
    hasRentOffer
      ? {
          "@type": "Offer",
          name: `Thuê ${product.name}`,
          url,
          priceCurrency: "VND",
          price: product.rentPricePerDay,
          availability,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            priceCurrency: "VND",
            price: product.rentPricePerDay,
            unitText: "DAY",
          },
          seller: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        }
      : null,
  ].filter(Boolean);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Trang chủ",
              item: buildUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Thiết bị",
              item: buildUrl("/products"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: url,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          productID: String(product.id),
          sku: `PRD-${product.id}`,
          name: product.name,
          description: productToDescription(product),
          brand: product.brand
            ? {
                "@type": "Brand",
                name: product.brand,
              }
            : undefined,
          category: product.categoryName,
          image: getProductSeoImage(product),
          url,
          offers: offers.length === 1 ? offers[0] : offers,
        }}
      />
      {children}
    </>
  );
}
