"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Tag } from "lucide-react";
import { CategoryResponse, CategoryCreateRequest } from "@/types/category";
import { cn } from "@/lib/utils";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center shadow-sm">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {category ? "Cập nhật danh mục" : "Tạo danh mục mới"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                "h-11 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all uppercase",
                errors.code && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.code && <p className="text-[10px] font-bold text-red-500">{errors.code}</p>}
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
                "h-11 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all",
                errors.name && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.name && <p className="text-[10px] font-bold text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Mô tả
            </Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Thông tin thêm về danh mục này..."
              className="flex min-h-[100px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none focus:bg-white"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-bold text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-zinc-950 hover:bg-red-600 text-white rounded-xl font-bold px-6 h-11 transition-all gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {category ? "Cập nhật" : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
