"use client";

import { useState } from "react";
import { Package, Plus, Minus, Send, Info, ShoppingBag, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type StockType = "SALE" | "RENTAL";
type ActionType = "IMPORT" | "EXPORT";

interface StockFormState {
  action: ActionType;
  quantity: string;
  reason: string;
}

const initialFormState: StockFormState = {
  action: "IMPORT",
  quantity: "",
  reason: "",
};

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  product,
}: StockAdjustmentDialogProps) {
  const [forms, setForms] = useState<Record<StockType, StockFormState>>({
    SALE: initialFormState,
    RENTAL: initialFormState,
  });

  const [activeSubmit, setActiveSubmit] = useState<StockType | null>(null);
  const adjustStockMutation = useAdjustStock(product?.id || 0);

  const updateForm = <K extends keyof StockFormState>(
    stockType: StockType,
    key: K,
    value: StockFormState[K],
  ) => {
    setForms((current) => ({
      ...current,
      [stockType]: {
        ...current[stockType],
        [key]: value,
      },
    }));
  };

  const resetForm = (stockType: StockType) => {
    setForms((current) => ({
      ...current,
      [stockType]: initialFormState,
    }));
  };

  const handleSubmit = async (stockType: StockType) => {
    if (!product) return;

    const form = forms[stockType];
    const qtyNum = Number.parseInt(form.quantity, 10);
    const currentStock = stockType === "RENTAL" ? (product.rentalQuantity ?? 0) : product.quantity;
    const stockLabel = stockType === "RENTAL" ? "kho thuê" : "kho bán";

    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      toast.error(`Vui lòng nhập số lượng hợp lệ cho ${stockLabel}`);
      return;
    }

    if (form.action === "EXPORT" && qtyNum > currentStock) {
      toast.error(`Số lượng xuất vượt quá ${stockLabel} hiện có (${currentStock})`);
      return;
    }

    try {
      setActiveSubmit(stockType);
      await adjustStockMutation.mutateAsync({
        quantityChange: form.action === "IMPORT" ? qtyNum : -qtyNum,
        type: stockType,
        reason: form.reason.trim() || undefined,
      });
      toast.success(`Cập nhật ${stockLabel} thành công`);
      resetForm(stockType);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Lỗi khi điều chỉnh ${stockLabel}`);
    } finally {
      setActiveSubmit(null);
    }
  };

  if (!product) return null;

  const isPending = adjustStockMutation.isPending;

  const renderStockForm = ({
    stockType,
    title,
    description,
    currentStock,
    enabled,
    icon: Icon,
    accentClass,
  }: {
    stockType: StockType;
    title: string;
    description: string;
    currentStock: number;
    enabled: boolean;
    icon: typeof ShoppingBag;
    accentClass: string;
  }) => {
    const form = forms[stockType];
    const isActive = activeSubmit === stockType;

    return (
      <section
        className={cn(
          "rounded-xl border border-black/5 bg-zinc-50/70 p-4 shadow-dash-sm space-y-4",
          !enabled && "opacity-60",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0">
              <Icon className={cn("w-5 h-5", accentClass)} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
              <p className="text-xs text-zinc-500 mt-1">{description}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-medium text-zinc-500">hiện có</p>
            <p className="text-lg font-black text-zinc-950">
              {currentStock} <span className="text-xs font-semibold text-zinc-400">sản phẩm</span>
            </p>
          </div>
        </div>

        {!enabled && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            Sản phẩm chưa bật hình thức này, nhưng bạn vẫn có thể chuẩn bị tồn kho nếu cần.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border border-black/5">
          <button
            type="button"
            onClick={() => updateForm(stockType, "action", "IMPORT")}
            disabled={isPending}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60",
              form.action === "IMPORT"
                ? "bg-emerald-50 text-emerald-600 shadow-dash-sm"
                : "text-zinc-500 hover:text-zinc-800",
            )}
          >
            <Plus className="w-4 h-4" />
            nhập kho
          </button>
          <button
            type="button"
            onClick={() => updateForm(stockType, "action", "EXPORT")}
            disabled={isPending}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60",
              form.action === "EXPORT"
                ? "bg-red-50 text-red-600 shadow-dash-sm"
                : "text-zinc-500 hover:text-zinc-800",
            )}
          >
            <Minus className="w-4 h-4" />
            xuất kho
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 ml-1">số lượng</label>
            <div className="relative">
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => updateForm(stockType, "quantity", e.target.value)}
                className="h-11 bg-white border-black/5 focus:ring-red-600/20 focus:border-red-600 text-sm font-bold rounded-xl pl-10 shadow-dash-sm"
                placeholder="0"
                min="1"
                disabled={isPending}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {form.action === "IMPORT" ? (
                  <Plus className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Minus className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-semibold text-zinc-500">lý do điều chỉnh</label>
              <span className="text-[11px] font-medium text-zinc-400">tùy chọn</span>
            </div>
            <Textarea
              value={form.reason}
              onChange={(e) => updateForm(stockType, "reason", e.target.value)}
              className="min-h-[84px] bg-white border-black/5 focus:ring-red-600/20 focus:border-red-600 text-xs font-medium rounded-xl shadow-dash-sm resize-none"
              placeholder="Ví dụ: nhập hàng mới, kiểm kê, hàng lỗi..."
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => handleSubmit(stockType)}
            disabled={isPending}
            className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-100"
          >
            <Send className="w-4 h-4 mr-2" />
            {isActive ? "Đang cập nhật..." : `Cập nhật ${stockType === "RENTAL" ? "kho thuê" : "kho bán"}`}
          </Button>
        </div>
      </section>
    );
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Package}
      iconClassName="bg-zinc-50 text-red-600"
      title="Điều chỉnh kho"
      description={`Cập nhật riêng kho bán và kho thuê cho: ${product.name}`}
      maxWidth="max-w-2xl"
      hideFooter
    >
      <div className="space-y-5">
        {renderStockForm({
          stockType: "SALE",
          title: "kho bán",
          description: "Dùng cho đơn mua bán thiết bị.",
          currentStock: product.quantity,
          enabled: product.isForSale,
          icon: ShoppingBag,
          accentClass: "text-blue-600",
        })}

        {renderStockForm({
          stockType: "RENTAL",
          title: "kho cho thuê",
          description: "Dùng cho đơn thuê và hợp đồng thuê thiết bị.",
          currentStock: product.rentalQuantity ?? 0,
          enabled: product.isForRent,
          icon: Camera,
          accentClass: "text-amber-600",
        })}

        <div className="flex gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100/50 shadow-dash-sm">
          <Info className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-[11px] font-medium text-red-900 leading-relaxed">
            Mỗi form sẽ gửi đúng loại kho tương ứng lên backend bằng <span className="font-bold">type SALE</span> hoặc <span className="font-bold">type RENTAL</span>. Hành động được ghi vào lịch sử kho của hệ thống.
          </p>
        </div>
      </div>
    </AdminFormDialog>
  );
}
