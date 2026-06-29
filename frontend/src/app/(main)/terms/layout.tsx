import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Điều khoản sử dụng - Lenshub Studio",
  description:
    "Điều khoản sử dụng dịch vụ mua và thuê thiết bị tại Lenshub Studio, bao gồm tài khoản, thanh toán, trách nhiệm và quy định vận hành.",
  path: "/terms",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
