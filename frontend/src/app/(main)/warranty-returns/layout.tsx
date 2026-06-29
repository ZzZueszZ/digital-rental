import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Bảo hành và đổi trả - Lenshub Studio",
  description:
    "Chính sách bảo hành, đổi trả và hỗ trợ sau giao dịch đối với thiết bị mua hoặc thuê tại Lenshub Studio.",
  path: "/warranty-returns",
});

export default function WarrantyReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
