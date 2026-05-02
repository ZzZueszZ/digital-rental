"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Package, 
  ChevronLeft, 
  ChevronRight, 
  EyeOff, 
  TrendingUp,
  Tag
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  useProducts, 
  useTrashedProducts, 
  useCreateProduct, 
  useUpdateProductInfo, 
  useUpdateProductPrice,
  useDeleteProduct, 
  useRestoreProduct,
  useHardDeleteProduct
} from "@/services/product";
import { useCategories } from "@/services/category";
import { ProductResponse, ProductRequest, ProductInfoUpdateRequest, ProductPriceUpdateRequest } from "@/types/product";
import { ProductDialog } from "./components/ProductDialog";
import { ProductPriceDialog } from "./components/ProductPriceDialog";
import { ProductTableRow, ProductMobileCard } from "./components/ProductListItems";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "../users/components/EmptyState";
import { StatCard } from "../components/StatCard";
import { cn } from "@/lib/utils";

export default function ProductsAdminPage() {
  const [viewMode, setViewMode] = useState<"ACTIVE" | "DELETED">("ACTIVE");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [dialogState, setDialogState] = useState<{
    type: "NONE" | "INFO" | "PRICE" | "GALLERY";
    product: ProductResponse | null;
  }>({ type: "NONE", product: null });

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

  const categoriesQuery = useCategories({ activeOnly: true }, 0, 100);
  const categories = categoriesQuery.data?.data || [];

  const activeQuery = useProducts({ 
    name: search || undefined,
    categories: selectedCategory ? [selectedCategory] : undefined
  }, page, 10);
  
  const trashedQuery = useTrashedProducts(page, 10);
  
  const query = viewMode === "ACTIVE" ? activeQuery : trashedQuery;
  const products: ProductResponse[] = query.data?.data || [];
  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // Mutations
  const createMutation = useCreateProduct();
  const updateInfoMutation = useUpdateProductInfo(dialogState.product?.id || 0);
  const updatePriceMutation = useUpdateProductPrice(dialogState.product?.id || 0);
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  const hardDeleteMutation = useHardDeleteProduct();

  const handleCreateOrUpdateInfo = async (data: { request: ProductRequest | ProductInfoUpdateRequest; image: File | null }) => {
    try {
      if (dialogState.product) {
        await updateInfoMutation.mutateAsync(data as { request: ProductInfoUpdateRequest; image: File | null });
        toast.success("Cập nhật thông tin sản phẩm thành công");
      } else {
        await createMutation.mutateAsync(data as { request: ProductRequest; image: File | null });
        toast.success("Thêm sản phẩm mới thành công");
      }
      setDialogState({ type: "NONE", product: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
      toast.error(message);
    }
  };

  const handleUpdatePrice = async (data: ProductPriceUpdateRequest) => {
    try {
      await updatePriceMutation.mutateAsync(data);
      toast.success("Cập nhật bảng giá thành công");
      setDialogState({ type: "NONE", product: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
      toast.error(message);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Vô hiệu hóa sản phẩm?",
      description: "Sản phẩm này sẽ bị ẩn khỏi cửa hàng nhưng không bị xóa vĩnh viễn.",
      variant: "warning",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success("Vô hiệu hóa thành công");
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Không thể vô hiệu hóa";
          toast.error(message);
        }
      }
    });
  };

  const handleRestore = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Khôi phục sản phẩm?",
      description: "Sản phẩm sẽ hiển thị lại trên cửa hàng.",
      variant: "info",
      onConfirm: async () => {
        try {
          await restoreMutation.mutateAsync(id);
          toast.success("Khôi phục thành công");
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Không thể khôi phục";
          toast.error(message);
        }
      }
    });
  };

  const handleHardDelete = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Xóa vĩnh viễn sản phẩm?",
      description: "Hành động này không thể hoàn tác. Tất cả dữ liệu ảnh và lịch sử giá sẽ bị xóa sạch.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await hardDeleteMutation.mutateAsync(id);
          toast.success("Xóa vĩnh viễn thành công");
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Không thể xóa";
          toast.error(message);
        }
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng sản phẩm"
          value={pagination?.totalElements || 0}
          trend={12}
          icon={Package}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Đang kinh doanh"
          value={viewMode === "ACTIVE" ? products.filter(p => p.isActive).length : "-"}
          trend={5}
          icon={Tag}
          accent="bg-emerald-500"
        />
        <StatCard
          title="Đã lưu trữ"
          value={viewMode === "DELETED" ? products.length : "-"}
          trend={0}
          icon={EyeOff}
          accent="bg-red-500"
        />
        <StatCard
          title="Tăng trưởng"
          value="+15.4%"
          trend={15.4}
          icon={TrendingUp}
          accent="bg-zinc-950"
        />
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100">
            <button
              onClick={() => { setViewMode("ACTIVE"); setPage(0); }}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === "ACTIVE" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Hoạt động
            </button>
            <button
              onClick={() => { setViewMode("DELETED"); setPage(0); }}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === "DELETED" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Lưu trữ
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {viewMode === "ACTIVE" && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 rounded-xl bg-zinc-50 border-zinc-100 text-xs font-bold focus:bg-white transition-all px-3 outline-none"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.name}</option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm thiết bị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-xl bg-zinc-50 border-zinc-100 text-xs font-bold focus:bg-white transition-all"
            />
          </div>
          
          <Button
            onClick={() => setDialogState({ type: "INFO", product: null })}
            className="h-11 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-bold px-6 transition-all gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm thiết bị</span>
          </Button>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] w-[35%]">Thông tin thiết bị</th>
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Bảng giá</th>
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Ngày tạo</th>
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-16 bg-zinc-50 rounded-xl w-full" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState 
                      title="Không tìm thấy thiết bị" 
                      description="Hãy thử thay đổi từ khóa tìm kiếm hoặc thêm sản phẩm mới."
                    />
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <ProductTableRow
                    key={p.id}
                    product={p}
                    onEdit={(prod) => setDialogState({ type: "INFO", product: prod })}
                    onUpdatePrice={(prod) => setDialogState({ type: "PRICE", product: prod })}
                    onGallery={(prod) => { toast.info("Tính năng Quản lý Gallery đang được phát triển."); }}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    onHardDelete={handleHardDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden p-4 space-y-4">
          {query.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-zinc-50 rounded-2xl animate-pulse" />
            ))
          ) : products.length === 0 ? (
            <EmptyState title="Trống" description="Không có sản phẩm nào." />
          ) : (
            products.map((p) => (
              <ProductMobileCard
                key={p.id}
                product={p}
                onEdit={(prod) => setDialogState({ type: "INFO", product: prod })}
                onUpdatePrice={(prod) => setDialogState({ type: "PRICE", product: prod })}
                onGallery={(prod) => { toast.info("Tính năng Quản lý Gallery đang được phát triển."); }}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onHardDelete={handleHardDelete}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 rounded-lg border-zinc-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 rounded-lg border-zinc-200"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ProductDialog
        open={dialogState.type === "INFO"}
        onOpenChange={(o) => !o && setDialogState({ type: "NONE", product: null })}
        product={dialogState.product}
        categories={categories}
        onSubmit={handleCreateOrUpdateInfo}
        isPending={createMutation.isPending || updateInfoMutation.isPending}
      />

      <ProductPriceDialog
        open={dialogState.type === "PRICE"}
        onOpenChange={(o) => !o && setDialogState({ type: "NONE", product: null })}
        product={dialogState.product}
        onSubmit={handleUpdatePrice}
        isPending={updatePriceMutation.isPending}
      />

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(o) => setConfirmConfig(prev => ({ ...prev, open: o }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
