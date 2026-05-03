"use client";

import { useState } from "react";
import { Package, Plus, Minus, Send, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ProductResponse } from "@/types/product";
import { useAdjustStock } from "@/services/inventory";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { cn } from "@/lib/utils";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResponse | null;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  product,
}: StockAdjustmentDialogProps) {
  const [quantity, setQuantity] = useState<string>("0");
  const [type, setType] = useState<"IMPORT" | "EXPORT">("IMPORT");
  const [reason, setReason] = useState("");

  const adjustStockMutation = useAdjustStock(product?.id || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity);

    if (isNaN(qtyNum) || qtyNum === 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (type === "EXPORT" && product && product.quantity < qtyNum) {
      toast.error(
        `Số lượng xuất vượt quá tồn kho (Hiện có: ${product.quantity})`,
      );
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        quantityChange: type === "IMPORT" ? qtyNum : -qtyNum,
        reason: reason.trim() || undefined,
      });
      toast.success("Cập nhật tồn kho thành công");
      setQuantity("0");
      setReason("");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi điều chỉnh kho");
    }
  };

  if (!product) return null;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Package}
      iconClassName="bg-zinc-50 text-red-600"
      title="Điều chỉnh kho"
      description={`Cập nhật số lượng tồn kho cho: ${product.name}`}
      onSubmit={handleSubmit}
      isPending={adjustStockMutation.isPending}
      submitText="Xác nhận"
      submitIcon={Send}
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Current Stock Indicator */}
        <div className="bg-zinc-50 rounded-2xl p-4 flex items-center justify-between border border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center">
              <Package className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Tồn kho hiện tại
              </p>
              <p className="text-xl font-black text-zinc-950">
                {product.quantity}{" "}
                <span className="text-[10px] uppercase text-zinc-400 ml-1">
                  Sản phẩm
                </span>
              </p>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-200 mx-2" />
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Trạng thái
            </p>
            <p
              className={cn(
                "text-xs font-black uppercase",
                product.quantity > 5 ? "text-emerald-600" : "text-red-600",
              )}
            >
              {product.quantity > 5 ? "Sẵn sàng" : "Sắp hết hàng"}
            </p>
          </div>
        </div>

        {/* Action Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
          <button
            type="button"
            onClick={() => setType("IMPORT")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              type === "IMPORT"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            <Plus className="w-4 h-4" />
            Nhập kho
          </button>
          <button
            type="button"
            onClick={() => setType("EXPORT")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              type === "EXPORT"
                ? "bg-white text-red-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            <Minus className="w-4 h-4" />
            Xuất kho
          </button>
        </div>

        {/* Quantity Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
            Số lượng thay đổi
          </label>
          <div className="relative group">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="pl-12 h-12 bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-red-600/20 focus:border-red-600 transition-all text-sm font-black rounded-xl"
              placeholder="Nhập số lượng..."
              min="1"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {type === "IMPORT" ? (
                <Plus className="w-5 h-5 text-emerald-500" />
              ) : (
                <Minus className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Reason Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Lý do điều chỉnh
            </label>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
              Tùy chọn
            </span>
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px] bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-red-600/20 focus:border-red-600 transition-all text-xs font-medium rounded-xl resize-none"
            placeholder="Ghi chú lý do thay đổi kho (ví dụ: Nhập hàng mới, Hàng lỗi, Kiểm kê...)"
          />
        </div>

        {/* Info Note */}
        <div className="flex gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
          <Info className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-[11px] font-medium text-red-900 leading-relaxed">
            Hành động này sẽ được ghi vào{" "}
            <span className="font-black uppercase">Lịch sử kho</span> của hệ
            thống. Vui lòng kiểm tra kỹ số lượng trước khi xác nhận.
          </p>
        </div>
      </div>
    </AdminFormDialog>
  );
}
