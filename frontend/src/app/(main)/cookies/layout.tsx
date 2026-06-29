import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Chính sách cookie - Lenshub Studio",
  description:
    "Thông tin về cách Lenshub Studio sử dụng cookie và dữ liệu phiên để cải thiện trải nghiệm, bảo mật đăng nhập và vận hành hệ thống.",
  path: "/cookies",
});

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
