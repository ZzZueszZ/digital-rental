"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Ticket,
  TrendingUp,
  AlertCircle,
  Zap,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useActivateVoucher,
  useDeactivateVoucher,
} from "@/services/voucher";
import { VoucherResponse, VoucherCreateRequest } from "@/types/voucher";
import { Pagination } from "../components/Pagination";
import { VoucherDialog } from "./components/VoucherDialog";
import {
  VoucherTableRow,
  VoucherMobileCard,
} from "./components/VoucherListItems";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "../users/components/EmptyState";
import { StatCard } from "../components/StatCard";

export default function VouchersAdminPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] =
    useState<VoucherResponse | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const { data: voucherRes, isLoading } = useVouchers(page, 10);
  const vouchers = voucherRes?.data || [];
  const pagination = voucherRes?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;

  // Filter local for search (simple implementation)
  const filteredVouchers = vouchers.filter(
    (v) =>
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Mutations
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher(selectedVoucher?.id || 0);
  const activateMutation = useActivateVoucher();
  const deactivateMutation = useDeactivateVoucher();

  const handleCreateOrUpdate = async (values: VoucherCreateRequest) => {
    try {
      if (selectedVoucher) {
        await updateMutation.mutateAsync(values);
        toast.success("Cập nhật voucher thành công");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Tạo voucher mới thành công (Trạng thái: Nháp)");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    }
  };

  const handleActivate = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Kích hoạt Voucher?",
      description:
        "Voucher này sẽ có thể áp dụng cho các đơn hàng của khách hàng.",
      variant: "info",
      onConfirm: async () => {
        try {
          await activateMutation.mutateAsync(id);
          toast.success("Đã kích hoạt voucher");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Không thể kích hoạt",
          );
        }
      },
    });
  };

  const handleDeactivate = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Vô hiệu hóa Voucher?",
      description: "Khách hàng sẽ không thể sử dụng mã giảm giá này nữa.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deactivateMutation.mutateAsync(id);
          toast.success("Đã vô hiệu hóa voucher");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Không thể vô hiệu hóa",
          );
        }
      },
    });
  };

  // Use lazy state initialization to keep 'now' stable across renders
  const [now] = useState(() => Date.now());

  // Let React Compiler handle memoization for these derived values
  const threshold = new Date(now + 7 * 24 * 60 * 60 * 1000);
  const expiringSoonCount = vouchers.filter(
    (v) => v.status === "ACTIVE" && new Date(v.endDate) < threshold,
  ).length;

  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng Voucher"
          value={totalElements}
          trend={0}
          icon={Ticket}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Đang chạy"
          value={vouchers.filter((v) => v.status === "ACTIVE").length}
          trend={5}
          icon={CheckCircle2}
          accent="bg-emerald-500"
        />
        <StatCard
          title="Sắp hết hạn"
          value={expiringSoonCount}
          trend={0}
          icon={Clock}
          accent="bg-amber-500"
        />
        <StatCard
          title="Sử dụng"
          value={vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0)}
          trend={2.4}
          icon={Zap}
          accent="bg-red-600"
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
                  <Ticket className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-[30px] font-semibold text-zinc-950 tracking-tight leading-tight">
                  Quản lý Voucher
                </h2>
              </div>
              <p className="text-[14px] text-zinc-500 font-medium ml-12">
                Chương trình khuyến mãi và mã giảm giá
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-72 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors" />
                <Input
                  placeholder="Tìm mã hoặc tên..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {/* Desktop */}
          <div className="hidden lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Mã Voucher
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Thông tin
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Giá trị & Trạng thái
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Sử dụng
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Thời hạn
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="h-12 bg-zinc-50 rounded-xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="Trống"
                        description="Chưa có mã giảm giá nào được tạo."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((v) => (
                    <VoucherTableRow
                      key={v.id}
                      voucher={v}
                      onEdit={(v) => {
                        setSelectedVoucher(v);
                        setIsDialogOpen(true);
                      }}
                      onActivate={handleActivate}
                      onDeactivate={handleDeactivate}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden p-4 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-zinc-50 rounded-3xl animate-pulse"
                />
              ))
            ) : filteredVouchers.length === 0 ? (
              <EmptyState title="Trống" description="Không có voucher nào." />
            ) : (
              filteredVouchers.map((v) => (
                <VoucherMobileCard
                  key={v.id}
                  voucher={v}
                  onEdit={(v) => {
                    setSelectedVoucher(v);
                    setIsDialogOpen(true);
                  }}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                />
              ))
            )}
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

      <VoucherDialog
        key={isDialogOpen ? selectedVoucher?.id || "new" : "closed"}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        voucher={selectedVoucher}
        onSubmit={handleCreateOrUpdate}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(o) => setConfirmConfig((prev) => ({ ...prev, open: o }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
