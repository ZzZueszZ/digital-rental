"use client";

import { useSearchParams } from "next/navigation";

import { CheckoutResultView } from "@/components/checkout/CheckoutResultView";

export default function RentalPaymentReturnPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const orderCode = searchParams.get("orderCode");
  const urlStatus = searchParams.get("status");
  const status =
    urlStatus === "success" || urlStatus === "error" ? urlStatus : "loading";
  const isSuccess = status === "success";

  return (
    <CheckoutResultView
      status={status}
      title={
        status === "loading"
          ? "Đang xác thực giao dịch"
          : isSuccess
            ? "Thanh toán thuê thành công"
            : "Thanh toán thuê thất bại"
      }
      description={
        message ||
        (status === "loading"
          ? "Hệ thống đang kiểm tra kết quả thanh toán tiền thuê từ VNPay. Vui lòng không đóng trang trong lúc xử lý."
          : isSuccess
            ? "Giao dịch thuê đã được xác nhận. DigitalRental sẽ chuẩn bị thiết bị theo lịch nhận máy của bạn."
            : "Giao dịch thuê chưa hoàn tất hoặc đã bị hủy. Bạn có thể vào mục đơn hàng để kiểm tra và thanh toán lại nếu cần.")
      }
      code={orderCode}
      codeLabel="Mã đơn thuê"
      primaryLabel={isSuccess ? "Xem đơn thuê" : "Kiểm tra đơn thuê"}
      primaryHref="/profile/orders"
      secondaryLabel="Xem thiết bị"
      secondaryHref="/products"
    />
  );
}
