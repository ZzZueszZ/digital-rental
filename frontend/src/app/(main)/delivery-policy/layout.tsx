import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Chính sách giao nhận - Lenshub Studio",
  description:
    "Thông tin về nhận thiết bị, giao hàng, thời gian xử lý và các quy định bàn giao khi mua hoặc thuê thiết bị tại Lenshub Studio.",
  path: "/delivery-policy",
});

export default function DeliveryPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
