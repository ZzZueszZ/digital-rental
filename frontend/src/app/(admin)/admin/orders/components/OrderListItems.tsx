"use client";

import { 
  Eye, 
  MoreHorizontal, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { OrderResponse, OrderStatus, PaymentStatus } from "@/types/order";
import { formatVND } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OrderItemsProps {
  order: OrderResponse;
  onView: (id: number) => void;
  onUpdateStatus: (id: number, status: OrderStatus) => void;
}

export function OrderTableRow({ order, onView, onUpdateStatus }: OrderItemsProps) {
  return (
    <tr className="admin-table-row group">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-black text-zinc-950 group-hover:text-red-600 transition-colors">
            #{order.code}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] font-bold text-zinc-400">
              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-900 truncate max-w-[180px]">
            {order.shippingName}
          </span>
          <span className="text-[11px] font-medium text-zinc-400 truncate max-w-[180px]">
            {order.userEmail}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-black text-zinc-950">
            {formatVND(order.totalPrice)}
          </span>
          <span className={cn(
            "text-[10px] font-bold mt-1",
            order.paymentStatus === PaymentStatus.PAID ? "text-emerald-600" : "text-red-500"
          )}>
            {order.paymentStatus === PaymentStatus.PAID ? "Đã thanh toán" : "Chưa thanh toán"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold",
          getStatusStyles(order.status)
        )}>
          {getStatusLabel(order.status)}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 hover:bg-zinc-100 rounded-lg cursor-pointer outline-none")}>
            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-xl border-zinc-100 bg-white animate-in zoom-in-95 duration-200">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-bold text-zinc-400 px-2 py-1.5 uppercase tracking-widest">
                Thao tác đơn hàng
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => onView(order.id)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="my-1 bg-zinc-50" />
            
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-bold text-zinc-400 px-2 py-1.5 uppercase tracking-widest">
                Cập nhật trạng thái
              </DropdownMenuLabel>
              
              {getNextStatuses(order.status).map(status => (
                <DropdownMenuItem 
                  key={status}
                  onClick={() => onUpdateStatus(order.id, status)}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer",
                    status === OrderStatus.CANCELED ? "text-red-600 hover:bg-red-50" : "text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50"
                  )}
                >
                  {getStatusIcon(status)}
                  {getStatusLabel(status)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function OrderMobileCard({ order, onView, onUpdateStatus }: OrderItemsProps) {
  return (
    <div className="admin-card p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-sm font-black text-zinc-950">#{order.code}</span>
          <span className="text-[11px] font-bold text-zinc-400">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-lg border text-[11px] font-bold",
          getStatusStyles(order.status)
        )}>
          {getStatusLabel(order.status)}
        </div>
      </div>

      <div className="py-3 border-y border-zinc-50 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
          <Mail className="w-3.5 h-3.5 text-zinc-400" />
          <span className="truncate">{order.userEmail}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tổng tiền:</span>
          <span className="text-sm font-black text-red-600">{formatVND(order.totalPrice)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button 
          variant="outline" 
          onClick={() => onView(order.id)}
          className="flex-1 h-9 rounded-xl border-zinc-100 text-xs font-bold hover:bg-zinc-50"
        >
          Chi tiết
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "default" }), "flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold cursor-pointer outline-none text-white border-none")}>
            Trạng thái
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-xl bg-white">
             {getNextStatuses(order.status).map(status => (
              <DropdownMenuItem 
                key={status}
                onClick={() => onUpdateStatus(order.id, status)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-bold"
              >
                {getStatusIcon(status)}
                {getStatusLabel(status)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
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

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case OrderStatus.CONFIRMED: return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case OrderStatus.SHIPPING: return <Truck className="w-4 h-4 text-indigo-500" />;
    case OrderStatus.DELIVERED: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case OrderStatus.COMPLETED: return <CheckCircle2 className="w-4 h-4 text-zinc-900" />;
    case OrderStatus.CANCELED: return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

function getNextStatuses(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case OrderStatus.PENDING: return [OrderStatus.CONFIRMED, OrderStatus.CANCELED];
    case OrderStatus.CONFIRMED: return [OrderStatus.SHIPPING, OrderStatus.CANCELED];
    case OrderStatus.SHIPPING: return [OrderStatus.DELIVERED];
    case OrderStatus.DELIVERED: return [];
    default: return [];
  }
}
