import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/app/providers";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import {
  createPageMetadata,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

// Typography: Functional Voice (Inter)
const fontInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  ...createPageMetadata({
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    path: "/",
  }),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fontInter.variable} font-sans antialiased bg-white text-gray-900 overflow-x-hidden custom-scrollbar`}
      >
        {/* Strip browser-extension-injected attributes (e.g. Bitdefender's bis_skin_checked) before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                  el.removeAttribute('bis_skin_checked');
                });
              } catch(e) {}
            `,
          }}
        />
        <SiteJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
