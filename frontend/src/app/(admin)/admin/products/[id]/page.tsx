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
  Info,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getImageUrl, cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useMemo } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProductDialog } from "../components/ProductDialog";
import {
  useUpdateProductInfo,
  useProduct,
  useDeleteProduct,
  useRestoreProduct,
  PRODUCT_KEYS,
  usePriceHistory,
  useUpdateProductPrice,
} from "@/services/product";
import { useInventoryLogs } from "@/services/inventory";
import { useCategories } from "@/services/category";
import {
  ProductInfoUpdateRequest,
  PriceHistoryResponse,
} from "@/types/product";
import { InventoryAuditResponse } from "@/types/inventory";
import { useQueryClient } from "@tanstack/react-query";
import { StockAdjustmentDialog } from "../components/StockAdjustmentDialog";
import { ProductPriceDialog } from "../components/ProductPriceDialog";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const productId = parseInt(id);

  const { data: response, isLoading, error } = useProduct(productId);
  const product = response?.data;

  const [priceHistoryPage, setPriceHistoryPage] = useState(0);
  const [inventoryPage, setInventoryPage] = useState(0);
  const PAGE_SIZE = 5;

  const { data: historyRes } = usePriceHistory(
    productId,
    priceHistoryPage,
    PAGE_SIZE,
  );
  const priceHistory = historyRes?.data || [];
  const pricePagination = historyRes?.pagination;

  const { data: inventoryRes } = useInventoryLogs(
    productId,
    inventoryPage,
    PAGE_SIZE,
  );
  const inventoryLogs = inventoryRes?.data || [];
  const inventoryPagination = inventoryRes?.pagination;

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
  const updateInfoMutation = useUpdateProductInfo(productId);
  const updatePriceMutation = useUpdateProductPrice(productId);
  const { data: catRes } = useCategories({ activeOnly: true }, 0, 100);
  const categories = useMemo(() => catRes?.data || [], [catRes]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);

  const handleBack = () => router.push("/admin/products");

  const handleDelete = () => {
    setConfirmConfig({
      open: true,
      title: "Vô hiệu hóa sản phẩm?",
      description:
        "Sản phẩm này sẽ bị ẩn khỏi cửa hàng nhưng không bị xóa vĩnh viễn.",
      variant: "warning",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(productId);
          await queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
          toast.success("Vô hiệu hóa thành công");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (err) {
          toast.error("Không thể vô hiệu hóa sản phẩm");
        }
      },
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
          await queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
          toast.success("Khôi phục thành công");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (err) {
          toast.error("Không thể khôi phục sản phẩm");
        }
      },
    });
  };

  const handleUpdateInfo = async ({
    request,
    image,
  }: {
    request: ProductInfoUpdateRequest;
    image: File | null;
  }) => {
    try {
      await updateInfoMutation.mutateAsync({ request, image });
      toast.success("Cập nhật thông tin thành công");
      setIsEditDialogOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-950 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Đang tải dữ liệu...
        </p>
      </div>
    );

  if (!product || error)
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 gap-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-sm font-medium text-zinc-500 mt-2">
            Sản phẩm này không tồn tại hoặc đã bị xóa vĩnh viễn.
          </p>
        </div>
        <Button
          onClick={handleBack}
          variant="outline"
          className="rounded-xl px-8 h-12 font-bold gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Button>
      </div>
    );

  const images = [
    product.mainImageUrl,
    ...(product.gallery?.map((g) => g.url) || []),
  ];
  const currentImage = activeImage || product.mainImageUrl;
  const isDeleted = !!product.deletedAt;

  return (
    <div className="flex-1 space-y-8 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                ID: #{product.id}
              </span>
              <Badge
                className={cn(
                  "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-0",
                  !isDeleted
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600",
                )}
              >
                {!isDeleted ? "Hoạt động" : "Đã xóa"}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tighter leading-none">
              {product.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isDeleted ? (
            <>
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="flex-1 sm:flex-none h-12 rounded-2xl bg-white border border-zinc-200 hover:border-red-600 hover:bg-red-50 text-zinc-950 hover:text-red-600 font-bold px-8 transition-all gap-2 shadow-sm"
              >
                <Edit2 className="w-4 h-4" /> Chỉnh sửa
              </Button>
              <Button
                onClick={handleDelete}
                variant="ghost"
                className="flex-1 sm:flex-none h-12 rounded-2xl bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white font-bold px-6 transition-all gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Vô hiệu hóa
              </Button>
            </>
          ) : (
            <Button
              onClick={handleRestore}
              variant="ghost"
              className="flex-1 sm:flex-none h-12 rounded-2xl bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold px-8 transition-all gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> Khôi phục
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Gallery & Visuals */}
        <div className="xl:col-span-7 space-y-6">
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
                <span className="text-[11px] font-black uppercase text-zinc-900 tracking-widest">
                  {product.brand}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto p-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={cn(
                  "relative w-24 h-24 rounded-2xl flex-shrink-0 transition-all duration-300 overflow-hidden",
                  currentImage === img
                    ? "ring-2 ring-red-600 ring-offset-2 scale-105 shadow-md z-10"
                    : "opacity-50 grayscale hover:opacity-100 hover:grayscale-0",
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
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                Mô tả sản phẩm
              </h3>
            </div>
            <p className="text-zinc-600 leading-relaxed font-medium">
              {product.description ||
                "Chưa có mô tả chi tiết cho sản phẩm này."}
            </p>
          </div>
        </div>

        {/* Right Column: Key Info & Actions */}
        <div className="xl:col-span-5 space-y-8">
          {/* Status & Inventory Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center relative group/stock">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3 group-hover/stock:scale-110 transition-transform">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">
                  Số lượng kho
                </span>
                <span className="text-xl font-black text-emerald-950">
                  {product.quantity}{" "}
                  <span className="text-xs font-bold text-emerald-600/50">
                    máy
                  </span>
                </span>

                <button
                  onClick={() => setIsStockDialogOpen(true)}
                  className="mt-3 px-3 py-1 bg-white border border-emerald-200 rounded-xl text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  Điều chỉnh
                </button>
              </div>
              <div className="p-4 rounded-3xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600/60 mb-1">
                  Trạng thái
                </span>
                <span className="text-sm font-black text-indigo-950 uppercase tracking-tighter">
                  Sẵn sàng thuê
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-50">
              <div className="flex items-center justify-between group/price">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center group-hover/price:scale-110 transition-transform">
                    <Truck className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">
                      Giá thuê mỗi ngày
                    </span>
                    <button
                      onClick={() => setIsPriceDialogOpen(true)}
                      className="text-[9px] font-black text-amber-600 uppercase tracking-widest hover:underline text-left"
                    >
                      Điều chỉnh
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-zinc-950 leading-none mb-1">
                    {product.rentPricePerDay?.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    VND / Ngày
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-50 group/price2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center group-hover/price2:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">
                      Giá bán thanh lý
                    </span>
                    <button
                      onClick={() => setIsPriceDialogOpen(true)}
                      className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline text-left"
                    >
                      Điều chỉnh
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-zinc-950 leading-none mb-1">
                    {product.salePrice?.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Thanh toán 1 lần
                  </p>
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
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-950">
                  Thông số kỹ thuật
                </h3>
              </div>
              <Badge
                variant="outline"
                className="bg-red-50 border-red-100 text-red-600 font-bold text-[9px] uppercase tracking-widest"
              >
                Pro Specs
              </Badge>
            </div>

            <div className="space-y-4">
              {product.specifications?.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between group"
                >
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-600 transition-colors">
                    {spec.specKey}
                  </span>
                  <div className="flex-1 mx-4 border-b border-zinc-100 border-dashed" />
                  <span className="text-xs font-black text-zinc-900">
                    {spec.specValue}
                  </span>
                </div>
              ))}
              {(!product.specifications ||
                product.specifications.length === 0) && (
                <p className="text-[11px] font-bold text-zinc-500 text-center py-4">
                  Chưa có thông số kỹ thuật.
                </p>
              )}
            </div>
          </div>

          {/* Timeline & Audit Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">
              Lịch sử hệ thống
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <div>
                  <p className="text-[11px] font-black text-zinc-950 uppercase tracking-tight">
                    Khởi tạo sản phẩm
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400">
                    {format(
                      new Date(product.createdAt),
                      "HH:mm, 'Ngày' dd 'tháng' MM, yyyy",
                      { locale: vi },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                <div>
                  <p className="text-[11px] font-black text-zinc-950 uppercase tracking-tight">
                    Cập nhật gần nhất
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400">
                    {format(
                      new Date(product.updatedAt),
                      "HH:mm, 'Ngày' dd 'tháng' MM, yyyy",
                      { locale: vi },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(o) => setConfirmConfig((prev) => ({ ...prev, open: o }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
        isLoading={deleteMutation.isPending || restoreMutation.isPending}
      />
      <ProductDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={product || null}
        categories={categories}
        onSubmit={handleUpdateInfo}
        isPending={updateInfoMutation.isPending}
      />
      <StockAdjustmentDialog
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
        product={product || null}
      />
      <ProductPriceDialog
        open={isPriceDialogOpen}
        onOpenChange={setIsPriceDialogOpen}
        product={product || null}
        onSubmit={async (data) => {
          try {
            await updatePriceMutation.mutateAsync(data);
            toast.success("Cập nhật giá thành công");
            setIsPriceDialogOpen(false);
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Lỗi khi cập nhật giá");
          }
        }}
        isPending={updatePriceMutation.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 mb-12">
        {/* Price History Section */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-zinc-200/50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-950">
                  Lịch sử thay đổi giá
                </h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5 tracking-tighter">
                  Biến động giá trị
                </p>
              </div>
            </div>
            <Badge className="bg-zinc-950 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
              {pricePagination?.totalElements || 0}
            </Badge>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-4 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
                    Giá mới
                  </th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
                    Biến động
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {priceHistory.map((history: PriceHistoryResponse) => (
                  <tr
                    key={history.id}
                    className="group hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-zinc-950">
                          {history.newPrice.toLocaleString()} đ
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                          {history.priceType === "RENT"
                            ? "Giá thuê"
                            : "Giá bán"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {history.changeType === "INCREASE" && (
                        <span className="text-[10px] font-black text-red-600">
                          +{history.percentChange.toFixed(1)}%
                        </span>
                      )}
                      {history.changeType === "DECREASE" && (
                        <span className="text-[10px] font-black text-emerald-600">
                          -{history.percentChange.toFixed(1)}%
                        </span>
                      )}
                      {history.changeType === "NONE" && (
                        <span className="text-[10px] font-bold text-zinc-300 uppercase">
                          Khởi tạo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-bold text-zinc-400">
                        {format(new Date(history.createdAt), "dd/MM/yy", {
                          locale: vi,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
                {priceHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                      Trống
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pricePagination && pricePagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-50 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                Trang {priceHistoryPage + 1} / {pricePagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-950 transition-all duration-200 disabled:opacity-20"
                  disabled={priceHistoryPage === 0}
                  onClick={() => setPriceHistoryPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-950 transition-all duration-200 disabled:opacity-20"
                  disabled={priceHistoryPage >= pricePagination.totalPages - 1}
                  onClick={() => setPriceHistoryPage((p) => p + 1)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Inventory History Section */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-zinc-200/50 flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-950">
                  Lịch sử kho
                </h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5 tracking-tighter">
                  Nhập xuất thiết bị
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
              {inventoryPagination?.totalElements || 0}
            </Badge>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-4 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
                    Thay đổi
                  </th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
                    Lý do
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {inventoryLogs.map((log: InventoryAuditResponse) => {
                  const diff = log.newStock - log.oldStock;
                  return (
                    <tr
                      key={log.id}
                      className="group hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-[11px] font-black",
                              diff > 0 ? "text-emerald-600" : "text-red-600",
                            )}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                            Tồn: {log.newStock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="text-[11px] font-medium text-zinc-600 truncate max-w-[120px]"
                          title={log.reason}
                        >
                          {log.reason || "Không có lý do"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-zinc-400">
                          {format(new Date(log.changedAt), "dd/MM/yy", {
                            locale: vi,
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {inventoryLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                      Trống
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {inventoryPagination && inventoryPagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-50 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                Trang {inventoryPage + 1} / {inventoryPagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-950 transition-all duration-200 disabled:opacity-20"
                  disabled={inventoryPage === 0}
                  onClick={() => setInventoryPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-950 transition-all duration-200 disabled:opacity-20"
                  disabled={inventoryPage >= inventoryPagination.totalPages - 1}
                  onClick={() => setInventoryPage((p) => p + 1)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
