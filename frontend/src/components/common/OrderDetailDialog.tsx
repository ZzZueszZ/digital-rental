"use client";

import {
  Package,
  MapPin,
  CreditCard,
  CheckCircle2,
  X,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import {
  OrderResponse,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/types/order";
import {
  useOrderDetail,
  useConfirmReceived,
  orderService,
} from "@/services/order";
import { formatVND, getImageUrl, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OrderDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: number | null;
  order?: OrderResponse | null;
  isLoading?: boolean;
  isAdminView?: boolean;
}

export function OrderDetailDialog({
  isOpen,
  onClose,
  orderId,
  order: initialOrder,
  isLoading: initialLoading,
  isAdminView = false,
}: OrderDetailDialogProps) {
  const { data: orderRes, isLoading: isFetching } = useOrderDetail(
    orderId || 0,
  );
  const { mutateAsync: confirmReceived, isPending: isConfirming } =
    useConfirmReceived();
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  const order = initialOrder || orderRes?.data;
  const isLoading = initialLoading || (!!orderId && isFetching);

  const handleConfirmReceived = async () => {
    if (!order) return;
    try {
      await confirmReceived(order.id);
      toast.success("Xác nhận đã nhận hàng và hoàn thành đơn hàng!");
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xác nhận nhận hàng";
      toast.error(message);
    }
  };

  const handleRetryPayment = async () => {
    if (!order) return;
    try {
      setIsRetryingPayment(true);
      const response = await orderService.createVnPayUrl(order.id);
      window.location.assign(response.data);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message ||
          "Không thể tạo lại phiên thanh toán. Vui lòng thử lại.",
      );
      setIsRetryingPayment(false);
    }
  };
  return (
    <AdminFormDialog
      open={isOpen}
      onOpenChange={onClose}
      title={order ? `Chi tiết đơn hàng #${order.code}` : "Đang tải..."}
      description="Xem thông tin chi tiết về quá trình giao nhận và sản phẩm"
      icon={Package}
      onSubmit={(e) => e.preventDefault()}
      isPending={isLoading}
      submitText="Đóng"
      submitIcon={X}
      maxWidth="max-w-2xl"
      hideFooter={true}
    >
      {isLoading ? (
        <div className="py-20 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
          <p className="text-xs font-semibold text-zinc-400">
            Đang truy xuất dữ liệu...
          </p>
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* Status Badge & Time */}
          <div className="flex items-center justify-between p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "px-3 py-1 rounded-xl text-[13px] font-semibold border",
                  getStatusStyles(order.status),
                )}
              >
                {getStatusLabel(order.status)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-zinc-400 leading-none mb-1">
                  Phương thức
                </span>
                <span className="text-xs font-semibold text-zinc-600">
                  {order.paymentMethod === PaymentMethod.COD
                    ? "Tiền mặt (COD)"
                    : "VNPay Online"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-zinc-400 block mb-1">
                Ngày đặt hàng
              </span>
              <span className="text-xs font-semibold text-zinc-950">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-900">
                Danh sách sản phẩm
              </h3>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white border border-zinc-100 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="w-16 h-16 rounded-xl bg-zinc-50 p-2 flex items-center justify-center border border-zinc-100 overflow-hidden shrink-0">
                    <img
                      src={
                        getImageUrl(item.productMainImage) ||
                        "/placeholder-camera.jpg"
                      }
                      alt={item.productName}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="text-[15px] font-semibold text-zinc-950 truncate leading-tight mb-1">
                      {item.productName}
                    </h4>
                    <p className="text-xs font-medium text-zinc-500">
                      {formatVND(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right py-1">
                    <p className="text-sm font-semibold text-zinc-950">
                      {formatVND(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Info */}
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Thông tin giao nhận
                </h3>
              </div>
              <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl space-y-3 shadow-[0_2px_6px_rgba(0,0,0,0.04)] flex-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-zinc-400">
                    Người nhận
                  </p>
                  <p className="text-xs font-semibold text-zinc-900">
                    {order.shippingName} • {order.shippingPhone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-zinc-400">
                    Địa chỉ
                  </p>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Trạng thái thanh toán
                </h3>
              </div>
              <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl space-y-3 shadow-[0_2px_6px_rgba(0,0,0,0.04)] flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-zinc-400">
                    Trạng thái
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-xl tracking-tighter border",
                      order.paymentStatus === PaymentStatus.SUCCESS
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : order.paymentStatus === PaymentStatus.PENDING
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200",
                    )}
                  >
                    {order.paymentStatus === PaymentStatus.SUCCESS
                      ? "Đã thanh toán"
                      : order.paymentStatus === PaymentStatus.PENDING
                        ? "Chưa thanh toán"
                        : "Thanh toán thất bại"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100/50">
                  <span className="text-[10px] font-semibold text-zinc-400">
                    Ngày cập nhật
                  </span>
                  <span className="text-xs font-semibold text-zinc-900">
                    {order.completedAt ? formatDate(order.completedAt) : "---"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-5 bg-white border border-zinc-100 rounded-xl space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <CheckCircle2 className="w-20 h-20 text-zinc-900" />
            </div>
            <div className="space-y-2.5 relative z-10">
              <div className="flex justify-between text-[13px] font-medium text-zinc-400">
                <span>Tổng tiền hàng</span>
                <span className="text-zinc-900 font-semibold">
                  {formatVND(order.totalPrice + order.discountAmount)}
                </span>
              </div>
              <div className="flex justify-between text-[13px] font-medium text-zinc-400">
                <span>Giảm giá voucher</span>
                <span className="text-red-500 font-semibold">
                  -{formatVND(order.discountAmount)}
                </span>
              </div>
              <div className="flex justify-between text-[13px] font-medium text-zinc-400">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-500 font-semibold">Miễn phí</span>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 mb-0.5">
                  Tổng cộng thanh toán
                </p>
                <p className="text-[24px] font-semibold text-red-600 tracking-tight leading-none">
                  {formatVND(order.totalPrice)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-600">
                  Giao dịch an toàn
                </span>
              </div>
            </div>
          </div>

          {!isAdminView &&
            order.paymentMethod === PaymentMethod.ONLINE &&
            order.paymentStatus !== PaymentStatus.SUCCESS &&
            order.status !== OrderStatus.CANCELED && (
              <Button
                onClick={handleRetryPayment}
                disabled={isRetryingPayment}
                className="h-11 w-full rounded-xl bg-red-600 text-sm font-medium text-white shadow-none hover:bg-red-700"
              >
                {isRetryingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Thanh toán lại qua VNPay
              </Button>
            )}

          {/* Action Button for Confirmation - ONLY for Customer View */}
          {!isAdminView && order.status === OrderStatus.DELIVERED && (
            <div className="pt-2">
              <Button
                onClick={handleConfirmReceived}
                disabled={isConfirming}
                className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-xs transition-all shadow-xl shadow-emerald-100 border-none hover:bg-zinc-950"
              >
                {isConfirming ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Hoàn thành đơn hàng
              </Button>
              <p className="text-[10px] text-center text-zinc-400 font-semibold mt-3 tracking-wide">
                Vui lòng chỉ xác nhận khi đã kiểm tra kỹ thiết bị
              </p>
            </div>
          )}
        </div>
      ) : null}
    </AdminFormDialog>
  );
}

// Helper functions for statuses
function getStatusStyles(status: OrderStatus) {
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
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING:
      return "Chờ xác nhận";
    case OrderStatus.CONFIRMED:
      return "Đã xác nhận";
    case OrderStatus.SHIPPING:
      return "Đang giao";
    case OrderStatus.DELIVERED:
      return "Đã giao";
    case OrderStatus.COMPLETED:
      return "Hoàn thành";
    case OrderStatus.CANCELED:
      return "Đã hủy";
    default:
      return status;
  }
}
