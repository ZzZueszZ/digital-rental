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
import { Button } from "@/components/ui/button";
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
import { StatCard } from "../components/StatCard";

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
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đã xảy ra lỗi";
      toast.error(message);
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
        } catch (error: any) {
          const message = error?.response?.data?.message || "Không thể xóa vai trò";
          toast.error(message);
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
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đã xảy ra lỗi";
      toast.error(message);
    }
  };

  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Tổng vai trò"
          value={totalElements}
          trend={0}
          icon={Shield}
          accent="bg-red-600"
        />
        <StatCard
          title="Vai trò hệ thống"
          value={4}
          trend={0}
          icon={ShieldAlert}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Quyền hệ thống"
          value={allPermissions.length}
          trend={0}
          icon={Shield}
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
                  <Shield className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-[30px] font-semibold text-zinc-950 tracking-tight leading-tight">
                  Quản lý vai trò (Roles)
                </h2>
              </div>
              <p className="text-[14px] text-zinc-500 font-medium ml-12">
                Định nghĩa các nhóm vai trò và gán phân quyền chi tiết cho nhân sự hệ thống
              </p>
            </div>

            {/* Right: Search & Add */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-72 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors duration-200" />
                <Input
                  placeholder="Tìm vai trò..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleOpenRoleDialog()}
                className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-red-600 transition-all duration-150 font-semibold text-[14px] flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Thêm vai trò
              </Button>
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">ID</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Mã vai trò</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Mô tả</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400">Quyền hạn</th>
                <th className="px-6 py-3.5 text-[13px] font-medium text-zinc-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
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
                    <tr key={role.id} className="group hover:bg-zinc-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 text-xs font-semibold text-zinc-400">
                        #{role.id.toString().padStart(3, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-block text-xs font-bold px-2.5 py-1 rounded-md border",
                            isSystem
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200"
                          )}
                        >
                          {role.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 max-w-[200px] truncate">
                        {role.description || "(Không có mô tả)"}
                      </td>
                      <td className="px-6 py-4">
                        {role.code === "SUPER_ADMIN" ? (
                          <span className="text-xs font-bold text-red-600 bg-red-50/50 px-2.5 py-1 rounded-full border border-red-100">
                            Full Quyền Hạn
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[400px]">
                            {role.permissions?.length === 0 ? (
                              <span className="text-xs text-zinc-400">Chưa gán quyền</span>
                            ) : (
                              role.permissions?.slice(0, 4).map((p) => (
                                <span
                                  key={p.id}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200"
                                >
                                  {p.name}
                                </span>
                              ))
                            )}
                            {role.permissions?.length > 4 && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-950 text-white">
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
                              "text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 shadow-sm",
                              role.code === "SUPER_ADMIN"
                                ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white hover:border-zinc-950"
                            )}
                          >
                            Phân quyền
                          </button>
                          <button
                            onClick={() => handleOpenRoleDialog(role)}
                            className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 transition-colors shadow-sm active:scale-90"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role)}
                            disabled={isSystem}
                            className={cn(
                              "p-2 rounded-xl border transition-colors shadow-sm active:scale-90",
                              isSystem
                                ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                : "border-red-100 bg-red-50/50 hover:bg-red-600 text-red-600 hover:text-white"
                            )}
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
            <Label htmlFor="roleCode" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Mã vai trò <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roleCode"
              placeholder="Ví dụ: ADMIN, WRITER, ACCOUNTANT"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              disabled={!!selectedRole} // Do not allow changing role code for existing roles to prevent breaking system relations
              className="h-11 rounded-xl border-zinc-200 focus:border-red-500/30 text-sm font-medium"
            />
            {selectedRole && (
              <p className="text-[10px] text-zinc-400 font-medium">
                Mã vai trò không thể thay đổi sau khi đã được định nghĩa.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roleDesc" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Mô tả chi tiết
            </Label>
            <Input
              id="roleDesc"
              placeholder="Mô tả chức năng hoặc giới hạn của vai trò này"
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              className="h-11 rounded-xl border-zinc-200 focus:border-red-500/30 text-sm font-medium"
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
          <p className="text-center text-sm font-semibold text-zinc-400 py-6">
            Không tìm thấy quyền hạn nào trong hệ thống.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {allPermissions.map((perm) => {
              const isChecked = selectedPermissionIds.includes(perm.id);
              return (
                <div
                  key={perm.id}
                  onClick={() => togglePermission(perm.id)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                    isChecked
                      ? "border-red-500 bg-red-50/20 shadow-[0_2px_8px_rgba(239,68,68,0.05)]"
                      : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors",
                      isChecked ? "bg-red-600 border-red-600 text-white" : "border-zinc-300 bg-white"
                    )}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 leading-none mb-1">
                      {perm.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold leading-normal">
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
