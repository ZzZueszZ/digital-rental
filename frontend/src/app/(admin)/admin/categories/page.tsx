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
  AlertCircle
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
  useRestoreCategory 
} from "@/services/category";
import { CategoryResponse, CategoryCreateRequest } from "@/types/category";
import { CategoryDialog } from "./components/CategoryDialog";
import { CategoryTableRow, CategoryMobileCard } from "./components/CategoryListItems";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "../users/components/EmptyState";
import { StatCard } from "../components/StatCard";

export default function CategoriesAdminPage() {
  const [viewMode, setViewMode] = useState<"ACTIVE" | "DELETED">("ACTIVE");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
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

  const activeQuery = useCategories({ keyword: search || undefined, activeOnly: true }, page, 10);
  const deletedQuery = useDeletedCategories(page, 10);
  
  const query = viewMode === "ACTIVE" ? activeQuery : deletedQuery;
  const categories = query.data?.data || [];
  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

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
      description: "Danh mục này sẽ không hiển thị trên cửa hàng nhưng vẫn được lưu trữ.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success("Vô hiệu hóa danh mục thành công");
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
      title: "Khôi phục danh mục?",
      description: "Danh mục này sẽ hoạt động trở lại và hiển thị trên cửa hàng.",
      variant: "info",
      onConfirm: async () => {
        try {
          await restoreMutation.mutateAsync(id);
          toast.success("Khôi phục danh mục thành công");
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Không thể khôi phục";
          toast.error(message);
        }
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 lg:space-y-8">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng danh mục"
          value={pagination?.totalElements || 0}
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
          title="Đã vô hiệu"
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
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-xl bg-zinc-50 border-zinc-100 text-xs font-bold focus:bg-white transition-all"
            />
          </div>
          <Button
            onClick={() => { setSelectedCategory(null); setIsDialogOpen(true); }}
            className="h-11 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-bold px-6 transition-all gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm danh mục</span>
          </Button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Mã & ID</th>
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Tên & Mô tả</th>
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Ngày tạo</th>
                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-12 bg-zinc-50 rounded-xl w-full" /></td>
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
                    onEdit={(c) => { setSelectedCategory(c); setIsDialogOpen(true); }}
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
              <div key={i} className="h-32 bg-zinc-50 rounded-2xl animate-pulse" />
            ))
          ) : categories.length === 0 ? (
            <EmptyState title="Trống" description="Không có danh mục nào." />
          ) : (
            categories.map((cat) => (
              <CategoryMobileCard
                key={cat.id}
                category={cat}
                onEdit={(c) => { setSelectedCategory(c); setIsDialogOpen(true); }}
                onDelete={handleDelete}
                onRestore={handleRestore}
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
      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        onSubmit={handleCreateOrUpdate}
        isPending={createMutation.isPending || updateMutation.isPending}
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
