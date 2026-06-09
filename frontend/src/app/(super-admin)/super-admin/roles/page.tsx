"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Shield,
  Trash2,
  Edit2,
  ShieldAlert,
  Loader2,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAssignRolePermissions,
} from "@/services/role";
import { usePermissions } from "@/services/permission";
import { RoleResponse, RoleRequest } from "@/types/role";
import { Pagination } from "../components/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { EmptyState } from "../users/components/EmptyState";

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

export default function RolesSuperAdminPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);

  // Form states for Create/Edit Role
  const [roleCode, setRoleCode] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  // Permissions state for Assign Dialog
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

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

  const rolesQuery = useRoles(page, 10);
  const permissionsQuery = usePermissions(0, 100); // Fetch all permissions

  const roles = rolesQuery.data?.data || [];
  const pagination = rolesQuery.data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;

  const allPermissions = permissionsQuery.data?.data || [];

  // Mutations
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole(selectedRole?.id || 0);
  const deleteMutation = useDeleteRole();
  const assignPermissionsMutation = useAssignRolePermissions(selectedRole?.id || 0);

  // Filter roles based on keyword
  const filteredRoles = roles.filter(
    (r) =>
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenRoleDialog = (role?: RoleResponse) => {
    if (role) {
      setSelectedRole(role);
      setRoleCode(role.code);
      setRoleDesc(role.description || "");
    } else {
      setSelectedRole(null);
      setRoleCode("");
      setRoleDesc("");
    }
    setIsRoleDialogOpen(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleCode.trim()) {
      toast.error("Vui lòng nhập mã vai trò");
      return;
    }

    try {
      const payload: RoleRequest = {
        code: roleCode.trim().toUpperCase(),
        description: roleDesc.trim(),
      };

      if (selectedRole) {
        await updateMutation.mutateAsync(payload);
        toast.success("Cập nhật vai trò thành công");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Tạo vai trò mới thành công");
      }
      setIsRoleDialogOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Đã xảy ra lỗi"));
    }
  };

  const handleDeleteRole = (role: RoleResponse) => {
    // Disable deletion for system roles
    const systemRoles = ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"];
    if (systemRoles.includes(role.code)) {
      toast.error("Không thể xóa vai trò mặc định của hệ thống");
      return;
    }

    setConfirmConfig({
      open: true,
      title: "Xóa vai trò?",
      description: `Bạn có chắc chắn muốn xóa vai trò "${role.code}"? Thao tác này không thể hoàn tác.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(role.id);
          toast.success("Xóa vai trò thành công");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, "Không thể xóa vai trò"));
        }
      },
    });
  };

  const handleOpenAssignDialog = (role: RoleResponse) => {
    if (role.code === "SUPER_ADMIN") {
      toast.error("Không thể thay đổi quyền hạn của SUPER_ADMIN");
      return;
    }
    setSelectedRole(role);
    setSelectedPermissionIds(role.permissions.map((p) => p.id));
    setIsAssignDialogOpen(true);
  };

  const togglePermission = (id: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleAssignPermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      await assignPermissionsMutation.mutateAsync({
        permissionIds: selectedPermissionIds,
      });
      toast.success(`Cập nhật quyền hạn cho vai trò ${selectedRole.code} thành công`);
      setIsAssignDialogOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Đã xảy ra lỗi"));
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Tổng vai trò", value: totalElements, icon: Shield },
          { label: "Vai trò hệ thống", value: 4, icon: ShieldAlert },
          {
            label: "Quyền đang có",
            value: allPermissions.length,
            icon: Check,
          },
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
                Danh sách vai trò
              </h2>
              <p className="mt-1 text-sm font-normal text-zinc-500">
                Tạo nhóm vai trò và thiết lập các quyền được phép sử dụng.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Tìm vai trò..."
                  className="h-10 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => handleOpenRoleDialog()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <Plus className="w-4 h-4" />
                <span style={{ color: "#ffffff" }}>Thêm vai trò</span>
              </button>
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">ID</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Mã vai trò</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Mô tả</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Quyền hạn</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rolesQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6">
                      <div className="h-10 bg-zinc-50 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="Không tìm thấy vai trò"
                      description="Hãy thử thay đổi từ khóa tìm kiếm hoặc tạo vai trò mới."
                    />
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => {
                  const isSystem = ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"].includes(role.code);
                  return (
                    <tr key={role.id} className="transition-colors hover:bg-zinc-50/70">
                      <td className="px-6 py-4 text-xs font-normal text-zinc-400">
                        #{role.id.toString().padStart(3, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-block rounded-lg border px-2.5 py-1 text-xs font-medium",
                            isSystem
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200"
                          )}
                        >
                          {role.code}
                        </span>
                      </td>
                      <td className="max-w-[240px] truncate px-6 py-4 text-[13px] font-normal text-zinc-600">
                        {role.description || "(Không có mô tả)"}
                      </td>
                      <td className="px-6 py-4">
                        {role.code === "SUPER_ADMIN" ? (
                          <span className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-normal text-red-700">
                            Toàn bộ quyền
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[400px]">
                            {role.permissions?.length === 0 ? (
                              <span className="text-xs text-zinc-400">Chưa gán quyền</span>
                            ) : (
                              role.permissions?.slice(0, 4).map((p) => (
                                <span
                                  key={p.id}
                                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-normal text-zinc-600"
                                >
                                  {p.name}
                                </span>
                              ))
                            )}
                            {role.permissions?.length > 4 && (
                              <span className="rounded-lg bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                                +{role.permissions.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenAssignDialog(role)}
                            disabled={role.code === "SUPER_ADMIN"}
                            className={cn(
                              "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                              role.code === "SUPER_ADMIN"
                                ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                            )}
                          >
                            Phân quyền
                          </button>
                          <button
                            onClick={() => handleOpenRoleDialog(role)}
                            className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                            aria-label={`Chỉnh sửa ${role.code}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role)}
                            disabled={isSystem}
                            className={cn(
                              "rounded-xl border p-2 transition-colors",
                              isSystem
                                ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                : "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                            )}
                            aria-label={`Xóa ${role.code}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Role Dialog (Add/Edit) */}
      <AdminFormDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        icon={Shield}
        iconClassName="bg-zinc-950 text-white"
        title={selectedRole ? "Cập nhật vai trò" : "Thêm vai trò mới"}
        description={selectedRole ? "Chỉnh sửa mã và mô tả của vai trò" : "Tạo vai trò mới trong hệ thống"}
        onSubmit={handleRoleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="roleCode" className="text-xs font-normal text-zinc-600">
              Mã vai trò <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roleCode"
              placeholder="Ví dụ: ADMIN, WRITER, ACCOUNTANT"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              disabled={!!selectedRole} // Do not allow changing role code for existing roles to prevent breaking system relations
              className="h-10 rounded-xl border-zinc-200 text-sm font-normal shadow-none focus-visible:border-zinc-400 focus-visible:ring-0"
            />
            {selectedRole && (
              <p className="text-xs font-normal text-zinc-400">
                Mã vai trò không thể thay đổi sau khi đã được định nghĩa.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roleDesc" className="text-xs font-normal text-zinc-600">
              Mô tả chi tiết
            </Label>
            <Input
              id="roleDesc"
              placeholder="Mô tả chức năng hoặc giới hạn của vai trò này"
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              className="h-10 rounded-xl border-zinc-200 text-sm font-normal shadow-none focus-visible:border-zinc-400 focus-visible:ring-0"
            />
          </div>
        </div>
      </AdminFormDialog>

      {/* Assign Permissions Dialog */}
      <AdminFormDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        icon={ShieldAlert}
        iconClassName="bg-red-600 text-white"
        title={`Gán quyền hạn - ${selectedRole?.code}`}
        description={`Chọn các quyền hạn chức năng cụ thể cấp cho vai trò "${selectedRole?.code}"`}
        onSubmit={handleAssignPermissionsSubmit}
        isPending={assignPermissionsMutation.isPending}
        submitText="Cập nhật phân quyền"
        maxWidth="max-w-2xl"
      >
        {permissionsQuery.isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : allPermissions.length === 0 ? (
          <p className="py-6 text-center text-sm font-normal text-zinc-400">
            Không tìm thấy quyền hạn nào trong hệ thống.
          </p>
        ) : (
          <div className="grid max-h-[400px] grid-cols-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2">
            {allPermissions.map((perm) => {
              const isChecked = selectedPermissionIds.includes(perm.id);
              return (
                <div
                  key={perm.id}
                  onClick={() => togglePermission(perm.id)}
                  className={cn(
                    "flex cursor-pointer select-none items-start gap-3 rounded-xl border p-3 transition-colors",
                    isChecked
                      ? "border-red-200 bg-red-50"
                      : "border-zinc-200 hover:bg-zinc-50"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      isChecked ? "bg-red-600 border-red-600 text-white" : "border-zinc-300 bg-white"
                    )}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-medium leading-none text-zinc-900">
                      {perm.name}
                    </p>
                    <p className="text-[10px] font-normal leading-normal text-zinc-400">
                      {perm.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
