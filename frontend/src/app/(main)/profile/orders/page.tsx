"use client";

import { useState } from "react";
import {
  useMyOrders,
  useConfirmReceived,
} from "@/services/order";
import {
  OrderStatus,
  OrderResponse,
} from "@/types/order";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, formatVND, getImageUrl, formatDate } from "@/lib/utils";
import { OrderDetailDialog } from "@/components/common/OrderDetailDialog";
import { ReviewFormDialog } from "@/components/common/ReviewFormDialog";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const { data: ordersRes, isLoading } = useMyOrders({
    page,
    size: 10,
    status: activeTab === "ALL" ? undefined : (activeTab as OrderStatus),
  });

  const orders = ordersRes?.data || [];
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] =
    useState<OrderResponse | null>(null);
  const router = useRouter();

  const { mutateAsync: confirmReceived } = useConfirmReceived();

  const handleShowDetail = (id: number) => {
    setSelectedOrderId(id);
    setIsDetailOpen(true);
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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-50 text-amber-600 border-amber-100";
      case OrderStatus.CONFIRMED:
        return "bg-blue-50 text-blue-600 border-blue-100";
      case OrderStatus.SHIPPING:
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case OrderStatus.DELIVERED:
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case OrderStatus.COMPLETED:
        return "bg-emerald-600 text-white border-emerald-600";
      case OrderStatus.CANCELED:
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-500 border-zinc-100";
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

  const tabs: { label: string; value: OrderStatus | "ALL" }[] = [
    { label: "Tất cả", value: "ALL" },
    { label: "Chờ xác nhận", value: OrderStatus.PENDING },
    { label: "Đã xác nhận", value: OrderStatus.CONFIRMED },
    { label: "Đang giao", value: OrderStatus.SHIPPING },
    { label: "Đã giao", value: OrderStatus.DELIVERED },
    { label: "Hoàn thành", value: OrderStatus.COMPLETED },
    { label: "Đã hủy", value: OrderStatus.CANCELED },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-[30px] font-semibold text-zinc-950 tracking-tight leading-tight">
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

      {/* Status Tabs */}
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

      {isLoading ? (
        <div className="py-20 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
          <p className="text-xs font-semibold text-zinc-400">
            Đang truy xuất đơn hàng...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-100 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-zinc-50 flex items-center justify-center mb-6 text-zinc-200">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-zinc-950 tracking-tight mb-2">
            Danh sách trống
          </h3>
          <p className="text-sm text-zinc-400 font-medium max-w-xs mb-10">
            Hiện chưa có đơn hàng nào trong mục này. Hãy bắt đầu trải nghiệm ngay.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="h-12 px-10 rounded-xl bg-red-600 hover:bg-zinc-950 text-white font-black text-xs uppercase transition-all shadow-xl shadow-red-100 border-none"
          >
            Khám phá thiết bị ngay
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {/* Card Header - High Density */}
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

              {/* Card Body - Compact 48px rows */}
              <div className="px-5 py-4 space-y-3">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex gap-4 items-center h-12">
                    <div className="w-12 h-12 rounded-xl border border-zinc-50 bg-white p-1.5 flex items-center justify-center shrink-0">
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

              {/* Card Footer - Compact */}
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
      )}
      {selectedOrderId && (
        <OrderDetailDialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          orderId={selectedOrderId}
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
