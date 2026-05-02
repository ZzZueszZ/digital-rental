"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Tag } from "lucide-react";
import { CategoryResponse, CategoryCreateRequest } from "@/types/category";
import { cn } from "@/lib/utils";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryResponse | null;
  onSubmit: (values: CategoryCreateRequest) => Promise<void>;
  isPending: boolean;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isPending,
}: CategoryDialogProps) {
  const [formData, setFormData] = useState<CategoryCreateRequest>({
    code: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryCreateRequest, string>>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        code: category.code,
        name: category.name,
        description: category.description || "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
      });
    }
    setErrors({});
  }, [category, open]);

  const validate = () => {
    const newErrors: Partial<Record<keyof CategoryCreateRequest, string>> = {};
    if (!formData.code.trim()) newErrors.code = "Mã danh mục không được để trống";
    if (!formData.name.trim()) newErrors.name = "Tên danh mục không được để trống";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Tag}
      iconClassName="bg-zinc-950 text-white"
      title={category ? "Cập nhật danh mục" : "Tạo danh mục mới"}
      description={category ? "Chỉnh sửa thông tin danh mục sản phẩm" : "Thêm một danh mục sản phẩm mới vào hệ thống"}
      onSubmit={handleSubmit}
      isPending={isPending}
      submitText={category ? "Cập nhật" : "Tạo danh mục"}
      submitIcon={Save}
    >
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Mã danh mục
        </Label>
        <Input
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          disabled={!!category}
          placeholder="LAPTOP, CAMERA..."
          className={cn(
            "h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 uppercase transition-all",
            errors.code
              ? "border-red-400 focus:ring-red-400/20"
              : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
          )}
        />
        {errors.code && <p className="text-[11px] font-medium text-red-500 mt-1">{errors.code}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Tên danh mục
        </Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Máy tính xách tay, Máy ảnh..."
          className={cn(
            "h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 transition-all",
            errors.name
              ? "border-red-400 focus:ring-red-400/20"
              : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
          )}
        />
        {errors.name && <p className="text-[11px] font-medium text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Mô tả
        </Label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Thông tin thêm về danh mục này..."
          className="flex min-h-[100px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
        />
      </div>
    </AdminFormDialog>
  );
}
