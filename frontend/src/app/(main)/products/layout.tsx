import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildUrl,
  createPageMetadata,
  fetchProductsForSitemap,
  getProductCanonicalPath,
  getProductSeoImage,
  productToDescription,
  SITE_NAME,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Thiết bị máy ảnh cho thuê và bán - Lenshub Studio",
  description:
    "Khám phá danh sách máy ảnh, ống kính, gimbal, tripod và thiết bị ánh sáng tại Lenshub Studio. Xem giá thuê, giá bán, tồn kho và lịch khả dụng trực tuyến.",
  path: "/products",
  keywords: [
    "thiết bị máy ảnh",
    "thuê máy ảnh chuyên nghiệp",
    "thuê ống kính",
    "thuê gimbal",
    "thiết bị studio",
  ],
});

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const products = (await fetchProductsForSitemap()).slice(0, 24);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Thiết bị máy ảnh cho thuê và bán",
          description: metadata.description,
          url: buildUrl("/products"),
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: buildUrl("/"),
          },
        }}
      />
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
          ],
        }}
      />
      {products.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Danh sách thiết bị Lenshub Studio",
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: buildUrl(getProductCanonicalPath(product.id)),
              item: {
                "@type": "Product",
                name: product.name,
                description: productToDescription(product),
                image: getProductSeoImage(product),
                url: buildUrl(getProductCanonicalPath(product.id)),
                brand: product.brand
                  ? {
                      "@type": "Brand",
                      name: product.brand,
                    }
                  : undefined,
              },
            })),
          }}
        />
      )}
      {children}
    </>
  );
}
