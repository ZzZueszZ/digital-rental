"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Package, Upload, X, Plus, Trash2 } from "lucide-react";
import {
  ProductResponse,
  ProductRequest,
  ProductInfoUpdateRequest,
  ProductSpecificationDto,
} from "@/types/product";
import { CategoryResponse } from "@/types/category";
import { cn, getImageUrl } from "@/lib/utils";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductResponse | null;
  categories: CategoryResponse[];
  onSubmit: (data: {
    request: ProductRequest | ProductInfoUpdateRequest;
    image: File | null;
  }) => Promise<void>;
  isPending: boolean;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
  isPending,
}: ProductDialogProps) {
  const isUpdate = !!product;

  const [formData, setFormData] = useState<ProductRequest>(() => {
    if (product) {
      return {
        name: product.name,
        description: product.description || "",
        brand: product.brand || "",
        categoryId: product.categoryId,
        rentPricePerDay: product.rentPricePerDay,
        salePrice: product.salePrice,
        isForRent: product.isForRent,
        isForSale: product.isForSale,
        specifications:
          product.specifications?.map((s) => ({
            specKey: s.specKey,
            specValue: s.specValue,
          })) || [],
      };
    }
    return {
      name: "",
      description: "",
      brand: "",
      categoryId: undefined,
      rentPricePerDay: 0,
      salePrice: 0,
      isForRent: true,
      isForSale: false,
      specifications: [],
    };
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    product ? getImageUrl(product.mainImageUrl) : null,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductRequest | "image", string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Kích thước ảnh không được vượt quá 10MB",
        }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [
        ...(prev.specifications || []),
        { specKey: "", specValue: "" },
      ],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index),
    }));
  };

  const updateSpecification = (
    index: number,
    field: "specKey" | "specValue",
    value: string,
  ) => {
    setFormData((prev) => {
      const newSpecs = [...(prev.specifications || [])];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return { ...prev, specifications: newSpecs };
    });
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ProductRequest | "image", string>> =
      {};
    if (!formData.name.trim())
      newErrors.name = "Tên sản phẩm không được để trống";
    if (!formData.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";

    if (!isUpdate) {
      if (!formData.isForRent && !formData.isForSale) {
        newErrors.isForRent = "Phải chọn ít nhất 1 hình thức kinh doanh";
      }
      if (
        formData.isForRent &&
        (!formData.rentPricePerDay || formData.rentPricePerDay <= 0)
      ) {
        newErrors.rentPricePerDay = "Giá thuê phải lớn hơn 0";
      }
      if (
        formData.isForSale &&
        (!formData.salePrice || formData.salePrice <= 0)
      ) {
        newErrors.salePrice = "Giá bán phải lớn hơn 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (isUpdate && product) {
        // Only send changed fields
        const req: Partial<ProductInfoUpdateRequest> = {};

        if (formData.name !== product.name) req.name = formData.name;
        if (formData.description !== (product.description || ""))
          req.description = formData.description;
        if (formData.brand !== (product.brand || ""))
          req.brand = formData.brand;
        if (formData.categoryId !== product.categoryId)
          req.categoryId = formData.categoryId;

        // Deep compare specifications
        const originalSpecs =
          product.specifications?.map((s) => ({
            specKey: s.specKey,
            specValue: s.specValue,
          })) || [];
        const currentSpecs = formData.specifications || [];
        const specsChanged =
          JSON.stringify(originalSpecs) !== JSON.stringify(currentSpecs);
        if (specsChanged) req.specifications = currentSpecs;

        // Only submit if something changed or a new image is selected
        if (Object.keys(req).length > 0 || imageFile) {
          onSubmit({
            request: req as ProductInfoUpdateRequest,
            image: imageFile,
          });
        } else {
          onOpenChange(false);
        }
      } else {
        onSubmit({ request: formData, image: imageFile });
      }
    }
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Package}
      iconClassName="bg-red-600 text-white shadow-lg shadow-red-100"
      title={isUpdate ? "Cập nhật thông tin" : "Thêm sản phẩm mới"}
      description={
        isUpdate
          ? "Chỉnh sửa thông tin cơ bản của thiết bị"
          : "Thiết lập thông tin sản phẩm chuyên nghiệp cho cửa hàng"
      }
      onSubmit={handleSubmit}
      isPending={isPending}
      submitText={isUpdate ? "Lưu thông tin" : "Tạo sản phẩm"}
      submitIcon={Save}
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Image */}
        <div className="md:col-span-1 space-y-3">
          <label className="text-sm font-medium text-zinc-500 ml-1">
            Ảnh đại diện
          </label>
          <div
            className={cn(
              "relative aspect-square w-full rounded-2xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
              imagePreview
                ? "border-zinc-200 bg-white shadow-dash-card"
                : "border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100",
              errors.image && "border-red-400 bg-red-50",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <span className="text-white text-xs font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Đổi ảnh
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-dash-card flex items-center justify-center mx-auto mb-3 text-zinc-400 group-hover:text-red-600 transition-all duration-200 border border-zinc-950/5">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[13px] font-semibold text-zinc-600 block">
                  Tải ảnh lên
                </span>
                <span className="text-[11px] font-medium text-zinc-400 block mt-1.5">
                  JPEG, PNG hoặc WebP (Tối đa 5MB)
                </span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
          />
          {errors.image && (
            <p className="text-[11px] font-medium text-red-600 text-center mt-2">
              {errors.image}
            </p>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Tên sản phẩm *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Sony Alpha A7IV Body..."
              className={cn(
                "h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-[15px] shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5",
                errors.name && "border-red-400 focus:ring-red-400/20",
              )}
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-red-600 ml-1">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">
                Danh mục *
              </label>
              <Select
                value={formData.categoryId?.toString() || ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, categoryId: Number(v) })
                }
              >
                <SelectTrigger
                  className={cn(
                    "!w-full !h-12 px-4 rounded-xl !bg-zinc-50/50 !border-zinc-950/5 focus:!bg-white focus:!border-red-600/30 focus:!ring-4 focus:!ring-red-600/5 transition-all duration-200 shadow-dash-card text-[15px] font-semibold text-zinc-900",
                    errors.categoryId && "!border-red-400",
                  )}
                >
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-zinc-100 shadow-dash-overlay bg-white overflow-hidden">
                  {categories.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id.toString()}
                      className="font-medium py-2.5 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white transition-colors"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-[11px] font-medium text-red-600 ml-1">
                  {errors.categoryId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">
                Thương hiệu
              </label>
              <Input
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                placeholder="VD: Sony, Canon, Nikon..."
                className="h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-[15px] shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5"
              />
            </div>
          </div>

          {!isUpdate && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isForRent}
                    onChange={(e) =>
                      setFormData({ ...formData, isForRent: e.target.checked })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950 transition-colors">
                    Cho thuê
                  </span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    disabled={!formData.isForRent}
                    value={formData.rentPricePerDay || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rentPricePerDay: Number(e.target.value),
                      })
                    }
                    placeholder="Giá / Ngày"
                    className={cn(
                      "h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-bold text-[15px] pr-8 disabled:bg-zinc-50/30 disabled:text-zinc-300 disabled:cursor-not-allowed transition-all duration-200 shadow-dash-card focus:ring-4 focus:ring-red-600/5",
                      errors.rentPricePerDay && "border-red-400",
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    ₫
                  </span>
                </div>
                {errors.rentPricePerDay && (
                  <p className="text-[11px] font-medium text-red-600 ml-1">
                    {errors.rentPricePerDay}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isForSale}
                    onChange={(e) =>
                      setFormData({ ...formData, isForSale: e.target.checked })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950 transition-colors">
                    Bán
                  </span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    disabled={!formData.isForSale}
                    value={formData.salePrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salePrice: Number(e.target.value),
                      })
                    }
                    placeholder="Giá bán đứt"
                    className={cn(
                      "h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-bold text-[15px] pr-8 disabled:bg-zinc-50/30 disabled:text-zinc-300 disabled:cursor-not-allowed transition-all duration-200 shadow-dash-card focus:ring-4 focus:ring-red-600/5",
                      errors.salePrice && "border-red-400",
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    ₫
                  </span>
                </div>
                {errors.salePrice && (
                  <p className="text-[11px] font-medium text-red-600 ml-1">
                    {errors.salePrice}
                  </p>
                )}
              </div>
              {errors.isForRent && (
                <p className="text-[11px] font-medium text-red-600 col-span-2 -mt-2 ml-1">
                  {errors.isForRent}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t border-zinc-100">
        <label className="text-sm font-medium text-zinc-500 ml-1 block mb-3">
          Thông số kỹ thuật
        </label>

        {formData.specifications?.map((spec, index) => (
          <div key={index} className="flex gap-2 items-start mb-2">
            <Input
              placeholder="VD: Cảm biến"
              value={spec.specKey}
              onChange={(e) =>
                updateSpecification(index, "specKey", e.target.value)
              }
              className="h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 text-sm font-semibold text-zinc-900 transition-all duration-200 shadow-dash-card"
            />
            <Input
              placeholder="VD: Full-frame CMOS 33MP"
              value={spec.specValue}
              onChange={(e) =>
                updateSpecification(index, "specValue", e.target.value)
              }
              className="h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 text-sm font-semibold text-zinc-900 transition-all duration-200 shadow-dash-card"
            />
            <button
              type="button"
              onClick={() => removeSpecification(index)}
              className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center border border-zinc-950/5 bg-zinc-50/50 text-zinc-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-200 shadow-dash-card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSpecification}
          className="h-11 px-4 rounded-xl flex items-center justify-center gap-2 border border-dashed border-zinc-200 text-[13px] font-semibold text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-200 w-full mt-3"
        >
          <Plus className="w-4 h-4" /> Thêm thông số
        </button>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t border-zinc-100">
        <label className="text-sm font-medium text-zinc-500 ml-1">
          Mô tả chi tiết
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Mô tả về tình trạng, tính năng nổi bật..."
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border border-zinc-950/5 bg-zinc-50/50 px-4 py-3 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-red-600/30 focus:ring-4 focus:ring-red-600/5 focus-visible:outline-none transition-all duration-200 resize-none shadow-dash-card leading-relaxed",
          )}
        />
      </div>
    </AdminFormDialog>
  );
}
