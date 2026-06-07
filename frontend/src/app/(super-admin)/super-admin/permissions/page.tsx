"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Key,
  Trash2,
  Edit2,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from "@/services/permission";
import { PermissionResponse, PermissionRequest } from "@/types/permission";
import { Pagination } from "../components/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { EmptyState } from "../users/components/EmptyState";
import { StatCard } from "../components/StatCard";

export default function PermissionsSuperAdminPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponse | null>(null);

  // Form states
  const [permName, setPermName] = useState("");
  const [permDesc, setPermDesc] = useState("");

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

  const permissionsQuery = usePermissions(page, 10);

  const permissions = permissionsQuery.data?.data || [];
  const pagination = permissionsQuery.data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;

  // Mutations
  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission(selectedPermission?.id || 0);
  const deleteMutation = useDeletePermission();

  // Filter local data if search keyword is present
  const filteredPermissions = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = (permission?: PermissionResponse) => {
    if (permission) {
      setSelectedPermission(permission);
      setPermName(permission.name);
      setPermDesc(permission.description || "");
    } else {
      setSelectedPermission(null);
      setPermName("");
      setPermDesc("");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permName.trim()) {
      toast.error("Vui lòng nhập tên quyền hạn");
      return;
    }

    try {
      const payload: PermissionRequest = {
        name: permName.trim().toUpperCase(),
        description: permDesc.trim(),
      };

      if (selectedPermission) {
        await updateMutation.mutateAsync(payload);
        toast.success("Cập nhật quyền hạn thành công");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Tạo quyền hạn mới thành công");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đã xảy ra lỗi";
      toast.error(message);
    }
  };

  const handleDelete = (permission: PermissionResponse) => {
    setConfirmConfig({
      open: true,
      title: "Xóa quyền hạn?",
      description: `Bạn có chắc chắn muốn xóa quyền hạn "${permission.name}"? Thao tác này có thể ảnh hưởng đến hoạt động phân quyền của các vai trò hiện tại.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(permission.id);
          toast.success("Xóa quyền hạn thành công");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error: any) {
          const message = error?.response?.data?.message || "Không thể xóa quyền hạn";
          toast.error(message);
        }
      },
    });
  };

  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Tổng số quyền"
          value={totalElements}
          trend={0}
          icon={Key}
          accent="bg-red-600"
        />
        <StatCard
          title="Xem trang hiện tại"
          value={filteredPermissions.length}
          trend={0}
          icon={Lock}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Trạng thái phân quyền"
          value="Đang hoạt động"
          trend={0}
          icon={Key}
          accent="bg-emerald-500"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 sm:py-5 border-b border-zinc-50">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
            {/* Left: Title */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100">
                  <Key className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-950 tracking-tight leading-tight">
                  Quản lý quyền hạn (Permissions)
                </h2>
              </div>
              <p className="text-[14px] text-zinc-500 font-medium ml-12">
                Quản lý danh sách các quyền hạn chức năng cụ thể trong toàn bộ hệ thống API
              </p>
            </div>

            {/* Right: Search & Add */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-72 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors duration-200" />
                <Input
                  placeholder="Tìm quyền hạn..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleOpenDialog()}
                className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-red-600 transition-all duration-150 font-semibold text-[14px] flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Thêm quyền hạn
              </Button>
            </div>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">ID</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Tên quyền</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Mô tả</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {permissionsQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-6">
                      <div className="h-10 bg-zinc-50 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title="Không tìm thấy quyền hạn"
                      description="Hãy thử thay đổi từ khóa tìm kiếm hoặc tạo quyền hạn mới."
                    />
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((perm) => (
                  <tr key={perm.id} className="group hover:bg-zinc-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 text-xs font-semibold text-zinc-400">
                      #{perm.id.toString().padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-xl border border-red-100">
                        {perm.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 max-w-[400px] truncate">
                      {perm.description || "(Không có mô tả)"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenDialog(perm)}
                          className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 transition-colors shadow-sm active:scale-90"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(perm)}
                          className="p-2 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-600 text-red-600 hover:text-white transition-colors shadow-sm active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

      {/* Permission Dialog (Add/Edit) */}
      <AdminFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        icon={Key}
        iconClassName="bg-zinc-950 text-white"
        title={selectedPermission ? "Cập nhật quyền hạn" : "Thêm quyền hạn mới"}
        description={selectedPermission ? "Chỉnh sửa tên và mô tả chi tiết của quyền hạn" : "Tạo mã quyền hạn mới trong hệ thống"}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="permName" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Tên quyền hạn <span className="text-red-500">*</span>
            </Label>
            <Input
              id="permName"
              placeholder="Ví dụ: PRODUCT_WRITE, USER_DELETE"
              value={permName}
              onChange={(e) => setPermName(e.target.value)}
              disabled={!!selectedPermission} // Prevent editing name of existing permission to keep keys in sync
              className="h-11 rounded-xl border-zinc-200 focus:border-red-500/30 text-sm font-medium"
            />
            {selectedPermission && (
              <p className="text-[10px] text-zinc-400 font-medium">
                Tên quyền hạn không thể thay đổi sau khi đã được định nghĩa.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="permDesc" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Mô tả chi tiết
            </Label>
            <Input
              id="permDesc"
              placeholder="Mô tả chức năng hoặc phạm vi của quyền này"
              value={permDesc}
              onChange={(e) => setPermDesc(e.target.value)}
              className="h-11 rounded-xl border-zinc-200 focus:border-red-500/30 text-sm font-medium"
            />
          </div>
        </div>
      </AdminFormDialog>

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
