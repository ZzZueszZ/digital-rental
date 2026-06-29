import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Về Lenshub Studio - Nền tảng thuê thiết bị nhiếp ảnh an toàn",
  description:
    "Tìm hiểu Lenshub Studio, nền tảng hỗ trợ mua và thuê thiết bị nhiếp ảnh với quy trình rõ ràng, eKYC an toàn và hỗ trợ kỹ thuật cho khách hàng.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
