"use client";

import { use } from "react";
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  Tag, 
  Edit2, 
  Trash2, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Truck,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useProduct, useDeleteProduct, useRestoreProduct } from "@/services/product";
import { getImageUrl, cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const productId = parseInt(id);

  const { data: response, isLoading, error } = useProduct(productId);
  const product = response?.data;

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();

  const handleBack = () => router.push("/admin/products");

  const handleDelete = () => {
    setConfirmConfig({
      open: true,
      title: "Vô hiệu hóa sản phẩm?",
      description: "Sản phẩm này sẽ bị ẩn khỏi cửa hàng nhưng không bị xóa vĩnh viễn.",
      variant: "warning",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(productId);
          toast.success("Vô hiệu hóa thành công");
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (err) {
          toast.error("Không thể vô hiệu hóa sản phẩm");
        }
      }
    });
  };

  const handleRestore = () => {
    setConfirmConfig({
      open: true,
      title: "Khôi phục sản phẩm?",
      description: "Sản phẩm sẽ hiển thị lại trên cửa hàng.",
      variant: "info",
      onConfirm: async () => {
        try {
          await restoreMutation.mutateAsync(productId);
          toast.success("Khôi phục thành công");
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (err) {
          toast.error("Không thể khôi phục sản phẩm");
        }
      }
    });
  };

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-950 rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Đang tải dữ liệu...</p>
    </div>
  );

  if (!product || error) return (
    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-6">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Không tìm thấy sản phẩm</h2>
        <p className="text-sm font-medium text-zinc-500 mt-2">Sản phẩm này không tồn tại hoặc đã bị xóa vĩnh viễn.</p>
      </div>
      <Button onClick={handleBack} variant="outline" className="rounded-xl px-8 h-12 font-bold gap-2">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Button>
    </div>
  );

  const images = [product.mainImageUrl, ...(product.gallery?.map(g => g.url) || [])];
  const currentImage = activeImage || product.mainImageUrl;
  const isDeleted = !!product.deletedAt;

  return (
    <div className="flex-1 space-y-8 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-6">
          <Button 
            onClick={handleBack} 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">ID: #{product.id}</span>
              <Badge className={cn(
                "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-0",
                !isDeleted ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {!isDeleted ? "Hoạt động" : "Đã xóa"}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tighter leading-none">{product.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isDeleted ? (
            <>
              <Button className="flex-1 sm:flex-none h-12 rounded-2xl bg-white border border-zinc-200 hover:border-red-600 hover:bg-red-50 text-zinc-950 hover:text-red-600 font-bold px-8 transition-all gap-2 shadow-sm">
                <Edit2 className="w-4 h-4" /> Chỉnh sửa
              </Button>
              <Button onClick={handleDelete} variant="ghost" className="flex-1 sm:flex-none h-12 rounded-2xl bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white font-bold px-6 transition-all gap-2 shadow-sm">
                <Trash2 className="w-4 h-4" /> Vô hiệu hóa
              </Button>
            </>
          ) : (
            <Button onClick={handleRestore} variant="ghost" className="flex-1 sm:flex-none h-12 rounded-2xl bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold px-8 transition-all gap-2 shadow-sm">
              <RotateCcw className="w-4 h-4" /> Khôi phục
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery & Visuals */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-zinc-50 border border-zinc-100 shadow-2xl group">
            <Image
              src={getImageUrl(currentImage)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />
            {/* Overlay Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-black uppercase text-zinc-900 tracking-widest">{product.brand}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={cn(
                  "relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all border-2",
                  currentImage === img ? "border-zinc-950 scale-105 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={getImageUrl(img)}
                  alt={`Gallery ${idx}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>

          {/* Description Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Info className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Mô tả sản phẩm</h3>
            </div>
            <p className="text-zinc-600 leading-relaxed font-medium">
              {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
            </p>
          </div>
        </div>

        {/* Right Column: Key Info & Actions */}
        <div className="lg:col-span-5 space-y-8">
          {/* Status & Inventory Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">Số lượng kho</span>
                <span className="text-xl font-black text-emerald-950">{product.quantity} <span className="text-xs font-bold text-emerald-600/50">máy</span></span>
              </div>
              <div className="p-4 rounded-3xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600/60 mb-1">Trạng thái</span>
                <span className="text-sm font-black text-indigo-950 uppercase tracking-tighter">Sẵn sàng thuê</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">Giá thuê mỗi ngày</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-zinc-950 leading-none mb-1">{product.rentPricePerDay?.toLocaleString('vi-VN')} ₫</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">VND / Ngày</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">Giá bán thanh lý</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-zinc-950 leading-none mb-1">{product.salePrice?.toLocaleString('vi-VN')} ₫</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Thanh toán 1 lần</p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-950">Thông số kỹ thuật</h3>
              </div>
              <Badge variant="outline" className="bg-red-50 border-red-100 text-red-600 font-bold text-[9px] uppercase tracking-widest">Pro Specs</Badge>
            </div>

            <div className="space-y-4">
              {product.specifications?.map((spec, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-600 transition-colors">{spec.specKey}</span>
                  <div className="flex-1 mx-4 border-b border-zinc-100 border-dashed" />
                  <span className="text-xs font-black text-zinc-900">{spec.specValue}</span>
                </div>
              ))}
              {(!product.specifications || product.specifications.length === 0) && (
                <p className="text-[11px] font-bold text-zinc-500 text-center py-4">Chưa có thông số kỹ thuật.</p>
              )}
            </div>
          </div>

          {/* Timeline & Audit Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Lịch sử hệ thống</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <div>
                  <p className="text-[11px] font-black text-zinc-950 uppercase tracking-tight">Khởi tạo sản phẩm</p>
                  <p className="text-[11px] font-medium text-zinc-400">
                    {format(new Date(product.createdAt), "HH:mm, 'Ngày' dd 'tháng' MM, yyyy", { locale: vi })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                <div>
                  <p className="text-[11px] font-black text-zinc-950 uppercase tracking-tight">Cập nhật gần nhất</p>
                  <p className="text-[11px] font-medium text-zinc-400">
                    {format(new Date(product.updatedAt), "HH:mm, 'Ngày' dd 'tháng' MM, yyyy", { locale: vi })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(o) => setConfirmConfig(prev => ({ ...prev, open: o }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
        isLoading={deleteMutation.isPending || restoreMutation.isPending}
      />
    </div>
  );
}
