"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useAllOrders,
  useUpdateOrderStatus,
  orderService,
} from "@/services/order";
import { OrderResponse, OrderStatus } from "@/types/order";
import { OrderTableRow, OrderMobileCard } from "./components/OrderListItems";
import { OrderDetailDialog } from "@/components/common/OrderDetailDialog";
import { Pagination } from "../components/Pagination";
import { EmptyState } from "../users/components/EmptyState";
import { StatCard } from "../components/StatCard";
import { cn } from "@/lib/utils";

export default function OrdersAdminPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: ordersRes, isLoading } = useAllOrders({ page, size: 10 });
  const updateStatusMutation = useUpdateOrderStatus();

  const orders = ordersRes?.data || [];
  const pagination = ordersRes?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;

  // Filtered orders (simple client-side for now, or you can add server-side params)
  const filteredOrders = orders.filter(
    (o) =>
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleView = (id: number) => {
    setSelectedOrderId(id);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success("Cập nhật trạng thái đơn hàng thành công");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái";
      toast.error(message);
    }
  };

  const { data: selectedOrder, isLoading: isOrderLoading } = {
    data: selectedOrderId ? orders.find((o) => o.id === selectedOrderId) : null,
    isLoading: false,
  };

  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng đơn hàng"
          value={totalElements}
          trend={15}
          icon={ShoppingBag}
          accent="bg-red-600"
        />
        <StatCard
          title="Chờ xác nhận"
          value={orders.filter((o) => o.status === OrderStatus.PENDING).length}
          icon={Clock}
          accent="bg-amber-500"
        />
        <StatCard
          title="Đang giao hàng"
          value={orders.filter((o) => o.status === OrderStatus.SHIPPING).length}
          icon={Truck}
          accent="bg-blue-500"
        />
        <StatCard
          title="Đã hoàn thành"
          value={
            orders.filter((o) => o.status === OrderStatus.COMPLETED).length
          }
          icon={CheckCircle2}
          accent="bg-emerald-500"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 sm:py-5 border-b border-zinc-50">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100/20">
                  <ShoppingBag
                    className="w-4.5 h-4.5 text-white"
                    strokeWidth={2}
                  />
                </div>
                <h2 className="text-2xl font-bold text-zinc-950 tracking-tight leading-tight">
                  Quản lý đơn hàng
                </h2>
              </div>
              <p className="text-[14px] text-zinc-500 font-medium ml-12">
                Theo dõi và xử lý các đơn đặt hàng từ khách hàng
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-80 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors duration-200" />
                <Input
                  placeholder="Tìm theo mã đơn, email, tên..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border-zinc-100 bg-zinc-50/50 text-[14px] font-bold text-zinc-600 gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
              </Button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="overflow-x-auto">
          {/* Desktop View */}
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">
                    Tổng thanh toán
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6">
                        <div className="h-12 bg-zinc-50 rounded-xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="Không tìm thấy đơn hàng"
                        description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <OrderTableRow
                      key={order.id}
                      order={order}
                      onView={handleView}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden p-4 space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-zinc-50 rounded-xl animate-pulse"
                  />
                ))
              : filteredOrders.map((order) => (
                  <OrderMobileCard
                    key={order.id}
                    order={order}
                    onView={handleView}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={10}
          onPageChange={setPage}
        />
      </div>

      {/* Dialogs */}
      <OrderDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder || null}
        isLoading={isOrderLoading}
        isAdminView={true}
      />
    </div>
  );
}
