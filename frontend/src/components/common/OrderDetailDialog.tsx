"use client";

import { 
  Package, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  X, 
  Loader2,
  Clock,
  User,
  ShoppingBag
} from "lucide-react";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { OrderResponse, OrderStatus, PaymentStatus } from "@/types/order";
import { formatVND } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OrderDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
  isLoading: boolean;
}

export function OrderDetailDialog({ isOpen, onClose, order, isLoading }: OrderDetailDialogProps) {
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
          <p className="text-xs font-semibold text-zinc-400">Đang truy xuất dữ liệu...</p>
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* Status Badge & Time */}
          <div className="flex items-center justify-between p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className={cn("px-3 py-1 rounded-lg text-[13px] font-bold border", getStatusStyles(order.status))}>
                {getStatusLabel(order.status)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 leading-none mb-1">Phương thức</span>
                <span className="text-xs font-bold text-zinc-600">{order.paymentMethod}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 block mb-1">Ngày đặt hàng</span>
              <span className="text-xs font-bold text-zinc-950">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-900">Danh sách sản phẩm</h3>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-white border border-zinc-100 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 group">
                  <div className="w-16 h-16 rounded-lg bg-zinc-50 p-2 flex items-center justify-center border border-zinc-100 overflow-hidden shrink-0">
                    <img
                      src={item.productMainImage ? `http://localhost:8080${item.productMainImage}` : "/placeholder-camera.jpg"}
                      alt={item.productName}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="text-[15px] font-bold text-zinc-950 truncate leading-tight mb-1">{item.productName}</h4>
                    <p className="text-xs font-medium text-zinc-500">
                      {formatVND(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right py-1">
                    <p className="text-sm font-black text-zinc-950">{formatVND(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900">Thông tin giao nhận</h3>
              </div>
              <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl space-y-3 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400">Người nhận</p>
                  <p className="text-xs font-bold text-zinc-900">{order.shippingName} • {order.shippingPhone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400">Địa chỉ</p>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed">{order.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900">Trạng thái thanh toán</h3>
              </div>
              <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl space-y-3 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400">Trạng thái</span>
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded tracking-tighter", 
                    order.paymentStatus === PaymentStatus.PAID ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100/50">
                  <span className="text-[10px] font-bold text-zinc-400">Ngày cập nhật</span>
                  <span className="text-xs font-bold text-zinc-900">
                    {order.completedAt ? new Date(order.completedAt).toLocaleString("vi-VN") : "---"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-5 bg-white border border-zinc-100 rounded-2xl space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <CheckCircle2 className="w-20 h-20 text-zinc-900" />
            </div>
            <div className="space-y-2.5 relative z-10">
              <div className="flex justify-between text-[13px] font-medium text-zinc-400">
                <span>Tổng tiền hàng</span>
                <span className="text-zinc-900 font-semibold">{formatVND(order.totalPrice + order.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-medium text-zinc-400">
                <span>Giảm giá voucher</span>
                <span className="text-red-500 font-semibold">-{formatVND(order.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-medium text-zinc-400">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-500 font-semibold">Miễn phí</span>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 mb-0.5">Tổng cộng thanh toán</p>
                <p className="text-[24px] font-bold text-red-600 tracking-tight leading-none">{formatVND(order.totalPrice)}</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600">Giao dịch an toàn</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminFormDialog>
  );
}

// Helper functions for statuses
function getStatusStyles(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING: return "bg-amber-50 text-amber-600 border-amber-100";
    case OrderStatus.CONFIRMED: return "bg-blue-50 text-blue-600 border-blue-100";
    case OrderStatus.SHIPPING: return "bg-indigo-50 text-indigo-600 border-indigo-100";
    case OrderStatus.DELIVERED: return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case OrderStatus.COMPLETED: return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case OrderStatus.CANCELED: return "bg-red-50 text-red-600 border-red-100";
    default: return "bg-zinc-50 text-zinc-500 border-zinc-100";
  }
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING: return "Chờ xác nhận";
    case OrderStatus.CONFIRMED: return "Đã xác nhận";
    case OrderStatus.SHIPPING: return "Đang giao";
    case OrderStatus.DELIVERED: return "Đã giao";
    case OrderStatus.COMPLETED: return "Hoàn thành";
    case OrderStatus.CANCELED: return "Đã hủy";
    default: return status;
  }
}
