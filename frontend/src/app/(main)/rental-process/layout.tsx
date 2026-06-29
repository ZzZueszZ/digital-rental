import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Quy trình thuê thiết bị máy ảnh - Lenshub Studio",
  description:
    "Xem quy trình thuê thiết bị tại Lenshub Studio: chọn thiết bị, kiểm tra lịch, thanh toán, ký hợp đồng, nhận máy và hoàn trả.",
  path: "/rental-process",
});

export default function RentalProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
