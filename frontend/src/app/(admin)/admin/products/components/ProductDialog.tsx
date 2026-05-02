"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Package, Upload, X, Plus, Trash2 } from "lucide-react";
import { ProductResponse, ProductRequest, ProductInfoUpdateRequest, ProductSpecificationDto } from "@/types/product";
import { CategoryResponse } from "@/types/category";
import { cn, getImageUrl } from "@/lib/utils";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import Image from "next/image";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductResponse | null;
  categories: CategoryResponse[];
  onSubmit: (data: { request: ProductRequest | ProductInfoUpdateRequest; image: File | null }) => Promise<void>;
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

  const [formData, setFormData] = useState<ProductRequest>({
    name: "",
    description: "",
    brand: "",
    categoryId: undefined,
    rentPricePerDay: 0,
    salePrice: 0,
    isForRent: true,
    isForSale: false,
    specifications: [],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductRequest | "image", string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [prevProduct, setPrevProduct] = useState<ProductResponse | null | undefined>(undefined);
  const [prevOpen, setPrevOpen] = useState<boolean>(false);

  if (product !== prevProduct || (open && !prevOpen)) {
    setPrevProduct(product);
    setPrevOpen(open);
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        brand: product.brand || "",
        categoryId: product.categoryId,
        rentPricePerDay: product.rentPricePerDay,
        salePrice: product.salePrice,
        isForRent: product.isForRent,
        isForSale: product.isForSale,
        specifications: product.specifications?.map(s => ({ specKey: s.specKey, specValue: s.specValue })) || [],
      });
      setImagePreview(getImageUrl(product.mainImageUrl));
    } else {
      setFormData({
        name: "",
        description: "",
        brand: "",
        categoryId: undefined,
        rentPricePerDay: 0,
        salePrice: 0,
        isForRent: true,
        isForSale: false,
        specifications: [],
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Kích thước ảnh không được vượt quá 5MB" }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...(prev.specifications || []), { specKey: "", specValue: "" }]
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index)
    }));
  };

  const updateSpecification = (index: number, field: "specKey" | "specValue", value: string) => {
    setFormData(prev => {
      const newSpecs = [...(prev.specifications || [])];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return { ...prev, specifications: newSpecs };
    });
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ProductRequest | "image", string>> = {};
    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm không được để trống";
    if (!formData.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";
    
    if (!isUpdate) {
      if (!formData.isForRent && !formData.isForSale) {
        newErrors.isForRent = "Phải chọn ít nhất 1 hình thức kinh doanh";
      }
      if (formData.isForRent && (!formData.rentPricePerDay || formData.rentPricePerDay <= 0)) {
        newErrors.rentPricePerDay = "Giá thuê phải lớn hơn 0";
      }
      if (formData.isForSale && (!formData.salePrice || formData.salePrice <= 0)) {
        newErrors.salePrice = "Giá bán phải lớn hơn 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (isUpdate) {
        // Prepare info update request
        const req: ProductInfoUpdateRequest = {
          name: formData.name,
          description: formData.description,
          brand: formData.brand,
          categoryId: formData.categoryId,
          specifications: formData.specifications,
        };
        onSubmit({ request: req, image: imageFile });
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
      iconClassName="bg-zinc-950 text-white"
      title={isUpdate ? "Cập nhật thông tin" : "Thêm sản phẩm mới"}
      description={isUpdate ? "Chỉnh sửa thông tin cơ bản của thiết bị" : "Khai báo thiết bị nhiếp ảnh mới vào kho"}
      onSubmit={handleSubmit}
      isPending={isPending}
      submitText={isUpdate ? "Lưu thông tin" : "Tạo sản phẩm"}
      submitIcon={Save}
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Image */}
        <div className="md:col-span-1 space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Ảnh đại diện
          </Label>
          <div 
            className={cn(
              "relative aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
              imagePreview ? "border-zinc-200 bg-white" : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100",
              errors.image && "border-red-400 bg-red-50"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <span className="text-white text-xs font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Đổi ảnh
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-2 text-zinc-400 group-hover:text-zinc-950 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-zinc-500 block">Tải ảnh lên</span>
                <span className="text-[9px] font-medium text-zinc-400 block mt-1">JPEG/PNG, tối đa 5MB</span>
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
          {errors.image && <p className="text-[10px] font-bold text-red-500 text-center">{errors.image}</p>}
        </div>

        {/* Right Column - Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Tên sản phẩm *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Sony Alpha A7IV Body..."
              className={cn(
                "h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900",
                errors.name ? "border-red-400 focus:ring-red-400/20" : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
              )}
            />
            {errors.name && <p className="text-[11px] font-medium text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Danh mục *
              </Label>
              <select
                value={formData.categoryId || ""}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className={cn(
                  "flex h-10 w-full rounded-xl border bg-zinc-50 px-3 py-2 text-sm font-medium focus-visible:outline-none transition-colors",
                  errors.categoryId ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
                )}
              >
                <option value="" disabled>Chọn danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-[11px] font-medium text-red-500">{errors.categoryId}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Thương hiệu
              </Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Sony, Canon, Nikon..."
                className="h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
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
                    onChange={(e) => setFormData({ ...formData, isForRent: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-600/20 cursor-pointer"
                  />
                  <span className="text-xs font-black uppercase text-zinc-700 tracking-wider group-hover:text-zinc-950">Cho thuê</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    disabled={!formData.isForRent}
                    value={formData.rentPricePerDay || ""}
                    onChange={(e) => setFormData({ ...formData, rentPricePerDay: Number(e.target.value) })}
                    placeholder="Giá/Ngày"
                    className={cn(
                      "h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 pr-8 disabled:opacity-50",
                      errors.rentPricePerDay ? "border-red-400" : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">₫</span>
                </div>
                {errors.rentPricePerDay && <p className="text-[11px] font-medium text-red-500">{errors.rentPricePerDay}</p>}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.isForSale}
                    onChange={(e) => setFormData({ ...formData, isForSale: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-600/20 cursor-pointer"
                  />
                  <span className="text-xs font-black uppercase text-zinc-700 tracking-wider group-hover:text-zinc-950">Bán</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    disabled={!formData.isForSale}
                    value={formData.salePrice || ""}
                    onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    placeholder="Giá Bán"
                    className={cn(
                      "h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 pr-8 disabled:opacity-50",
                      errors.salePrice ? "border-red-400" : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">₫</span>
                </div>
                {errors.salePrice && <p className="text-[11px] font-medium text-red-500">{errors.salePrice}</p>}
              </div>
              {errors.isForRent && <p className="text-[11px] font-medium text-red-500 col-span-2 -mt-2">{errors.isForRent}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t border-zinc-100">
        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">
          Thông số kỹ thuật
        </Label>
        
        {formData.specifications?.map((spec, index) => (
          <div key={index} className="flex gap-2 items-start mb-2">
            <Input
              placeholder="VD: Cảm biến"
              value={spec.specKey}
              onChange={(e) => updateSpecification(index, "specKey", e.target.value)}
              className="h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 border-zinc-200 focus:border-red-500/40"
            />
            <Input
              placeholder="VD: Full-frame CMOS 33MP"
              value={spec.specValue}
              onChange={(e) => updateSpecification(index, "specValue", e.target.value)}
              className="h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 border-zinc-200 focus:border-red-500/40"
            />
            <button
              type="button"
              onClick={() => removeSpecification(index)}
              className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border border-zinc-200 bg-white text-zinc-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSpecification}
          className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 border border-dashed border-zinc-300 text-xs font-bold text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 transition-all w-full mt-2"
        >
          <Plus className="w-4 h-4" /> Thêm thông số
        </button>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t border-zinc-100">
        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Mô tả chi tiết
        </Label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả về tình trạng, tính năng nổi bật..."
          className="flex min-h-[100px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 focus-visible:outline-none transition-all resize-none"
        />
      </div>

    </AdminFormDialog>
  );
}
