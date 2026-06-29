import type { MetadataRoute } from "next";
import {
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  buildUrl,
} from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Lenshub",
    description: DEFAULT_SEO_DESCRIPTION,
    start_url: SITE_URL,
    scope: SITE_URL,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ef0008",
    lang: "vi-VN",
    categories: ["shopping", "photo", "business"],
    icons: [
      {
        src: buildUrl("/favicon.svg"),
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: buildUrl("/apple-icon.svg"),
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  };
}
