import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Chính sách bảo mật - Lenshub Studio",
  description:
    "Chính sách bảo mật của Lenshub Studio về việc thu thập, sử dụng và bảo vệ dữ liệu cá nhân trong quá trình mua, thuê thiết bị và xác thực eKYC.",
  path: "/privacy",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
