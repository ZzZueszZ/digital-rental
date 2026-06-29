import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildUrl,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/lib/seo";

export function SiteJsonLd() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: "vi-VN",
          potentialAction: {
            "@type": "SearchAction",
            target: `${buildUrl("/products")}?search={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: buildUrl("/favicon.svg"),
          email: SUPPORT_EMAIL,
          telephone: SUPPORT_PHONE,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: SUPPORT_PHONE,
            email: SUPPORT_EMAIL,
            contactType: "customer support",
            availableLanguage: ["vi"],
          },
          sameAs: SOCIAL_LINKS,
        }}
      />
    </>
  );
}
