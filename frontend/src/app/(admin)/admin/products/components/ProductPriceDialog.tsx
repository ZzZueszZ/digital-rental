"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Save } from "lucide-react";
import { ProductResponse, ProductPriceUpdateRequest } from "@/types/product";
import { cn } from "@/lib/utils";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";

interface ProductPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResponse | null;
  onSubmit: (data: ProductPriceUpdateRequest) => Promise<void>;
  isPending: boolean;
}

export function ProductPriceDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isPending,
}: ProductPriceDialogProps) {
  const [formData, setFormData] = useState<ProductPriceUpdateRequest>({
    rentPricePerDay: 0,
    salePrice: 0,
    isForRent: true,
    isForSale: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductPriceUpdateRequest | "general", string>>>({});

  const [prevProduct, setPrevProduct] = useState<ProductResponse | null | undefined>(undefined);
  const [prevOpen, setPrevOpen] = useState<boolean>(false);

  if (product !== prevProduct || (open && !prevOpen)) {
    setPrevProduct(product);
    setPrevOpen(open);
    if (product) {
      setFormData({
        rentPricePerDay: product.rentPricePerDay,
        salePrice: product.salePrice,
        isForRent: product.isForRent,
        isForSale: product.isForSale,
      });
    }
    setErrors({});
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof ProductPriceUpdateRequest | "general", string>> = {};
    
    if (!formData.isForRent && !formData.isForSale) {
      newErrors.general = "Phải chọn ít nhất 1 hình thức kinh doanh";
    }
    if (formData.isForRent && (!formData.rentPricePerDay || formData.rentPricePerDay <= 0)) {
      newErrors.rentPricePerDay = "Giá thuê phải lớn hơn 0";
    }
    if (formData.isForSale && (!formData.salePrice || formData.salePrice <= 0)) {
      newErrors.salePrice = "Giá bán phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!product) return null;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={DollarSign}
      iconClassName="bg-emerald-500 text-white"
      title="Cập nhật giá"
      description={`Thiết lập giá thuê và bán cho: ${product.name}`}
      onSubmit={handleSubmit}
      isPending={isPending}
      submitText="Lưu bảng giá"
      submitIcon={Save}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {errors.general && (
          <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100">
            {errors.general}
          </div>
        )}

        <div className="p-4 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={formData.isForRent}
              onChange={(e) => setFormData({ ...formData, isForRent: e.target.checked })}
              className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500/20 cursor-pointer border-zinc-300"
            />
            <span className="text-sm font-black uppercase text-zinc-700 tracking-wider group-hover:text-amber-600 transition-colors">Cho thuê thiết bị</span>
          </label>
          <div className="relative pl-8">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 block">
              Giá thuê theo ngày
            </Label>
            <div className="relative">
              <Input
                type="number"
                disabled={!formData.isForRent}
                value={formData.rentPricePerDay || ""}
                onChange={(e) => setFormData({ ...formData, rentPricePerDay: Number(e.target.value) })}
                placeholder="Ví dụ: 150000"
                className={cn(
                  "h-11 rounded-xl bg-white text-sm font-bold text-zinc-900 pr-10 disabled:opacity-50 disabled:bg-zinc-100",
                  errors.rentPricePerDay ? "border-red-400" : "border-zinc-200 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">₫</span>
            </div>
            {errors.rentPricePerDay && <p className="text-[11px] font-medium text-red-500 mt-1">{errors.rentPricePerDay}</p>}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={formData.isForSale}
              onChange={(e) => setFormData({ ...formData, isForSale: e.target.checked })}
              className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500/20 cursor-pointer border-zinc-300"
            />
            <span className="text-sm font-black uppercase text-zinc-700 tracking-wider group-hover:text-blue-600 transition-colors">Bán thiết bị</span>
          </label>
          <div className="relative pl-8">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 block">
              Giá bán đứt
            </Label>
            <div className="relative">
              <Input
                type="number"
                disabled={!formData.isForSale}
                value={formData.salePrice || ""}
                onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                placeholder="Ví dụ: 25000000"
                className={cn(
                  "h-11 rounded-xl bg-white text-sm font-bold text-zinc-900 pr-10 disabled:opacity-50 disabled:bg-zinc-100",
                  errors.salePrice ? "border-red-400" : "border-zinc-200 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">₫</span>
            </div>
            {errors.salePrice && <p className="text-[11px] font-medium text-red-500 mt-1">{errors.salePrice}</p>}
          </div>
        </div>
      </div>
    </AdminFormDialog>
  );
}
