"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CreateUserDialog } from "./components/CreateUserDialog";
import { UserActionMenu } from "./components/UserActionMenu";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  Clock,
  UserCheck,
  Camera,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Aperture,
  Eye,
  Edit2,
  CheckSquare,
  Square,
  Trash2 as Trash2Icon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  useUsers,
  useDeletedUsers,
  useLockUser,
  useUnlockUser,
  useResetPassword,
  useDeleteUser,
  useRestoreUser,
  useDeleteManyUsers,
  useRestoreManyUsers,
} from "@/services/user";
import { useUserSummaryStats } from "@/services/dashboard";
import { AccountStatus, KycStatus, TrustLevel } from "@/types/user";
import { toast } from "sonner";
import { getAvatarColor, STATUS_CONFIG } from "./lib/userConfig";
import { StatCard } from "../components/StatCard";
import { Pagination } from "../components/Pagination";

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UsersAdminPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"ACTIVE" | "DELETED">("ACTIVE");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [size] = useState(10);

  const criteria = { keyword: search || undefined };

  const activeUsersQuery = useUsers(criteria, page, size);
  const deletedUsersQuery = useDeletedUsers(criteria, page, size);
  const summaryStatsQuery = useUserSummaryStats();

  const query = viewMode === "ACTIVE" ? activeUsersQuery : deletedUsersQuery;
  const users = query.data?.data || [];
  const pagination = query.data?.pagination;
  const stats = summaryStatsQuery.data?.data;

  // Mutations
  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();
  const resetPasswordMutation = useResetPassword();
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();
  const deleteManyMutation = useDeleteManyUsers();
  const restoreManyMutation = useRestoreManyUsers();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const allSelected =
    users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(users.map((u) => u.id)));

  // Clear selection when view mode or page changes
  const handleViewModeChange = (mode: "ACTIVE" | "DELETED") => {
    setViewMode(mode);
    setPage(0);
    setSelectedIds(new Set());
  };

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "danger" | "warning" | "info";
    action: (() => Promise<unknown>) | null;
    successMsg: string;
    isLoading: boolean;
  }>({
    open: false,
    title: "",
    description: "",
    variant: "danger",
    action: null,
    successMsg: "",
    isLoading: false,
  });

  const confirmAndExecute = async () => {
    if (!confirmDialog.action) return;
    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      await confirmDialog.action();
      toast.success(confirmDialog.successMsg);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setConfirmDialog((prev) => ({ ...prev, open: false, isLoading: false }));
    }
  };

  const requestAction = (
    title: string,
    description: string,
    variant: "danger" | "warning" | "info",
    action: () => Promise<unknown>,
    successMsg: string,
  ) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      variant,
      action,
      successMsg,
      isLoading: false,
    });
  };

  const getStatusBadge = (status: AccountStatus) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["DISABLED"];
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
          config.badge,
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
        {config.label}
      </span>
    );
  };

  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;

  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* ── KPI STATS GRID ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng thành viên"
          value={stats?.totalUsers || 0}
          trend={5}
          icon={Users}
          accent="bg-violet-500"
        />
        <StatCard
          title="Đang hoạt động"
          value={stats?.activeUsers || 0}
          trend={8}
          icon={UserCheck}
          accent="bg-emerald-500"
        />
        <StatCard
          title="Chờ xác minh"
          value={stats?.pendingUsers || 0}
          trend={-3}
          icon={Clock}
          accent="bg-amber-500"
        />
        <StatCard
          title="Thành viên mới (24h)"
          value={`+${stats?.newUsersToday || 0}`}
          trend={12}
          icon={UserPlus}
          accent="bg-zinc-950"
        />
      </div>

      {/* ── MAIN TABLE CARD ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 sm:py-5 border-b border-zinc-50">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
            {/* Left: Title + Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100/20">
                    <Users className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-[30px] font-semibold text-zinc-950 tracking-tight leading-tight">
                    {viewMode === "ACTIVE" ? "Quản lý thành viên" : "Thùng rác"}
                  </h2>
                </div>
                <p className="text-[14px] text-zinc-500 font-medium ml-12">
                  Giám sát & phân quyền tài khoản nhiếp ảnh gia
                </p>
              </div>


            </div>

            {/* Right: Search + Add */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-72 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors duration-200" />
                <Input
                  placeholder="Tìm theo email, ID..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

            </div>
          </div>
        </div>



        {/* ── MOBILE CARD LIST (< md) ───────────────────────────── */}
        <div className="md:hidden divide-y divide-zinc-50">
          {query.isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-zinc-100 rounded w-3/4" />
                    <div className="h-2 bg-zinc-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}

          {users.length === 0 && !query.isLoading && (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <Aperture className="w-7 h-7 text-zinc-300" />
              </div>
              <p className="text-sm font-bold text-zinc-400">
                Không tìm thấy thành viên
              </p>
              <p className="text-xs text-zinc-300">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}

          {users.map((u) => {
            const avatarColor = getAvatarColor(u.email);
            const statusCfg =
              STATUS_CONFIG[u.accountStatus] ?? STATUS_CONFIG["DISABLED"];
            return (
              <div
                key={u.id}
                onClick={() => router.push(`/staff/users/${u.id}`)}
                className={cn(
                  "p-4 transition-colors border-l-[3px] hover:border-zinc-950 cursor-pointer",
                  selectedIds.has(u.id)
                    ? "bg-zinc-50/80 border-zinc-950"
                    : "border-transparent hover:bg-zinc-50",
                )}
              >
                <div className="flex items-center gap-3">

                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
                      avatarColor.bg,
                    )}
                  >
                    <span
                      className={cn("font-black text-sm", avatarColor.text)}
                    >
                      {u.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                      {u.email}
                    </p>
                    <p className="text-xs text-zinc-400 font-mono">
                      #{u.id.toString().padStart(5, "0")}
                    </p>
                  </div>
                  <UserActionMenu
                    userId={u.id}
                    viewMode={viewMode}
                    accountNonLocked={u.accountNonLocked}
                    callbacks={{
                      onResetPassword: () =>
                        requestAction(
                          "Cấp lại mật khẩu",
                          `Cấp lại mật khẩu cho ${u.email}?`,
                          "warning",
                          () => resetPasswordMutation.mutateAsync(u.id),
                          "Đã cấp mật khẩu mới"
                        ),
                      onLock: () =>
                        requestAction(
                          "Khóa tài khoản",
                          `Khóa tài khoản ${u.email}?`,
                          "danger",
                          () => lockMutation.mutateAsync(u.id),
                          "Tài khoản đã bị khóa"
                        ),
                      onUnlock: () =>
                        requestAction(
                          "Mở khóa tài khoản",
                          `Mở khóa tài khoản ${u.email}?`,
                          "info",
                          () => unlockMutation.mutateAsync(u.id),
                          "Tài khoản đã được mở khóa"
                        ),
                      onDelete: () =>
                        requestAction(
                          "Vô hiệu hóa",
                          `Vô hiệu hóa tài khoản ${u.email}?`,
                          "danger",
                          () => deleteMutation.mutateAsync(u.id),
                          "Đã vô hiệu hóa"
                        ),
                      onRestore: () =>
                        requestAction(
                          "Khôi phục",
                          `Khôi phục tài khoản ${u.email}?`,
                          "info",
                          () => restoreMutation.mutateAsync(u.id),
                          "Đã khôi phục tài khoản"
                        ),
                    }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 pl-13">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                      statusCfg.badge,
                    )}
                  >
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)}
                    />
                    {statusCfg.label}
                  </span>
                  {u.kycStatus === KycStatus.VERIFIED ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <ShieldCheck className="w-3 h-3" /> KYC
                    </span>
                  ) : null}
                  {u.roles.map((role: string) => (
                    <span
                      key={role}
                      className={cn(
                        "inline-block text-xs font-bold px-2 py-0.5 rounded-md border",
                        role === "SUPER_ADMIN" || role === "ADMIN"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-zinc-50 text-zinc-600 border-zinc-200",
                      )}
                    >
                      {role}
                    </span>
                  ))}
                  <span className="text-xs text-zinc-400 font-medium ml-auto">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── DESKTOP TABLE (≥ md) ─────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">

                {[
                  "Thành viên",
                  "Trạng thái",
                  "Xác minh KYC",
                  "Quyền hạn",
                  "Gia nhập",
                  "Thao tác",
                ].map((col, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-6 py-3.5 text-[13px] font-medium text-zinc-400 whitespace-nowrap",
                      i === 5 && "text-right",
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {/* Loading Skeleton */}
              {query.isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-4">
                      <div className="h-4 bg-zinc-50 rounded w-4" />
                    </td>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-8 py-4">
                        <div className="h-4 bg-zinc-50 rounded-xl animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {/* Empty State */}
              {users.length === 0 && !query.isLoading && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                        <Aperture className="w-7 h-7 text-zinc-300" />
                      </div>
                      <p className="text-sm font-bold text-zinc-400">
                        Không tìm thấy thành viên
                      </p>
                      <p className="text-xs text-zinc-300">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {users.map((u) => {
                const avatarColor = getAvatarColor(u.email);
                return (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/staff/users/${u.id}`)}
                    className={cn(
                      "group transition-all duration-300 cursor-pointer",
                      selectedIds.has(u.id)
                        ? "bg-zinc-50/80"
                        : "hover:bg-zinc-50/50",
                    )}
                  >

                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                            "shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
                            avatarColor.bg,
                          )}
                        >
                          <span
                            className={cn(
                              "font-black text-sm",
                              avatarColor.text,
                            )}
                          >
                            {u.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-zinc-900 truncate max-w-[180px] group-hover:text-zinc-950 transition-colors duration-150">
                            {u.email}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            #{u.id.toString().padStart(5, "0")}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3">
                      {getStatusBadge(u.accountStatus)}
                    </td>

                    {/* KYC */}
                    <td className="px-6 py-3">
                      {u.kycStatus === KycStatus.VERIFIED ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <ShieldCheck className="w-3 h-3" />
                          Đã xác minh
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Chờ duyệt
                        </span>
                      )}
                    </td>

                    {/* Roles */}
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((role: string) => {
                          const isSpecial =
                            role === "SUPER_ADMIN" || role === "ADMIN";
                          return (
                            <span
                              key={role}
                              className={cn(
                                "inline-block text-xs font-bold px-2 py-0.5 rounded-md border",
                                isSpecial
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-zinc-50 text-zinc-600 border-zinc-200",
                              )}
                            >
                              {role}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Joined At */}
                    <td className="px-6 py-3">
                      <span className="text-xs font-medium text-zinc-500 tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end">
                        <UserActionMenu
                          compact
                          userId={u.id}
                          viewMode={viewMode}
                          accountNonLocked={u.accountNonLocked}
                          callbacks={{
                            onResetPassword: () =>
                              requestAction(
                                "Cấp lại mật khẩu",
                                `Bạn có chắc chắn muốn cấp lại mật khẩu cho tài khoản ${u.email}? Mật khẩu mới sẽ được gửi về email của người dùng.`,
                                "warning",
                                () => resetPasswordMutation.mutateAsync(u.id),
                                "Đã cấp mật khẩu mới",
                              ),
                            onLock: () =>
                              requestAction(
                                "Khóa tài khoản",
                                `Bạn có chắc chắn muốn khóa tài khoản ${u.email}? Người dùng sẽ không thể đăng nhập hoặc thực hiện giao dịch.`,
                                "danger",
                                () => lockMutation.mutateAsync(u.id),
                                "Tài khoản đã bị khóa",
                              ),
                            onUnlock: () =>
                              requestAction(
                                "Mở khóa tài khoản",
                                `Bạn có chắc chắn muốn mở khóa tài khoản ${u.email}? Người dùng sẽ có thể truy cập hệ thống bình thường.`,
                                "info",
                                () => unlockMutation.mutateAsync(u.id),
                                "Tài khoản đã được mở khóa",
                              ),
                            onDelete: () =>
                              requestAction(
                                "Vô hiệu hóa tài khoản",
                                `Bạn có chắc chắn muốn vô hiệu hóa tài khoản ${u.email}? Tài khoản sẽ được chuyển vào thùng rác.`,
                                "danger",
                                () => deleteMutation.mutateAsync(u.id),
                                "Đã vô hiệu hóa",
                              ),
                            onRestore: () =>
                              requestAction(
                                "Khôi phục tài khoản",
                                `Bạn có chắc chắn muốn khôi phục tài khoản ${u.email}? Tài khoản sẽ hoạt động lại bình thường.`,
                                "info",
                                () => restoreMutation.mutateAsync(u.id),
                                "Đã khôi phục tài khoản",
                              ),
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ──────────────────────────────────────────── */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={size}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmAndExecute}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
