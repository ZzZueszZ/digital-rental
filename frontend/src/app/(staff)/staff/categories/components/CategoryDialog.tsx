"use client";

import { useState } from "react";
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
  // Track previous props to detect changes during render
  const [prevCategory, setPrevCategory] = useState(category);
  const [prevOpen, setPrevOpen] = useState(open);

  const [formData, setFormData] = useState<CategoryCreateRequest>(() => ({
    code: category?.code || "",
    name: category?.name || "",
    description: category?.description || "",
  }));
  const [errors, setErrors] = useState<
    Partial<Record<keyof CategoryCreateRequest, string>>
  >({});

  // If category or open state changes, adjust the form data during render
  if (category !== prevCategory || (open !== prevOpen && open)) {
    setPrevCategory(category);
    setPrevOpen(open);
    setFormData({
      code: category?.code || "",
      name: category?.name || "",
      description: category?.description || "",
    });
    setErrors({});
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof CategoryCreateRequest, string>> = {};
    if (!formData.code.trim())
      newErrors.code = "Mã danh mục không được để trống";
    if (!formData.name.trim())
      newErrors.name = "Tên danh mục không được để trống";

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
      iconClassName="bg-zinc-950 text-white shadow-lg shadow-zinc-200"
      title={category ? "Cập nhật danh mục" : "Tạo danh mục mới"}
      description={
        category
          ? "Chỉnh sửa thông tin danh mục sản phẩm"
          : "Thêm một danh mục sản phẩm mới vào hệ thống"
      }
      onSubmit={handleSubmit}
      isPending={isPending}
      submitText={category ? "Cập nhật" : "Tạo danh mục"}
      submitIcon={Save}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-500 ml-1">
          Mã danh mục
        </label>
        <Input
          value={formData.code}
          onChange={(e) =>
            setFormData({ ...formData, code: e.target.value.toUpperCase() })
          }
          disabled={!!category}
          placeholder="LAPTOP, CAMERA..."
          className={cn(
            "h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-[15px] uppercase shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5",
            errors.code && "border-red-400 focus:ring-red-400/20",
          )}
        />
        {errors.code && (
          <p className="text-[11px] font-medium text-red-600 mt-1.5 ml-1">
            {errors.code}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-500 ml-1">
          Tên danh mục
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Máy tính xách tay, Máy ảnh..."
          className={cn(
            "h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-[15px] shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5",
            errors.name && "border-red-400 focus:ring-red-400/20",
          )}
        />
        {errors.name && (
          <p className="text-[11px] font-medium text-red-600 mt-1.5 ml-1">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-500 ml-1">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Thông tin thêm về danh mục này..."
          className="flex min-h-[120px] w-full rounded-xl border border-zinc-950/5 bg-zinc-50/50 px-4 py-3 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-red-600/30 focus:ring-4 focus:ring-red-600/5 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none shadow-dash-card leading-relaxed"
        />
      </div>
    </AdminFormDialog>
  );
}
