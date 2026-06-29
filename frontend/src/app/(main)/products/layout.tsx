import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Thiết bị máy ảnh cho thuê và bán - Lenshub Studio",
  description:
    "Khám phá danh sách máy ảnh, ống kính, gimbal, tripod và thiết bị ánh sáng tại Lenshub Studio. Xem giá thuê, giá bán, tồn kho và lịch khả dụng trực tuyến.",
  path: "/products",
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
