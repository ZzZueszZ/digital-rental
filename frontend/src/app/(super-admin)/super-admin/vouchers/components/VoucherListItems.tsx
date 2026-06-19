"use client";

import {
  Ticket,
  MoreHorizontal,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Calendar,
  Zap,
  Tag,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { VoucherResponse } from "@/types/voucher";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface VoucherRowProps {
  voucher: VoucherResponse;
  onEdit: (voucher: VoucherResponse) => void;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
  onDelete: (id: number) => void;
}

export function VoucherTableRow({
  voucher,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: VoucherRowProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Hoạt động",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "DRAFT":
        return {
          label: "Bản nháp",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "EXPIRED":
        return {
          label: "Hết hạn",
          className: "bg-red-50 text-red-700 border-red-200",
        };
      case "INACTIVE":
        return {
          label: "Vô hiệu",
          className: "bg-zinc-50 text-zinc-600 border-zinc-200",
        };
      default:
        return { label: status, className: "bg-zinc-100 text-zinc-500" };
    }
  };

  const status = getStatusConfig(voucher.status);

  return (
    <tr
      onClick={() => onEdit(voucher)}
      className="group transition-all duration-300 hover:bg-zinc-50/50 cursor-pointer"
    >
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200/50 group-hover:scale-105 transition-transform duration-150">
            <Ticket className="w-5 h-5 text-zinc-400 group-hover:text-red-600 transition-colors" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-950 tracking-tight mb-0.5 group-hover:text-red-600 transition-colors duration-300">
              {voucher.code}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-xl">
                ID: {voucher.id}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <div className="flex flex-col max-w-[200px]">
          <span className="text-sm font-semibold text-zinc-900 line-clamp-1">
            {voucher.name}
          </span>
          <span className="text-xs font-medium text-zinc-400 line-clamp-1 italic">
            {voucher.description || "Không có mô tả"}
          </span>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "w-fit min-w-max shrink-0 whitespace-nowrap rounded-xl px-2.5 py-1 text-[10px] font-semibold border ring-0 shadow-none",
                status.className,
              )}
            >
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span>
              {voucher.type === "PERCENTAGE"
                ? `Giảm ${voucher.discountValue}%`
                : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")} ₫`}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-zinc-300" />
            <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full"
                style={{
                  width: `${voucher.maxUsage ? (voucher.usedCount / voucher.maxUsage) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-600">
              {voucher.usedCount}/{voucher.maxUsage || "∞"}
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400 pl-5">
            Lượt sử dụng
          </span>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-xs font-semibold text-zinc-600">
              {voucher.endDate
                ? format(new Date(voucher.endDate), "dd/MM/yy", { locale: vi })
                : "Vô thời hạn"}
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400 pl-5">
            Ngày hết hạn
          </span>
        </div>
      </td>
      <td
        className="px-6 py-3.5 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-xl hover:bg-zinc-100 outline-none">
            <MoreHorizontal className="w-4 h-4 text-zinc-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-1.5 rounded-xl border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-semibold text-zinc-500 px-3 py-1.5">
                Tác vụ Voucher
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onEdit(voucher)}
                className="cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa thông tin
              </DropdownMenuItem>
              {voucher.status !== "ACTIVE" && (
                <DropdownMenuItem
                  onClick={() => onActivate(voucher.id)}
                  className="cursor-pointer text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700"
                >
                  <Power className="w-3.5 h-3.5" /> Kích hoạt Voucher
                </DropdownMenuItem>
              )}
              {voucher.status === "ACTIVE" && (
                <DropdownMenuItem
                  onClick={() => onDeactivate(voucher.id)}
                  className="cursor-pointer text-amber-700 focus:bg-amber-50 focus:text-amber-700"
                >
                  <PowerOff className="w-3.5 h-3.5" /> Tạm dừng Voucher
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(voucher.id)}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa Voucher
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function VoucherMobileCard({
  voucher,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: VoucherRowProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Hoạt động",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "DRAFT":
        return {
          label: "Nháp",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      default:
        return {
          label: status,
          className: "bg-zinc-50 text-zinc-600 border-zinc-200",
        };
    }
  };

  const status = getStatusConfig(voucher.status);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50">
            <Ticket className="w-4 h-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-semibold tracking-tight text-zinc-950">
              {voucher.code}
            </span>
            <span className="truncate text-[10px] font-medium text-zinc-500">
              {voucher.name}
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "w-fit min-w-max shrink-0 whitespace-nowrap text-[9px] font-semibold px-2 py-0.5 border",
            status.className,
          )}
        >
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col">
          <span className="mb-1 flex items-center gap-1 text-[9px] font-medium tracking-tight text-zinc-500">
            <Tag className="w-3 h-3" /> Ưu đãi
          </span>
          <span className="text-xs font-semibold text-zinc-950">
            {voucher.type === "PERCENTAGE"
              ? `${voucher.discountValue}%`
              : `${voucher.discountValue.toLocaleString()} ₫`}
          </span>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="mb-1 flex items-center gap-1 text-[9px] font-medium tracking-tight text-zinc-500">
            <Calendar className="w-3 h-3" /> Hết hạn
          </span>
          <span className="text-xs font-semibold text-zinc-950">
            {voucher.endDate
              ? format(new Date(voucher.endDate), "dd/MM/yy")
              : "∞"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
        <Button
          variant="outline"
          onClick={() => onEdit(voucher)}
          className="h-10 w-full rounded-xl border-zinc-200 bg-white text-[12px] font-semibold tracking-tight text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
        >
          Sửa
        </Button>
        {voucher.status === "ACTIVE" ? (
          <Button
            variant="outline"
            onClick={() => onDeactivate(voucher.id)}
            className="h-10 w-full rounded-xl border-red-200 bg-red-50 text-[12px] font-semibold tracking-tight text-red-700 hover:bg-red-100 hover:text-red-700"
          >
            Vô hiệu
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => onActivate(voucher.id)}
            className="h-10 w-full rounded-xl border-emerald-200 bg-emerald-50 text-[12px] font-semibold tracking-tight text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700"
          >
            Mở
          </Button>
        )}
      </div>
    </div>
  );
}
