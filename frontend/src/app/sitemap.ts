import type { MetadataRoute } from "next";
import {
  buildUrl,
  fetchProductsForSitemap,
  getProductCanonicalPath,
  PUBLIC_ROUTES,
} from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await fetchProductsForSitemap();

  const staticRoutes: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: buildUrl(route),
    lastModified: now,
    changeFrequency: route === "/" || route === "/products" ? "daily" : "monthly",
    priority: route === "/" ? 1 : route === "/products" ? 0.9 : 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: buildUrl(getProductCanonicalPath(product.id)),
    lastModified: product.updatedAt || product.createdAt || now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
