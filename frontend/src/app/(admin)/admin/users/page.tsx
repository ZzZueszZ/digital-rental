"use client";

import { useState } from "react";
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
} from "@/components/ui/dropdown-menu";
import {
  useUsers,
  useDeletedUsers,
  useLockUser,
  useUnlockUser,
  useResetPassword,
  useDeleteUser,
  useRestoreUser,
} from "@/services/user";
import { useUserSummaryStats } from "@/services/dashboard";
import { AccountStatus, KycStatus, TrustLevel } from "@/types/user";
import { toast } from "sonner";

// ─── AVATAR COLOR PALETTE ───────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "from-red-500 to-rose-600", text: "text-white" },
  { bg: "from-blue-500 to-indigo-600", text: "text-white" },
  { bg: "from-emerald-500 to-teal-600", text: "text-white" },
  { bg: "from-violet-500 to-purple-600", text: "text-white" },
  { bg: "from-amber-500 to-orange-600", text: "text-white" },
  { bg: "from-pink-500 to-fuchsia-600", text: "text-white" },
];

function getAvatarColor(email: string) {
  const idx = email.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── STATUS CONFIG ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  ACTIVE: {
    label: "Hoạt động",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-0",
  },
  PENDING: {
    label: "Chờ duyệt",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200 ring-0",
  },
  SUSPENDED: {
    label: "Đình chỉ",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border border-red-200 ring-0",
  },
  DISABLED: {
    label: "Vô hiệu",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-500 border border-zinc-200 ring-0",
  },
  DELETED: {
    label: "Đã xóa",
    dot: "bg-zinc-800",
    badge: "bg-zinc-900 text-white border-0 ring-0",
  },
};

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  trend: number;
  icon: any;
  accent: string;
}) {
  const isPositive = trend >= 0;
  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl border border-zinc-200 p-5 overflow-hidden",
        "shadow-sm hover:shadow-2xl",
        "transition-all duration-500 hover:-translate-y-1 group"
      )}
    >
      <div className={cn("absolute top-0 left-0 w-full h-1 transition-all duration-500", accent, "opacity-0 group-hover:opacity-100")} />
      {/* Decorative BG Blob */}
      <div
        className={cn(
          "absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-[0.06] blur-2xl transition-all duration-500 group-hover:opacity-[0.12] group-hover:scale-125",
          accent
        )}
      />

      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
          {title}
        </p>
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
            "bg-zinc-50 group-hover:scale-110",
            accent.replace("bg-", "text-")
          )}
        >
          <Icon className="w-4.5 h-4.5" strokeWidth={2.5} />
        </div>
      </div>

      <p className="text-3xl font-black tracking-tight text-zinc-950 mb-2">
        {value}
      </p>

      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md",
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? "+" : ""}
          {trend}%
        </span>
        <span className="text-[10px] text-zinc-400 font-medium">
          so với kỳ trước
        </span>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UsersAdminPage() {
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

  const handleAction = async (
    action: () => Promise<any>,
    successMsg: string
  ) => {
    try {
      await action();
      toast.success(successMsg);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["DISABLED"];
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full",
          config.badge
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
        {config.label}
      </span>
    );
  };

  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;
  const startIndex = page * size + 1;
  const endIndex = Math.min((page + 1) * size, totalElements);

  // Page number buttons
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push("...");
      for (
        let i = Math.max(1, page - 1);
        i <= Math.min(totalPages - 2, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="flex-1 space-y-6">
      {/* ── KPI STATS GRID ─────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          accent="bg-red-500"
        />
      </div>

      {/* ── MAIN TABLE CARD ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-zinc-50">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-5">
            {/* Left: Title + Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm shadow-red-200">
                    <Camera className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-black text-zinc-950 tracking-tight">
                    {viewMode === "ACTIVE"
                      ? "Quản lý thành viên"
                      : "Thùng rác"}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 font-medium ml-10.5">
                  Giám sát &amp; phân quyền tài khoản nhiếp ảnh gia
                </p>
              </div>

              {/* Tab Toggle */}
              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-100 p-1 rounded-xl w-fit">
                {(["ACTIVE", "DELETED"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setPage(0);
                    }}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                      viewMode === mode
                        ? "bg-zinc-950 text-white shadow-md"
                        : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50"
                    )}
                  >
                    {mode === "ACTIVE" ? "Hoạt động" : "Thùng rác"}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Search + Add */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 lg:w-72 group focus-within:w-80 transition-all duration-300">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors duration-200" />
                <Input
                  placeholder="Tìm theo email, ID..."
                  className="pl-10 h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white focus:border-red-500/30 focus:ring-2 focus:ring-red-500/20 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
              <Button className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-red-600 transition-all duration-300 font-bold text-xs flex items-center gap-2 shadow-sm whitespace-nowrap">
                <Plus className="w-3.5 h-3.5" />
                Thêm thành viên
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-100">
                {[
                  "Thành viên",
                  "Trạng thái",
                  "Xác minh KYC",
                  "Quyền hạn",
                  "Gia nhập",
                  "",
                ].map((col, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap",
                      i === 5 && "text-right"
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
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-zinc-100 rounded-lg animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {/* Empty State */}
              {users.length === 0 && !query.isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
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
                    className="group hover:bg-zinc-50/80 transition-all duration-200 border-l-[3px] border-transparent hover:border-red-600"
                  >
                    {/* Member */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                            "shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
                            avatarColor.bg
                          )}
                        >
                          <span
                            className={cn(
                              "font-black text-sm",
                              avatarColor.text
                            )}
                          >
                            {u.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate max-w-[180px]">
                            {u.email}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            #{u.id.toString().padStart(5, "0")}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(u.accountStatus)}
                    </td>

                    {/* KYC */}
                    <td className="px-6 py-4">
                      {u.kycStatus === KycStatus.VERIFIED ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <ShieldCheck className="w-3 h-3" />
                          Đã xác minh
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Chờ duyệt
                        </span>
                      )}
                    </td>

                    {/* Roles */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((role: any) => {
                          const isSpecial = role === "SUPER_ADMIN" || role === "ADMIN";
                          return (
                            <span
                              key={role}
                              className={cn(
                                "inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.15em] border",
                                isSpecial ? "bg-red-50 text-red-700 border-red-200" : "bg-zinc-50 text-zinc-600 border-zinc-200"
                              )}
                            >
                              {role}
                            </span>
                          )
                        })}
                      </div>
                    </td>

                    {/* Joined At */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-zinc-500 tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 rounded-lg p-0 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-all duration-200"
                            >
                              <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 p-1.5 rounded-xl border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
                          >
                            <DropdownMenuLabel className="text-[9px] font-black uppercase text-zinc-400 px-3 py-1.5 tracking-widest">
                              Tác vụ quản trị
                            </DropdownMenuLabel>
                            {viewMode === "ACTIVE" ? (
                              <>
                                <DropdownMenuItem
                                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer focus:bg-zinc-50 text-zinc-700"
                                  onClick={() =>
                                    handleAction(
                                      () =>
                                        resetPasswordMutation.mutateAsync(u.id),
                                      "Đã cấp mật khẩu mới"
                                    )
                                  }
                                >
                                  <RefreshCw
                                    className={cn(
                                      "w-3.5 h-3.5 text-zinc-400",
                                      resetPasswordMutation.isPending &&
                                        "animate-spin"
                                    )}
                                  />
                                  Reset mật khẩu
                                </DropdownMenuItem>
                                {u.accountNonLocked ? (
                                  <DropdownMenuItem
                                    className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer focus:bg-amber-50 focus:text-amber-700 text-zinc-700"
                                    onClick={() =>
                                      handleAction(
                                        () => lockMutation.mutateAsync(u.id),
                                        "Tài khoản đã bị khóa"
                                      )
                                    }
                                  >
                                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                                    Khóa tài khoản
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 text-zinc-700"
                                    onClick={() =>
                                      handleAction(
                                        () => unlockMutation.mutateAsync(u.id),
                                        "Tài khoản đã được mở khóa"
                                      )
                                    }
                                  >
                                    <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                                    Mở khóa
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="my-1 bg-zinc-50" />
                                <DropdownMenuItem
                                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                  onClick={() =>
                                    handleAction(
                                      () => deleteMutation.mutateAsync(u.id),
                                      "Đã vô hiệu hóa"
                                    )
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Vô hiệu hóa
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer text-emerald-700 focus:bg-emerald-50"
                                onClick={() =>
                                  handleAction(
                                    () => restoreMutation.mutateAsync(u.id),
                                    "Đã khôi phục tài khoản"
                                  )
                                }
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Khôi phục tài khoản
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ──────────────────────────────────────────── */}
        <div className="px-6 sm:px-8 py-5 border-t border-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Result Info */}
          <p className="text-xs text-zinc-400 font-medium order-2 sm:order-1">
            {totalElements > 0 ? (
              <>
                Hiển thị{" "}
                <span className="font-bold text-zinc-600">
                  {startIndex}–{endIndex}
                </span>{" "}
                trong{" "}
                <span className="font-bold text-zinc-600">{totalElements}</span>{" "}
                thành viên
              </>
            ) : (
              "Không có kết quả"
            )}
          </p>

          {/* Page Controls */}
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={page === 0 || query.isLoading}
              onClick={() => {
                setPage((p) => p - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-8 w-8 rounded-lg border border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            </Button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 text-xs font-bold"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p as number);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "h-8 min-w-[2rem] px-2.5 rounded-lg text-xs font-bold transition-all duration-200 border",
                    page === p
                      ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                      : "border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-200"
                  )}
                >
                  {(p as number) + 1}
                </button>
              )
            )}

            <Button
              variant="ghost"
              size="icon"
              disabled={page >= totalPages - 1 || query.isLoading}
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-8 w-8 rounded-lg border border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
