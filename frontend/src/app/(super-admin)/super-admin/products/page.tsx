"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  TrendingUp,
  Tag,
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
  useHardDeleteProduct,
  PRODUCT_KEYS,
} from "@/services/product";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/services/category";
import {
  ProductResponse,
  ProductRequest,
  ProductInfoUpdateRequest,
  ProductPriceUpdateRequest,
} from "@/types/product";
import { ProductDialog } from "./components/ProductDialog";
import { ProductPriceDialog } from "./components/ProductPriceDialog";
import { ProductGalleryDialog } from "./components/ProductGalleryDialog";
import {
  ProductTableRow,
  ProductMobileCard,
} from "./components/ProductListItems";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Pagination } from "../components/Pagination";
import { EmptyState } from "../users/components/EmptyState";
import { StatCard } from "../components/StatCard";
import { cn } from "@/lib/utils";

export default function ProductsAdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const activeQuery = useProducts(
    {
      name: search || undefined,
      categories: selectedCategory ? [selectedCategory] : undefined,
    },
    page,
    10,
  );

  const trashedQuery = useTrashedProducts(page, 10);

  const query = viewMode === "ACTIVE" ? activeQuery : trashedQuery;
  const products: ProductResponse[] = query.data?.data || [];
  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;

  // Mutations
  const createMutation = useCreateProduct();
  const updateInfoMutation = useUpdateProductInfo(dialogState.product?.id || 0);
  const updatePriceMutation = useUpdateProductPrice(
    dialogState.product?.id || 0,
  );
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  const hardDeleteMutation = useHardDeleteProduct();

  const handleCreateOrUpdateInfo = async (data: {
    request: ProductRequest | ProductInfoUpdateRequest;
    image: File | null;
  }) => {
    try {
      if (dialogState.product) {
        await updateInfoMutation.mutateAsync(
          data as { request: ProductInfoUpdateRequest; image: File | null },
        );
        toast.success("Cập nhật thông tin sản phẩm thành công");
      } else {
        await createMutation.mutateAsync(
          data as { request: ProductRequest; image: File | null },
        );
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
      description: "Sản phẩm sẽ được chuyển vào thùng rác và ẩn khỏi cửa hàng.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          await queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
          toast.success("Đã chuyển sản phẩm vào thùng rác");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error: unknown) {
          toast.error("Không thể xóa sản phẩm");
        }
      },
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
          await queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
          toast.success("Đã khôi phục sản phẩm");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error: unknown) {
          toast.error("Không thể khôi phục sản phẩm");
        }
      },
    });
  };

  const handleHardDelete = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Xác nhận xóa vĩnh viễn?",
      description:
        "Hành động này sẽ xóa sạch dữ liệu sản phẩm, hình ảnh và lịch sử giá. Không thể hoàn tác!",
      variant: "danger",
      onConfirm: async () => {
        try {
          await hardDeleteMutation.mutateAsync(id);
          await queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
          toast.success("Đã xóa vĩnh viễn sản phẩm");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error: unknown) {
          toast.error("Không thể xóa vĩnh viễn");
        }
      },
    });
  };

  const handleView = (id: number) => {
    router.push(`/super-admin/products/${id}`);
  };

  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng sản phẩm"
          value={totalElements}
          trend={8}
          icon={Package}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Đang hoạt động"
          value={viewMode === "ACTIVE" ? products.length : "-"}
          trend={12}
          icon={TrendingUp}
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
          title="Thương hiệu"
          value="12+"
          trend={2}
          icon={Tag}
          accent="bg-zinc-950"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 sm:py-5 border-b border-zinc-50">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
            {/* Left: Title + Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100/20">
                    <Package
                      className="w-4.5 h-4.5 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-950 tracking-tight leading-tight">
                    {viewMode === "ACTIVE" ? "Quản lý thiết bị" : "Kho lưu trữ"}
                  </h2>
                </div>
                <p className="text-[14px] text-zinc-500 font-medium ml-12">
                  Danh mục trang thiết bị nhiếp ảnh chuyên nghiệp
                </p>
              </div>

              {/* Tab Toggle */}
              <div className="flex items-center gap-1 bg-zinc-50/50 border border-zinc-100 p-1 rounded-xl w-fit">
                {(["ACTIVE", "DELETED"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setPage(0);
                    }}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-[14px] font-medium transition-all duration-150",
                      viewMode === mode
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50",
                    )}
                  >
                    {mode === "ACTIVE" ? "Hoạt động" : "Lưu trữ"}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Search + Category + Add */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-64 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors duration-200" />
                <Input
                  placeholder="Tìm tên thiết bị..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
                className="h-10 px-4 rounded-xl border border-zinc-100 bg-zinc-50/50 text-[14px] font-medium text-zinc-700 outline-none focus:bg-white transition-all min-w-[140px]"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <Button
                onClick={() => setDialogState({ type: "INFO", product: null })}
                className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-red-600 transition-all duration-150 font-semibold text-[14px] flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Thêm thiết bị
              </Button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="overflow-x-auto">
          {/* Desktop View */}
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Thiết bị
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Giá Niêm Yết
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {query.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="h-12 bg-zinc-50 rounded-xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="Trống"
                        description={
                          viewMode === "DELETED"
                            ? "Không có sản phẩm nào trong thùng rác."
                            : "Hãy thử thay đổi bộ lọc hoặc thêm thiết bị mới."
                        }
                        actionText={
                          viewMode === "DELETED"
                            ? "Quay lại danh sách"
                            : undefined
                        }
                        onAction={
                          viewMode === "DELETED"
                            ? () => {
                                setViewMode("ACTIVE");
                                setPage(0);
                              }
                            : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <ProductTableRow
                      key={p.id}
                      product={p}
                      isDeleted={viewMode === "DELETED"}
                      onView={handleView}
                      onEdit={(p) =>
                        setDialogState({ type: "INFO", product: p })
                      }
                      onUpdatePrice={(p) =>
                        setDialogState({ type: "PRICE", product: p })
                      }
                      onGallery={(p) =>
                        setDialogState({ type: "GALLERY", product: p })
                      }
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
          <div className="md:hidden p-4 space-y-4">
            {query.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-zinc-50 rounded-2xl animate-pulse"
                />
              ))
            ) : products.length === 0 ? (
              <EmptyState
                title="Trống"
                description={
                  viewMode === "DELETED"
                    ? "Không có sản phẩm nào trong thùng rác."
                    : "Không có sản phẩm nào."
                }
                actionText={
                  viewMode === "DELETED" ? "Quay lại danh sách" : undefined
                }
                onAction={
                  viewMode === "DELETED"
                    ? () => {
                        setViewMode("ACTIVE");
                        setPage(0);
                      }
                    : undefined
                }
              />
            ) : (
              products.map((p) => (
                <ProductMobileCard
                  key={p.id}
                  product={p}
                  isDeleted={viewMode === "DELETED"}
                  onView={handleView}
                  onEdit={(p) => setDialogState({ type: "INFO", product: p })}
                  onUpdatePrice={(p) =>
                    setDialogState({ type: "PRICE", product: p })
                  }
                  onGallery={(p) =>
                    setDialogState({ type: "GALLERY", product: p })
                  }
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  onHardDelete={handleHardDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={10}
          onPageChange={setPage}
        />
      </div>

      {/* Dialogs */}
      <ProductDialog
        key={
          dialogState.type === "INFO"
            ? dialogState.product?.id || "new"
            : "closed"
        }
        open={dialogState.type === "INFO"}
        onOpenChange={(o) =>
          !o && setDialogState({ type: "NONE", product: null })
        }
        product={dialogState.product}
        categories={categories}
        onSubmit={handleCreateOrUpdateInfo}
        isPending={createMutation.isPending || updateInfoMutation.isPending}
      />

      <ProductPriceDialog
        open={dialogState.type === "PRICE"}
        onOpenChange={(o) =>
          !o && setDialogState({ type: "NONE", product: null })
        }
        product={dialogState.product}
        onSubmit={handleUpdatePrice}
        isPending={updatePriceMutation.isPending}
      />

      <ProductGalleryDialog
        open={dialogState.type === "GALLERY"}
        onOpenChange={(o) =>
          !o && setDialogState({ type: "NONE", product: null })
        }
        product={dialogState.product}
      />

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(o) => setConfirmConfig((prev) => ({ ...prev, open: o }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
        isLoading={
          deleteMutation.isPending ||
          restoreMutation.isPending ||
          hardDeleteMutation.isPending
        }
      />
    </div>
  );
}
