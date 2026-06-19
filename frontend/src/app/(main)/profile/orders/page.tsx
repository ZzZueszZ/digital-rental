"use client";

import { useState } from "react";
import { useMyOrders, useConfirmReceived, orderService } from "@/services/order";
import {
  OrderStatus,
  OrderResponse,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Loader2,
  Info,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, formatVND, getImageUrl, formatDate } from "@/lib/utils";
import { OrderDetailDialog } from "@/components/common/OrderDetailDialog";
import { ReviewFormDialog } from "@/components/common/ReviewFormDialog";
import {
  RentalOrderStatus,
  rentalService,
  useMyRentals,
} from "@/services/rental";
import { RentalDetailDialog } from "@/components/common/RentalDetailDialog";

export default function OrdersPage() {
  const [orderType, setOrderType] = useState<"BUY" | "RENT">("BUY");
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [activeRentalTab, setActiveRentalTab] = useState<
    RentalOrderStatus | "ALL"
  >("ALL");
  const [page, setPage] = useState(0);

  // Buy Orders Query
  const { data: ordersRes, isLoading: isOrdersLoading } = useMyOrders({
    page,
    size: 10,
    status: activeTab === "ALL" ? undefined : (activeTab as OrderStatus),
  });
  const orders = ordersRes?.data || [];

  // Rental Orders Query
  const { data: rentalsRes, isLoading: isRentalsLoading } = useMyRentals({
    page,
    size: 10,
    status:
      activeRentalTab === "ALL"
        ? undefined
        : (activeRentalTab as RentalOrderStatus),
  });
  const rentals = rentalsRes?.data || [];

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);
  const [isRentalDetailOpen, setIsRentalDetailOpen] = useState(false);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] =
    useState<OrderResponse | null>(null);
  const [payingOrderKey, setPayingOrderKey] = useState<string | null>(null);
  const router = useRouter();

  const { mutateAsync: confirmReceived } = useConfirmReceived();

  const handleShowDetail = (id: number) => {
    setSelectedOrderId(id);
    setIsDetailOpen(true);
  };

  const handleShowRentalDetail = (id: number) => {
    setSelectedRentalId(id);
    setIsRentalDetailOpen(true);
  };

  const handleReview = (order: OrderResponse) => {
    setSelectedOrderForReview(order);
    setIsReviewOpen(true);
  };

  const handleConfirmReceived = async (id: number) => {
    try {
      await confirmReceived(id);
      toast.success("Xác nhận đã nhận hàng thành công");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xác nhận nhận hàng";
      toast.error(message);
    }
  };

  const handleRetryOrderPayment = async (orderId: number) => {
    const key = `order-${orderId}`;
    try {
      setPayingOrderKey(key);
      const response = await orderService.createVnPayUrl(orderId);
      window.location.assign(response.data);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message ||
          "Không thể tạo lại phiên thanh toán. Vui lòng thử lại.",
      );
      setPayingOrderKey(null);
    }
  };

  const handleRetryRentalPayment = async (rentalId: number) => {
    const key = `rental-${rentalId}`;
    try {
      setPayingOrderKey(key);
      const response = await rentalService.createVnPayUrl(rentalId);
      window.location.assign(response.data);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message ||
          "Không thể tạo lại phiên thanh toán phí thuê. Vui lòng thử lại.",
      );
      setPayingOrderKey(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case OrderStatus.CONFIRMED:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case OrderStatus.SHIPPING:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case OrderStatus.DELIVERED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case OrderStatus.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case OrderStatus.CANCELED:
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Chờ xác nhận";
      case OrderStatus.CONFIRMED:
        return "Đã xác nhận";
      case OrderStatus.SHIPPING:
        return "Đang giao hàng";
      case OrderStatus.DELIVERED:
        return "Đã giao";
      case OrderStatus.COMPLETED:
        return "Hoàn thành";
      case OrderStatus.CANCELED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getRentalStatusColor = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_PAYMENT:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case RentalOrderStatus.PAID_RENTAL_FEE:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case RentalOrderStatus.WAITING_PICKUP:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case RentalOrderStatus.RENTING:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case RentalOrderStatus.RETURNED:
        return "bg-sky-50 text-sky-700 border-sky-200";
      case RentalOrderStatus.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case RentalOrderStatus.CANCELLED:
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200";
    }
  };

  const getRentalStatusLabel = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_PAYMENT:
        return "Chờ TT phí thuê";
      case RentalOrderStatus.PAID_RENTAL_FEE:
        return "Đã TT phí thuê";
      case RentalOrderStatus.WAITING_PICKUP:
        return "Chờ nhận máy/Ký HĐ";
      case RentalOrderStatus.RENTING:
        return "Đang thuê";
      case RentalOrderStatus.RETURNED:
        return "Đã trả máy - Quyết toán";
      case RentalOrderStatus.COMPLETED:
        return "Hoàn tất";
      case RentalOrderStatus.CANCELLED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const tabs: { label: string; value: OrderStatus | "ALL" }[] = [
    { label: "Tất cả", value: "ALL" },
    { label: "Chờ xác nhận", value: OrderStatus.PENDING },
    { label: "Đã xác nhận", value: OrderStatus.CONFIRMED },
    { label: "Đang giao", value: OrderStatus.SHIPPING },
    { label: "Đã giao", value: OrderStatus.DELIVERED },
    { label: "Hoàn thành", value: OrderStatus.COMPLETED },
    { label: "Đã hủy", value: OrderStatus.CANCELED },
  ];

  const rentalTabs: { label: string; value: RentalOrderStatus | "ALL" }[] = [
    { label: "Tất cả", value: "ALL" },
    { label: "Chờ TT", value: RentalOrderStatus.PENDING_PAYMENT },
    { label: "Đã TT phí", value: RentalOrderStatus.PAID_RENTAL_FEE },
    { label: "Chờ nhận", value: RentalOrderStatus.WAITING_PICKUP },
    { label: "Đang thuê", value: RentalOrderStatus.RENTING },
    { label: "Đã trả", value: RentalOrderStatus.RETURNED },
    { label: "Hoàn tất", value: RentalOrderStatus.COMPLETED },
    { label: "Đã hủy", value: RentalOrderStatus.CANCELLED },
  ];

  const isLoading = orderType === "BUY" ? isOrdersLoading : isRentalsLoading;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950 tracking-tight leading-tight mb-2">
            Đơn hàng của bạn
          </h2>
          <p className="text-sm font-medium text-zinc-500">
            Lịch sử giao dịch & Thiết bị thuê.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400">
          <Info className="w-3.5 h-3.5" />
          <span>Mặc định: 24h/ngày</span>
        </div>
      </div>

      {/* Main Switcher: Buying vs Renting */}
      <div className="flex gap-6 border-b border-zinc-100 pb-1.5 px-1">
        <button
          onClick={() => {
            setOrderType("BUY");
            setPage(0);
            setActiveTab("ALL");
          }}
          className={cn(
            "pb-2 text-sm font-bold border-b-2 transition-all duration-300 relative",
            orderType === "BUY"
              ? "border-red-600 text-red-600"
              : "border-transparent text-zinc-400 hover:text-zinc-900",
          )}
        >
          Đơn mua hàng
        </button>
        <button
          onClick={() => {
            setOrderType("RENT");
            setPage(0);
            setActiveRentalTab("ALL");
          }}
          className={cn(
            "pb-2 text-sm font-bold border-b-2 transition-all duration-300 relative",
            orderType === "RENT"
              ? "border-red-600 text-red-600"
              : "border-transparent text-zinc-400 hover:text-zinc-900",
          )}
        >
          Đơn thuê thiết bị
        </button>
      </div>

      {/* Status Tabs based on selected order type */}
      {orderType === "BUY" ? (
        <div className="flex items-center gap-1.5 bg-zinc-100/50 p-1.5 rounded-xl border border-zinc-100 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(0);
              }}
              className={cn(
                "whitespace-nowrap px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                activeTab === tab.value
                  ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200"
                  : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 bg-zinc-100/50 p-1.5 rounded-xl border border-zinc-100 overflow-x-auto no-scrollbar">
          {rentalTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveRentalTab(tab.value);
                setPage(0);
              }}
              className={cn(
                "whitespace-nowrap px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                activeRentalTab === tab.value
                  ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200"
                  : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
          <p className="text-xs font-semibold text-zinc-400">
            Đang truy xuất thông tin đơn hàng...
          </p>
        </div>
      ) : orderType === "BUY" && orders.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-100 rounded-xl p-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-xl bg-zinc-50 flex items-center justify-center mb-6 text-zinc-200">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-zinc-950 tracking-tight mb-2">
            Danh sách trống
          </h3>
          <p className="text-sm text-zinc-400 font-medium max-w-xs mb-10">
            Hiện chưa có đơn mua hàng nào trong mục này. Hãy bắt đầu trải nghiệm
            ngay.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="h-10 px-5 rounded-xl bg-red-600 hover:bg-zinc-900 text-white transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-red-100 border-none whitespace-nowrap active:scale-95"
          >
            Khám phá thiết bị ngay
          </Button>
        </div>
      ) : orderType === "RENT" && rentals.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-100 rounded-xl p-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-xl bg-zinc-50 flex items-center justify-center mb-6 text-zinc-200">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-zinc-950 tracking-tight mb-2">
            Danh sách thuê trống
          </h3>
          <p className="text-sm text-zinc-400 font-medium max-w-xs mb-10">
            Hiện chưa có đơn thuê thiết bị nào trong mục này. Hãy bắt đầu trải
            nghiệm ngay.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="h-10 px-5 rounded-xl bg-red-600 hover:bg-zinc-900 text-white transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-red-100 border-none whitespace-nowrap active:scale-95"
          >
            Thuê thiết bị ảnh ngay
          </Button>
        </div>
      ) : orderType === "BUY" ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="px-5 py-3 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/20">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 leading-none mb-1">
                      Mã đơn hàng
                    </span>
                    <span className="text-sm font-bold text-zinc-950 tracking-tight">
                      #{order.code}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-zinc-100 hidden sm:block" />
                  <div className="hidden sm:flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 leading-none mb-1">
                      Ngày đặt
                    </span>
                    <span className="text-xs font-bold text-zinc-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-semibold border shadow-none",
                    getStatusColor(order.status),
                  )}
                >
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex gap-4 items-center h-16">
                    <div className="w-16 h-16 rounded-xl border border-zinc-100 bg-white p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={
                          getImageUrl(item.productMainImage) ||
                          "/placeholder-camera.jpg"
                        }
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[18px] font-semibold text-zinc-950 truncate leading-snug">
                        {item.productName}
                      </h4>
                      <p className="text-[14px] text-zinc-400 font-normal mt-1">
                        Số lượng: {item.quantity} | {formatVND(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] pl-1">
                    + {order.items.length - 2} sản phẩm khác
                  </p>
                )}
              </div>

              <div className="px-5 py-3 bg-zinc-50/10 border-t border-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-normal text-zinc-500">
                    Tổng thanh toán:
                  </span>
                  <span className="text-[22px] font-bold text-red-600 tracking-tight">
                    {formatVND(order.totalPrice)}
                  </span>
                </div>
                <div className="flex gap-3">
                  {order.paymentMethod === PaymentMethod.ONLINE &&
                    order.paymentStatus !== PaymentStatus.SUCCESS &&
                    order.status !== OrderStatus.CANCELED && (
                      <Button
                        onClick={() => handleRetryOrderPayment(order.id)}
                        disabled={payingOrderKey !== null}
                        className="h-10 rounded-xl bg-red-600 px-5 text-[14px] font-medium text-white shadow-none hover:bg-red-700"
                      >
                        {payingOrderKey === `order-${order.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        Thanh toán lại
                      </Button>
                    )}
                  <Button
                    variant="ghost"
                    className="h-10 px-5 rounded-xl border border-zinc-100 text-[14px] font-semibold text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 transition-all shadow-none"
                    onClick={() => handleShowDetail(order.id)}
                  >
                    Xem chi tiết
                  </Button>
                  {order.status === OrderStatus.DELIVERED && (
                    <Button
                      onClick={() => handleConfirmReceived(order.id)}
                      className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-[14px] font-semibold hover:bg-emerald-700 border-none shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-all"
                    >
                      Đã nhận hàng
                    </Button>
                  )}
                  {order.status === OrderStatus.COMPLETED &&
                    !order.isReviewed && (
                      <Button
                        onClick={() => handleReview(order)}
                        className="h-10 px-5 rounded-xl bg-red-600 text-white text-[14px] font-semibold hover:bg-zinc-950 border-none shadow-[0_4px_12px_rgba(220,38,38,0.2)] transition-all"
                      >
                        Đánh giá ngay
                      </Button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <div
              key={rental.id}
              className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="px-5 py-3 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/20">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 leading-none mb-1">
                      Mã đơn thuê
                    </span>
                    <span className="text-sm font-bold text-zinc-950 tracking-tight">
                      #{rental.code}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-zinc-100 hidden sm:block" />
                  <div className="hidden sm:flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 leading-none mb-1">
                      Thời hạn thuê
                    </span>
                    <span className="text-xs font-bold text-zinc-500">
                      {rental.startDate.split("T")[0]} &rarr;{" "}
                      {rental.endDate.split("T")[0]}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-semibold border shadow-none",
                    getRentalStatusColor(rental.status),
                  )}
                >
                  {getRentalStatusLabel(rental.status)}
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {rental.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center h-16">
                    <div className="w-16 h-16 rounded-xl border border-zinc-100 bg-white p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={
                          getImageUrl(item.productMainImageUrl) ||
                          "/placeholder-camera.jpg"
                        }
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[18px] font-semibold text-zinc-950 truncate leading-snug">
                        {item.productName}
                      </h4>
                      <p className="text-[14px] text-zinc-400 font-normal mt-1">
                        Giá thuê: {formatVND(item.pricePerDay)}/ngày
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 bg-zinc-50/10 border-t border-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-normal text-zinc-500">
                    Tổng phí thuê:
                  </span>
                  <span className="text-[22px] font-bold text-red-600 tracking-tight">
                    {formatVND(rental.rentalFee)}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    (Cọc dự kiến:{" "}
                    {formatVND(
                      rental.finalDepositAmount ??
                        rental.estimatedDepositAmount ??
                        0,
                    )}
                    )
                  </span>
                </div>
                <div className="flex gap-3">
                  {rental.paymentMethod === "ONLINE" &&
                    rental.paymentStatus !== "SUCCESS" &&
                    rental.status === RentalOrderStatus.PENDING_PAYMENT && (
                      <Button
                        onClick={() => handleRetryRentalPayment(rental.id)}
                        disabled={payingOrderKey !== null}
                        className="h-10 rounded-xl bg-red-600 px-5 text-[14px] font-medium text-white shadow-none hover:bg-red-700"
                      >
                        {payingOrderKey === `rental-${rental.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        Thanh toán lại
                      </Button>
                    )}
                  <Button
                    variant="ghost"
                    className="h-10 px-5 rounded-xl border border-zinc-100 text-[14px] font-semibold text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 transition-all shadow-none"
                    onClick={() => handleShowRentalDetail(rental.id)}
                  >
                    Xem chi tiết & Hợp đồng
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailDialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          orderId={selectedOrderId}
        />
      )}

      {selectedRentalId && (
        <RentalDetailDialog
          isOpen={isRentalDetailOpen}
          onClose={() => setIsRentalDetailOpen(false)}
          rentalId={selectedRentalId}
        />
      )}

      {selectedOrderForReview && (
        <ReviewFormDialog
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          productId={selectedOrderForReview.items[0].productId}
          productName={selectedOrderForReview.items[0].productName}
          orderId={selectedOrderForReview.id}
          orderCode={selectedOrderForReview.code}
        />
      )}
    </div>
  );
}
