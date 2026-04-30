"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateUser } from "@/services/user";
import { UserProfileCard } from "./UserProfileCard";
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Edit2,
  Save,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KycStatus,
  AccountStatus,
  TrustLevel,
  Role,
  UserResponse,
} from "@/types/user";

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

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  ACTIVE: {
    label: "Hoạt động",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  PENDING: {
    label: "Chờ duyệt",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  SUSPENDED: {
    label: "Đình chỉ",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border border-red-200",
  },
  DISABLED: {
    label: "Vô hiệu",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  },
  DELETED: {
    label: "Đã xóa",
    dot: "bg-zinc-800",
    badge: "bg-zinc-900 text-white border-0",
  },
};

export function UserForm({
  user,
  userId,
  mode,
}: {
  user: UserResponse;
  userId: number;
  mode: "view" | "edit";
}) {
  const router = useRouter();
  const isEditing = mode === "edit";
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const [formData, setFormData] = useState({
    phone: user.phone || "",
    accountStatus: user.accountStatus,
    kycStatus: user.kycStatus,
    trustLevel: user.trustLevel,
    enabled: user.enabled,
    accountNonLocked: user.accountNonLocked,
    roles: user.roles as string[],
  });

  const statusConfig =
    STATUS_CONFIG[isEditing ? formData.accountStatus : user.accountStatus] ??
    STATUS_CONFIG["DISABLED"];

  const handleSubmit = async () => {
    try {
      await updateUser({ id: userId, payload: formData });
      toast.success("Cập nhật tài khoản thành công");
      router.push(`/admin/users/${userId}`);
    } catch (error) {
      toast.error("Cập nhật thất bại, vui lòng thử lại");
    }
  };

  const toggleRole = (role: string) => {
    if (!isEditing) return;
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <div className="flex-1 space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(isEditing ? `/admin/users/${userId}` : "/admin/users")
            }
            className="h-12 w-12 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-zinc-950">
              {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ người dùng"}
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              {isEditing ? (
                <>
                  Cập nhật thông tin cho tài khoản{" "}
                  <span className="font-bold text-zinc-900">{user.email}</span>
                </>
              ) : (
                `Chi tiết tài khoản và lịch sử hệ thống của ID #${user.id}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/users/${userId}`)}
                disabled={isPending}
                className="h-12 px-6 rounded-full font-bold transition-all text-zinc-900 bg-white border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="h-12 px-8 rounded-full bg-zinc-950 text-white font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button
              onClick={() => router.push(`/admin/users/${userId}/edit`)}
              className="h-12 px-6 rounded-full bg-zinc-950 text-white font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Unified Profile Card */}
        <div className="md:col-span-1">
          <UserProfileCard
            userId={userId}
            user={user}
            isEditing={isEditing}
            phone={formData.phone}
            onPhoneChange={(v) => setFormData((prev) => ({ ...prev, phone: v }))}
            roles={formData.roles}
            onRolesChange={(roles) => setFormData((prev) => ({ ...prev, roles }))}
          />
        </div>

        {/* Right Col: Account Info */}
        <div className="md:col-span-2 space-y-6">
          <Card
            className={cn(
              "rounded-2xl border bg-white shadow-sm overflow-hidden relative group transition-all duration-500",
              isEditing
                ? "border-zinc-300 ring-1 ring-zinc-100"
                : "border-zinc-200 hover:shadow-2xl",
            )}
          >
            <div
              className={cn(
                "absolute top-0 left-0 w-full h-1 transition-all duration-500",
                isEditing
                  ? "bg-zinc-950 opacity-100"
                  : "bg-zinc-950 opacity-0 group-hover:opacity-100",
              )}
            />
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                Trạng thái bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                {/* Account Status */}
                <div
                  className={cn(
                    "rounded-xl p-4 border",
                    isEditing
                      ? "bg-white border-zinc-200"
                      : "bg-zinc-50/50 border-zinc-100",
                  )}
                >
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">
                    Tình trạng tài khoản
                  </p>
                  {isEditing ? (
                    <Select
                      value={formData.accountStatus}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountStatus: val as AccountStatus,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm font-bold text-zinc-900 focus:ring-1 focus:ring-red-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-200 p-1">
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={AccountStatus.ACTIVE}>Hoạt động</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={AccountStatus.PENDING}>Chờ duyệt</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={AccountStatus.SUSPENDED}>Đình chỉ</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={AccountStatus.DISABLED}>Vô hiệu</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={AccountStatus.DELETED}>Đã xóa</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full",
                        statusConfig.badge,
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          statusConfig.dot,
                        )}
                      />
                      {statusConfig.label}
                    </span>
                  )}
                </div>

                {/* Lock Status */}
                <div
                  className={cn(
                    "rounded-xl p-4 border flex flex-col justify-center",
                    isEditing
                      ? "bg-white border-zinc-200"
                      : "bg-zinc-50/50 border-zinc-100",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                        Trạng thái khóa
                      </p>
                      {!isEditing &&
                        (user.accountNonLocked ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Unlock className="w-3.5 h-3.5" />
                            Không bị khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                            <Lock className="w-3.5 h-3.5" />
                            Đang bị khóa
                          </span>
                        ))}
                    </div>
                    {isEditing && (
                      <Switch
                        checked={formData.accountNonLocked}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            accountNonLocked: checked,
                          }))
                        }
                      />
                    )}
                  </div>
                </div>

                {/* KYC Status */}
                <div
                  className={cn(
                    "rounded-xl p-4 border",
                    isEditing
                      ? "bg-white border-zinc-200"
                      : "bg-zinc-50/50 border-zinc-100",
                  )}
                >
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">
                    Xác minh danh tính (KYC)
                  </p>
                  {isEditing ? (
                    <Select
                      value={formData.kycStatus}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          kycStatus: val as KycStatus,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm font-bold text-zinc-900 focus:ring-1 focus:ring-red-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-200 p-1">
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={KycStatus.NOT_STARTED}>Chưa bắt đầu</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={KycStatus.PENDING}>Chờ duyệt</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={KycStatus.VERIFIED}>Đã xác minh</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={KycStatus.REJECTED}>Bị từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border",
                        user.kycStatus === KycStatus.VERIFIED
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : user.kycStatus === KycStatus.PENDING
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-zinc-100 border-zinc-200 text-zinc-600",
                      )}
                    >
                      {user.kycStatus === KycStatus.VERIFIED
                        ? "Đã xác minh"
                        : user.kycStatus === KycStatus.PENDING
                          ? "Chờ duyệt"
                          : "Chưa xác minh"}
                    </span>
                  )}
                </div>

                {/* Trust Level */}
                <div
                  className={cn(
                    "rounded-xl p-4 border",
                    isEditing
                      ? "bg-white border-zinc-200"
                      : "bg-zinc-50/50 border-zinc-100",
                  )}
                >
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">
                    Cấp độ tin cậy
                  </p>
                  {isEditing ? (
                    <Select
                      value={formData.trustLevel}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          trustLevel: val as TrustLevel,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm font-bold text-zinc-900 focus:ring-1 focus:ring-red-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-200 p-1">
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={TrustLevel.BASIC}>BASIC</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={TrustLevel.VERIFIED}>VERIFIED</SelectItem>
                        <SelectItem className="rounded-lg px-3 py-2 cursor-pointer" value={TrustLevel.ELITE}>ELITE</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-950 text-white tracking-widest uppercase">
                      {user.trustLevel}
                    </span>
                  )}
                </div>

                {/* Enabled Status (Only in Edit) */}
                {isEditing && (
                  <div className="rounded-xl p-4 border bg-white border-zinc-200 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">
                        Kích hoạt tài khoản
                      </p>
                      <p className="text-[11px] text-zinc-500 font-medium">
                        Tài khoản có thể đăng nhập vào hệ thống
                      </p>
                    </div>
                    <Switch
                      checked={formData.enabled}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, enabled: checked }))
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "rounded-2xl border bg-white shadow-sm overflow-hidden relative group transition-all duration-500",
              isEditing
                ? "opacity-50 pointer-events-none border-zinc-200"
                : "border-zinc-200 hover:shadow-2xl",
            )}
          >
            <div
              className={cn(
                "absolute top-0 left-0 w-full h-1 transition-all duration-500",
                isEditing
                  ? "bg-zinc-200"
                  : "bg-zinc-950 opacity-0 group-hover:opacity-100",
              )}
            />
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-400" />
                Lịch sử hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-950 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                      Ngày gia nhập
                    </p>
                    <p className="text-sm font-black tracking-tight text-zinc-950 tabular-nums">
                      {new Date(user.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-950 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                      Cập nhật cuối
                    </p>
                    <p className="text-sm font-black tracking-tight text-zinc-950 tabular-nums">
                      {new Date(user.updatedAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
