"use client";

import { useSearchParams } from "next/navigation";

import { CheckoutResultView } from "@/components/checkout/CheckoutResultView";

export default function VNPayReturnPage() {
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
            ? "Thanh toán thành công"
            : "Thanh toán thất bại"
      }
      description={
        message ||
        (status === "loading"
          ? "Hệ thống đang kiểm tra kết quả thanh toán từ VNPay. Vui lòng không đóng trang trong lúc xử lý."
          : isSuccess
            ? "Giao dịch đã được xác nhận. Đơn hàng sẽ được chuyển sang bước chuẩn bị và bạn có thể theo dõi trong hồ sơ cá nhân."
            : "Giao dịch chưa hoàn tất hoặc đã bị hủy. Bạn có thể vào mục đơn hàng để kiểm tra và thực hiện thanh toán lại nếu cần.")
      }
      code={orderCode}
      codeLabel="Mã đơn hàng"
      primaryLabel={isSuccess ? "Xem đơn hàng" : "Kiểm tra đơn hàng"}
      primaryHref="/profile/orders"
      secondaryLabel="Về trang chủ"
      secondaryHref="/"
    />
  );
}
