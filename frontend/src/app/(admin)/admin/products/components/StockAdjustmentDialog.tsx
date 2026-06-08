"use client";

import { useState } from "react";
import { Package, Plus, Minus, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

type ActionType = "IMPORT" | "EXPORT";

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  product,
}: StockAdjustmentDialogProps) {
  const [action, setAction] = useState<ActionType>("IMPORT");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const adjustStockMutation = useAdjustStock(product?.id || 0);

  if (!product) return null;

  const currentStock = product.quantity;
  const isPending = adjustStockMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qtyNum = Number.parseInt(quantity, 10);
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (action === "EXPORT" && qtyNum > currentStock) {
      toast.error(`Số lượng xuất vượt quá kho bán hiện có (${currentStock})`);
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        quantityChange: action === "IMPORT" ? qtyNum : -qtyNum,
        type: "SALE",
        reason: reason.trim() || undefined,
      });
      toast.success("Cập nhật kho bán thành công");
      setQuantity("");
      setReason("");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi điều chỉnh kho bán");
    }
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Package}
      iconClassName="bg-emerald-50 text-emerald-600 animate-pulse"
      title="Điều chỉnh kho bán"
      description={`Cập nhật tồn kho bán cho sản phẩm: ${product.name}`}
      maxWidth="max-w-md"
      hideFooter
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-4 shadow-sm">
          {/* Header of the card */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-emerald-950">kho bán</h4>
              <p className="text-xs font-medium text-emerald-700/70">
                Nhập số lượng cần cộng thêm hoặc trừ bớt.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-white border border-emerald-100 rounded-xl px-3 py-1 shrink-0">
              hiện có {currentStock}
            </span>
          </div>

          {/* Action pills: nhập thêm / trừ bớt */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-emerald-100 bg-white p-1">
            <button
              type="button"
              onClick={() => setAction("IMPORT")}
              disabled={isPending}
              className={cn(
                "h-9 rounded-xl text-xs font-semibold transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60",
                action === "IMPORT"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700",
              )}
            >
              nhập thêm
            </button>
            <button
              type="button"
              onClick={() => setAction("EXPORT")}
              disabled={isPending}
              className={cn(
                "h-9 rounded-xl text-xs font-semibold transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60",
                action === "EXPORT"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-500 hover:bg-red-50 hover:text-red-600",
              )}
            >
              trừ bớt
            </button>
          </div>

          {/* Quantity Input */}
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-zinc-700">
              số lượng {action === "IMPORT" ? "nhập thêm" : "trừ bớt"}
            </span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ví dụ: 10"
              disabled={isPending}
              className="w-full h-10 px-3 rounded-xl border border-emerald-100 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </label>

          {/* Reason Input */}
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-zinc-700">lý do chỉnh kho bán</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: nhập hàng mới, hàng lỗi trả hãng"
              disabled={isPending}
              className="w-full h-10 px-3 rounded-xl border border-emerald-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </label>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full h-10 rounded-xl text-white text-sm font-semibold shadow-md transition-all duration-200 ease-in-out active:scale-[0.98]",
              action === "IMPORT"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                : "bg-red-600 hover:bg-red-700 shadow-red-100",
            )}
          >
            {isPending
              ? "Đang cập nhật..."
              : `${action === "IMPORT" ? "Nhập thêm" : "Trừ bớt"} kho bán`}
          </Button>
        </div>

        <div className="flex gap-2.5 p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 shadow-sm">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
            Hành động này sẽ thay đổi trực tiếp tồn kho bán của sản phẩm trên website và được ghi nhận lại trong lịch sử kho.
          </p>
        </div>
      </div>
    </AdminFormDialog>
  );
}
