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
import { Label } from "@/components/ui/label";
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

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Đã xảy ra lỗi"));
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
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, "Không thể xóa quyền hạn"));
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Tổng số quyền", value: totalElements, icon: Key },
          {
            label: "Hiển thị trên trang",
            value: filteredPermissions.length,
            icon: Lock,
          },
          { label: "Trạng thái", value: "Hoạt động", icon: Key },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-red-600">
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-zinc-950">
                {item.value}
              </p>
              <p className="text-xs font-normal text-zinc-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                Danh sách quyền hạn
              </h2>
              <p className="mt-1 text-sm font-normal text-zinc-500">
                Quản lý các quyền chức năng được sử dụng để cấu hình vai trò.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Tìm quyền hạn..."
                  className="h-10 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => handleOpenDialog()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <Plus className="w-4 h-4" />
                <span style={{ color: "#ffffff" }}>Thêm quyền hạn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">ID</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Tên quyền</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Mô tả</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
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
                  <tr key={perm.id} className="transition-colors hover:bg-zinc-50/70">
                    <td className="px-6 py-4 text-xs font-normal text-zinc-400">
                      #{perm.id.toString().padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg border border-red-100 bg-red-50 px-2 py-1 font-mono text-xs font-medium text-red-700">
                        {perm.name}
                      </span>
                    </td>
                    <td className="max-w-[400px] truncate px-6 py-4 text-[13px] font-normal text-zinc-600">
                      {perm.description || "(Không có mô tả)"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenDialog(perm)}
                          className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                          aria-label={`Chỉnh sửa ${perm.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(perm)}
                          className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                          aria-label={`Xóa ${perm.name}`}
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
            <Label htmlFor="permName" className="text-xs font-normal text-zinc-600">
              Tên quyền hạn <span className="text-red-500">*</span>
            </Label>
            <Input
              id="permName"
              placeholder="Ví dụ: PRODUCT_WRITE, USER_DELETE"
              value={permName}
              onChange={(e) => setPermName(e.target.value)}
              disabled={!!selectedPermission} // Prevent editing name of existing permission to keep keys in sync
              className="h-10 rounded-xl border-zinc-200 text-sm font-normal shadow-none focus-visible:border-zinc-400 focus-visible:ring-0"
            />
            {selectedPermission && (
              <p className="text-xs font-normal text-zinc-400">
                Tên quyền hạn không thể thay đổi sau khi đã được định nghĩa.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="permDesc" className="text-xs font-normal text-zinc-600">
              Mô tả chi tiết
            </Label>
            <Input
              id="permDesc"
              placeholder="Mô tả chức năng hoặc phạm vi của quyền này"
              value={permDesc}
              onChange={(e) => setPermDesc(e.target.value)}
              className="h-10 rounded-xl border-zinc-200 text-sm font-normal shadow-none focus-visible:border-zinc-400 focus-visible:ring-0"
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
