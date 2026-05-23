"use client";

import { useState, useEffect } from "react";
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
  const [stockType, setStockType] = useState<"SALE" | "RENTAL">("SALE");
  const [reason, setReason] = useState("");

  const adjustStockMutation = useAdjustStock(product?.id || 0);

  useEffect(() => {
    if (product) {
      if (product.isForSale) {
        setStockType("SALE");
      } else if (product.isForRent) {
        setStockType("RENTAL");
      }
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity);

    if (isNaN(qtyNum) || qtyNum === 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    const currentStock = stockType === "RENTAL" ? (product?.rentalQuantity ?? 0) : (product?.quantity ?? 0);

    if (type === "EXPORT" && qtyNum > currentStock) {
      toast.error(
        `Số lượng xuất vượt quá tồn kho (Hiện có: ${currentStock})`,
      );
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        quantityChange: type === "IMPORT" ? qtyNum : -qtyNum,
        type: stockType,
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

  const currentStock = stockType === "RENTAL" ? (product.rentalQuantity ?? 0) : product.quantity;

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
        {/* Stock Type Selection (only if both isForSale and isForRent are true) */}
        {product.isForSale && product.isForRent && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              Loại kho điều chỉnh
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
              <button
                type="button"
                onClick={() => setStockType("SALE")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  stockType === "SALE"
                    ? "bg-white text-zinc-950 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                    : "text-zinc-500 hover:text-zinc-700",
                )}
              >
                Kho bán lẻ
              </button>
              <button
                type="button"
                onClick={() => setStockType("RENTAL")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  stockType === "RENTAL"
                    ? "bg-white text-zinc-950 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                    : "text-zinc-500 hover:text-zinc-700",
                )}
              >
                Kho cho thuê
              </button>
            </div>
          </div>
        )}

        {/* Current Stock Indicator */}
        <div className="bg-zinc-50 rounded-xl p-4 flex items-center justify-between border border-black/5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-black/5 flex items-center justify-center">
              <Package className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Tồn kho hiện tại ({stockType === "SALE" ? "Bán lẻ" : "Cho thuê"})
              </p>
              <p className="text-xl font-black text-zinc-950">
                {currentStock}{" "}
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
                currentStock > 5 ? "text-emerald-600" : "text-red-600",
              )}
            >
              {currentStock > 5 ? "Sẵn sàng" : "Sắp hết hàng"}
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
                ? "bg-white text-emerald-600 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
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
                ? "bg-white text-red-600 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
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
              className="pl-12 h-12 bg-zinc-50 border-black/5 focus:bg-white focus:ring-red-600/20 focus:border-red-600 transition-all text-sm font-black rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
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
            className="min-h-[100px] bg-zinc-50 border-black/5 focus:bg-white focus:ring-red-600/20 focus:border-red-600 transition-all text-xs font-medium rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.04)] resize-none"
            placeholder="Ghi chú lý do thay đổi kho (ví dụ: Nhập hàng mới, Hàng lỗi, Kiểm kê...)"
          />
        </div>

        {/* Info Note */}
        <div className="flex gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100/50 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
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
