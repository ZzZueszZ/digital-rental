"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Tag,
  ChevronLeft,
  ChevronRight,
  Layers,
  EyeOff,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCategories,
  useDeletedCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useRestoreCategory,
} from "@/services/category";
import { CategoryResponse, CategoryCreateRequest } from "@/types/category";
import { Pagination } from "../components/Pagination";
import { CategoryDialog } from "./components/CategoryDialog";
import {
  CategoryTableRow,
  CategoryMobileCard,
} from "./components/CategoryListItems";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "../users/components/EmptyState";
import { StatCard } from "../components/StatCard";

export default function CategoriesAdminPage() {
  const [viewMode, setViewMode] = useState<"ACTIVE" | "DELETED">("ACTIVE");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryResponse | null>(null);
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

  const activeQuery = useCategories(
    { keyword: search || undefined, activeOnly: true },
    page,
    10,
  );
  const deletedQuery = useDeletedCategories(page, 10);

  const query = viewMode === "ACTIVE" ? activeQuery : deletedQuery;
  const categories = query.data?.data || [];
  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(selectedCategory?.id || 0);
  const deleteMutation = useDeleteCategory();
  const restoreMutation = useRestoreCategory();

  const handleCreateOrUpdate = async (values: CategoryCreateRequest) => {
    try {
      if (selectedCategory) {
        await updateMutation.mutateAsync(values);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Tạo danh mục mới thành công");
      }
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
      toast.error(message);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Vô hiệu hóa danh mục?",
      description:
        "Danh mục này sẽ không hiển thị trên cửa hàng nhưng vẫn được lưu trữ.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success("Vô hiệu hóa danh mục thành công");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Không thể vô hiệu hóa";
          toast.error(message);
        }
      },
    });
  };

  const handleRestore = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Khôi phục danh mục?",
      description:
        "Danh mục này sẽ hoạt động trở lại và hiển thị trên cửa hàng.",
      variant: "info",
      onConfirm: async () => {
        try {
          await restoreMutation.mutateAsync(id);
          toast.success("Khôi phục danh mục thành công");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Không thể khôi phục";
          toast.error(message);
        }
      },
    });
  };

  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng danh mục"
          value={totalElements}
          trend={12}
          icon={Layers}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Đang hoạt động"
          value={viewMode === "ACTIVE" ? categories.length : "-"}
          trend={5}
          icon={Tag}
          accent="bg-emerald-500"
        />
        <StatCard
          title="Đã lưu trữ"
          value={viewMode === "DELETED" ? categories.length : "-"}
          trend={0}
          icon={EyeOff}
          accent="bg-red-500"
        />
        <StatCard
          title="Tăng trưởng"
          value="+2.4%"
          trend={2.4}
          icon={TrendingUp}
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
                    <Layers
                      className="w-4.5 h-4.5 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-950 tracking-tight leading-tight">
                    {viewMode === "ACTIVE"
                      ? "Quản lý danh mục"
                      : "Danh mục lưu trữ"}
                  </h2>
                </div>
                <p className="text-[14px] text-zinc-500 font-medium ml-12">
                  Cơ cấu và phân loại thiết bị nhiếp ảnh
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

            {/* Right: Search + Add */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-72 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors duration-200" />
                <Input
                  placeholder="Tìm tên danh mục..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
              <Button
                onClick={() => {
                  setSelectedCategory(null);
                  setIsDialogOpen(true);
                }}
                className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Thêm danh mục
              </Button>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="overflow-x-auto">
          {/* Desktop View */}
          <div className="hidden lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Mã & ID
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Tên & Mô tả
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">
                    Trạng thái
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
                      <td colSpan={5} className="px-8 py-6">
                        <div className="h-10 bg-zinc-50 rounded-xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="Không tìm thấy danh mục"
                        description="Hãy thử thay đổi từ khóa tìm kiếm hoặc tạo danh mục mới."
                      />
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <CategoryTableRow
                      key={cat.id}
                      category={cat}
                      onEdit={(c) => {
                        setSelectedCategory(c);
                        setIsDialogOpen(true);
                      }}
                      onDelete={handleDelete}
                      onRestore={handleRestore}
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
                <div
                  key={i}
                  className="h-32 bg-zinc-50 rounded-2xl animate-pulse"
                />
              ))
            ) : categories.length === 0 ? (
              <EmptyState title="Trống" description="Không có danh mục nào." />
            ) : (
              categories.map((cat) => (
                <CategoryMobileCard
                  key={cat.id}
                  category={cat}
                  onEdit={(c) => {
                    setSelectedCategory(c);
                    setIsDialogOpen(true);
                  }}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
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
      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        onSubmit={handleCreateOrUpdate}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(o) => setConfirmConfig((prev) => ({ ...prev, open: o }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
