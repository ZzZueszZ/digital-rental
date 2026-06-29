import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "An toàn và xác thực khi thuê thiết bị - Lenshub Studio",
  description:
    "Lenshub Studio áp dụng xác thực tài khoản, eKYC, hợp đồng điện tử và các lớp bảo mật để tăng độ tin cậy trong hoạt động thuê thiết bị.",
  path: "/trust",
});

export default function TrustLayout({ children }: { children: React.ReactNode }) {
  return children;
}
