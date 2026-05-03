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
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
}

export function VoucherTableRow({ 
  voucher, 
  onEdit, 
  onActivate, 
  onDeactivate 
}: VoucherRowProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "Hoạt động", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "DRAFT":
        return { label: "Bản nháp", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      case "EXPIRED":
        return { label: "Hết hạn", className: "bg-red-500/10 text-red-600 border-red-500/20" };
      case "INACTIVE":
        return { label: "Vô hiệu", className: "bg-zinc-100 text-zinc-500 border-zinc-200" };
      default:
        return { label: status, className: "bg-zinc-100 text-zinc-500" };
    }
  };

  const status = getStatusConfig(voucher.status);

  return (
    <tr className="group hover:bg-zinc-50/50 transition-all duration-300">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Ticket className="w-5 h-5 text-zinc-400 group-hover:text-red-600 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-950 tracking-tight">{voucher.code}</span>
            <span className="text-xs font-medium text-zinc-400">ID: #{voucher.id}</span>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col max-w-[200px]">
          <span className="text-sm font-semibold text-zinc-900 line-clamp-1">{voucher.name}</span>
          <span className="text-xs font-medium text-zinc-400 line-clamp-1 italic">{voucher.description || "Không có mô tả"}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5 border-0 shadow-none", status.className)}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span>
              {voucher.type === "PERCENTAGE" 
                ? `Giảm ${voucher.discountValue}%` 
                : `Giảm ${voucher.discountValue.toLocaleString('vi-VN')} ₫`}
            </span>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-zinc-300" />
            <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 rounded-full" 
                style={{ width: `${voucher.maxUsage ? (voucher.usedCount / voucher.maxUsage) * 100 : 0}%` }} 
              />
            </div>
            <span className="text-xs font-semibold text-zinc-600">{voucher.usedCount}/{voucher.maxUsage || "∞"}</span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400 pl-5">Lượt sử dụng</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-xs font-semibold text-zinc-600">
              {voucher.endDate ? format(new Date(voucher.endDate), "dd/MM/yy", { locale: vi }) : "Vô thời hạn"}
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400 pl-5">Ngày hết hạn</span>
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 outline-none",
            "hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200",
            "text-zinc-400 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/10"
          )}>
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-zinc-100 shadow-xl">
            <DropdownMenuItem 
              onClick={() => onEdit(voucher)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
            >
              <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-zinc-50" />
            {voucher.status !== "ACTIVE" && (
              <DropdownMenuItem 
                onClick={() => onActivate(voucher.id)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs font-bold text-emerald-600 hover:bg-emerald-50"
              >
                <Power className="w-3.5 h-3.5" /> Kích hoạt
              </DropdownMenuItem>
            )}
            {voucher.status === "ACTIVE" && (
              <DropdownMenuItem 
                onClick={() => onDeactivate(voucher.id)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs font-bold text-red-600 hover:bg-red-50"
              >
                <PowerOff className="w-3.5 h-3.5" /> Vô hiệu hóa
              </DropdownMenuItem>
            )}
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
  onDeactivate 
}: VoucherRowProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "Hoạt động", className: "bg-emerald-500/10 text-emerald-600" };
      case "DRAFT":
        return { label: "Nháp", className: "bg-amber-500/10 text-amber-600" };
      default:
        return { label: status, className: "bg-zinc-100 text-zinc-500" };
    }
  };

  const status = getStatusConfig(voucher.status);

  return (
    <div className="p-5 bg-white rounded-3xl border border-zinc-100 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider">{voucher.code}</span>
            <span className="text-[10px] font-bold text-zinc-400">{voucher.name}</span>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[9px] uppercase font-black px-2 py-0.5 border-0", status.className)}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-2xl">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Ưu đãi
          </span>
          <span className="text-xs font-bold text-zinc-950">
            {voucher.type === "PERCENTAGE" ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString()} ₫`}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Hết hạn
          </span>
          <span className="text-xs font-bold text-zinc-950">
            {voucher.endDate ? format(new Date(voucher.endDate), "dd/MM/yy") : "∞"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button 
          variant="outline" 
          onClick={() => onEdit(voucher)}
          className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-100 hover:bg-zinc-50"
        >
          Sửa
        </Button>
        {voucher.status === "ACTIVE" ? (
          <Button 
            variant="outline" 
            onClick={() => onDeactivate(voucher.id)}
            className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-100 text-red-600 hover:bg-red-50"
          >
            Vô hiệu
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => onActivate(voucher.id)}
            className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-100 text-emerald-600 hover:bg-emerald-50"
          >
            Mở
          </Button>
        )}
      </div>
    </div>
  );
}
