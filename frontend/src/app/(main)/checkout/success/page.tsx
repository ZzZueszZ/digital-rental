"use client";

import { useSearchParams } from "next/navigation";

import { CheckoutResultView } from "@/components/checkout/CheckoutResultView";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code");

  return (
    <CheckoutResultView
      status="success"
      title="Đặt hàng thành công"
      description="Đơn hàng của bạn đã được tiếp nhận. DigitalRental sẽ kiểm tra thanh toán, chuẩn bị thiết bị và cập nhật trạng thái trong mục đơn hàng."
      code={orderCode}
      codeLabel="Mã đơn hàng"
      primaryLabel="Quản lý đơn hàng"
      primaryHref="/profile/orders"
      secondaryLabel="Tiếp tục mua sắm"
      secondaryHref="/products"
    />
  );
}
