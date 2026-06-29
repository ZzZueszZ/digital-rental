"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Trash2,
  Save,
  Loader2,
  Edit2,
  X,
  Briefcase,
  Building2,
  CalendarDays,
  Users2,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  useAdminUserProfile,
  useUpdateAdminUserProfile,
  useUploadAdminUserAvatar,
  useDeleteAdminUserAvatar,
} from "@/services/profile";
import {
  Role,
  type UserResponse,
  type UserProfileUpdateRequest,
} from "@/types/user";

interface UserProfileCardProps {
  userId: number;
  user: UserResponse;
  /** phone & roles form state from parent (edit mode) */
  isEditing?: boolean;
  phone: string;
  onPhoneChange: (v: string) => void;
  roles: string[];
  onRolesChange: (roles: string[]) => void;
}

const AVATAR_COLORS = [
  "from-blue-400 to-cyan-500", // The bright blue from screenshot
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-red-600",
  "from-amber-500 to-orange-600",
  "from-fuchsia-500 to-pink-600",
];

const GENDERS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const BASE_URL = "https://api.lenshub.shop";

function getAvatarUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export function UserProfileCard({
  userId,
  user,
  isEditing = false,
  phone,
  onPhoneChange,
  roles,
  onRolesChange,
}: UserProfileCardProps) {
  const { data: res, isLoading } = useAdminUserProfile(userId);
  const profile = res?.data;

  const updateMutation = useUpdateAdminUserProfile(userId);
  const uploadAvatarMutation = useUploadAdminUserAvatar(userId);
  const deleteAvatarMutation = useDeleteAdminUserAvatar(userId);

  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [form, setForm] = useState<UserProfileUpdateRequest>({});
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName =
    profile?.fullName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    "—";

  const handleProfileEdit = () => {
    setForm({
      fullName: profile?.fullName || "",
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      gender: profile?.gender || undefined,
      dateOfBirth: profile?.dateOfBirth || "",
      occupation: profile?.occupation || "",
      companyName: profile?.companyName || "",
    });
    setIsProfileEditing(true);
  };

  const handleProfileCancel = () => {
    setForm({});
    setIsProfileEditing(false);
  };

  const handleProfileSave = async () => {
    try {
      const payload: UserProfileUpdateRequest = {};
      if (form.fullName !== undefined)
        payload.fullName = form.fullName || undefined;
      if (form.firstName !== undefined)
        payload.firstName = form.firstName || undefined;
      if (form.lastName !== undefined)
        payload.lastName = form.lastName || undefined;
      if (form.gender) payload.gender = form.gender;
      if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
      if (form.occupation !== undefined)
        payload.occupation = form.occupation || undefined;
      if (form.companyName !== undefined)
        payload.companyName = form.companyName || undefined;
      await updateMutation.mutateAsync(payload);
      toast.success("Đã cập nhật hồ sơ");
      setIsProfileEditing(false);
    } catch {
      toast.error("Không thể cập nhật hồ sơ");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB");
      return;
    }
    try {
      await uploadAvatarMutation.mutateAsync(file);
      toast.success("Đã cập nhật ảnh đại diện");
    } catch {
      toast.error("Không thể tải lên ảnh");
    }
    e.target.value = "";
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatarMutation.mutateAsync();
      toast.success("Đã xóa ảnh đại diện");
      setShowDeleteAvatarConfirm(false);
    } catch {
      toast.error("Không thể xóa ảnh");
    }
  };

  const toggleRole = (role: string) => {
    onRolesChange(
      roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role],
    );
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border shadow-[0_2px_6px_rgba(0,0,0,0.04)] relative group transition-all duration-500",
        isEditing
          ? "border-zinc-300 ring-1 ring-zinc-100"
          : "border-zinc-100 hover:shadow-2xl",
      )}
    >
      {/* Accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-1 transition-all duration-500 rounded-t-xl",
          isEditing
            ? "bg-zinc-950 opacity-100"
            : "bg-zinc-950 opacity-0 group-hover:opacity-100",
        )}
      />

      {/* ── AVATAR + IDENTITY ───────────────────────────────────── */}
      <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center border-b border-zinc-100">
        {/* Avatar */}
        <div className="relative group mb-4">
          {profile?.avatarUrl ? (
            <img
              src={getAvatarUrl(profile.avatarUrl)}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover shadow-inner border-4 border-zinc-50 bg-white"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <span className="text-zinc-700 font-semibold text-4xl">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Upload overlay — always available for avatar management */}
          <div className="absolute inset-0 rounded-full bg-zinc-950/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatarMutation.isPending}
              className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center"
              title="Tải ảnh lên"
            >
              {uploadAvatarMutation.isPending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
            {profile?.avatarUrl && (
              <button
                onClick={() => setShowDeleteAvatarConfirm(true)}
                disabled={deleteAvatarMutation.isPending}
                className="w-8 h-8 rounded-xl bg-red-500/60 hover:bg-red-500/80 flex items-center justify-center"
                title="Xóa ảnh"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Name */}
        {!isLoading && displayName !== "—" && (
          <h2 className="text-[20px] font-semibold text-zinc-950 tracking-tight mb-0.5">
            {displayName}
          </h2>
        )}
        <p className="text-xs text-zinc-400 font-medium truncate max-w-full px-2">
          {user.email}
        </p>
        <p className="text-[12px] font-medium text-zinc-400 mt-1 mb-3">
          Người dùng nền tảng
        </p>

        {/* Roles */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {isEditing
            ? Object.values(Role).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={cn(
                    "text-[10px] font-semibold px-3 py-1.5 rounded-xl  tracking-tight border transition-all",
                    roles.includes(role)
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300",
                  )}
                >
                  {role}
                  {roles.includes(role) && (
                    <CheckCircle2 className="w-2.5 h-2.5 inline-block ml-1" />
                  )}
                </button>
              ))
            : user.roles.map((role: string) => (
                <span
                  key={role}
                  className={cn(
                    "text-[10px] font-semibold px-3 py-1.5 rounded-xl  tracking-tight border bg-white text-zinc-500 border-zinc-200",
                  )}
                >
                  {role}
                </span>
              ))}
        </div>
      </div>

      {/* ── ACCOUNT CONTACT ─────────────────────────────────────── */}
      <div className="px-6 py-4 space-y-3 border-b border-zinc-100">
        {/* Email */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-zinc-400 mb-0.5 ml-0.5">
              Email
            </p>
            <p className="text-[15px] font-semibold text-zinc-950 truncate">
              {user.email}
            </p>
          </div>
          {user.emailVerified ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-zinc-400 mb-0.5 ml-0.5">
              Số điện thoại
            </p>
            {isEditing ? (
              <Input
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="h-10 mt-0.5 text-sm font-semibold text-zinc-900 bg-zinc-50/50 border-zinc-100 focus-visible:ring-1 focus-visible:ring-red-600/20 px-3 rounded-xl"
              />
            ) : (
              <p className="text-[15px] font-semibold text-zinc-950">
                {user.phone || "Trống"}
              </p>
            )}
          </div>
          {!isEditing &&
            user.phone &&
            (user.phoneVerified ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ))}
        </div>
      </div>

      {/* ── PROFILE DETAILS ─────────────────────────────────────── */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[18px] font-semibold text-zinc-950 tracking-tight">
            Hồ sơ cá nhân
          </p>
          {!isEditing &&
            (isProfileEditing ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleProfileCancel}
                  className="h-10 px-4 text-[13px] font-semibold text-zinc-500 hover:text-zinc-950 flex items-center gap-2 transition-all rounded-xl hover:bg-zinc-50"
                >
                  <X className="w-4 h-4" /> Hủy
                </button>
                <Button
                  size="sm"
                  onClick={handleProfileSave}
                  disabled={updateMutation.isPending}
                  className="h-10 px-6 text-[14px] rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold transition-all flex items-center gap-2  border-none"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Lưu
                </Button>
              </div>
            ) : (
              <button
                onClick={handleProfileEdit}
                className="h-10 px-4 text-[13px] font-semibold text-red-600 hover:text-red-700 bg-red-50/70 hover:bg-red-100/80 flex items-center gap-2 transition-all rounded-xl border border-red-100/40 shadow-sm shadow-red-600/5 active:scale-95"
              >
                <Edit2 className="w-4 h-4" /> Sửa
              </button>
            ))}
        </div>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-zinc-50 rounded-xl" />
            ))}
          </div>
        ) : isProfileEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <ProfileField label="Họ">
                <Input
                  value={form.lastName || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  placeholder="Nguyễn"
                  className="h-10 rounded-xl border-black/5 bg-white text-sm font-semibold shadow-dash-card focus-visible:ring-0 focus-visible:border-zinc-300 px-4"
                />
              </ProfileField>
              <ProfileField label="Tên">
                <Input
                  value={form.firstName || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  placeholder="Văn A"
                  className="h-10 rounded-xl border-black/5 bg-white text-sm font-semibold shadow-dash-card focus-visible:ring-0 focus-visible:border-zinc-300 px-4"
                />
              </ProfileField>
            </div>
            <ProfileField label="Tên đầy đủ">
              <Input
                value={form.fullName || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="Nguyễn Văn A"
                className="h-10 rounded-xl border-black/5 bg-white text-sm font-semibold shadow-dash-card focus-visible:ring-0 focus-visible:border-zinc-300 px-4"
              />
            </ProfileField>
            <ProfileField label="Giới tính">
              <div className="flex gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        gender: g.value as UserProfileUpdateRequest["gender"],
                      }))
                    }
                    className={cn(
                      "flex-1 h-10 rounded-xl text-[13px] font-semibold border transition-all",
                      form.gender === g.value
                        ? "bg-zinc-950 text-white border-zinc-950 "
                        : "bg-white text-zinc-500 border-black/5 hover:border-zinc-300 shadow-dash-card",
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </ProfileField>
            <ProfileField label="Ngày sinh">
              <DateInput
                value={form.dateOfBirth || ""}
                onChange={(v) => setForm((p) => ({ ...p, dateOfBirth: v }))}
                className="h-10 text-sm px-4 focus:border-zinc-300 focus:ring-0 focus-visible:ring-0 focus-visible:border-zinc-300"
              />
            </ProfileField>
            <ProfileField label="Nghề nghiệp">
              <Input
                value={form.occupation || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, occupation: e.target.value }))
                }
                placeholder="Nhiếp ảnh gia"
                className="h-10 rounded-xl border-black/5 bg-white text-sm font-semibold shadow-dash-card focus-visible:ring-0 focus-visible:border-zinc-300 px-4"
              />
            </ProfileField>
            <ProfileField label="Công ty">
              <Input
                value={form.companyName || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, companyName: e.target.value }))
                }
                placeholder="Studio ABC"
                className="h-10 rounded-xl border-black/5 bg-white text-sm font-semibold shadow-dash-card focus-visible:ring-0 focus-visible:border-zinc-300 px-4"
              />
            </ProfileField>
          </div>
        ) : (
          <div className="space-y-2">
            <ProfileRow
              icon={<Users2 className="w-4 h-4" />}
              label="Giới tính"
              value={
                GENDERS.find((g) => g.value === profile?.gender)?.label || "—"
              }
            />
            <ProfileRow
              icon={<CalendarDays className="w-4 h-4" />}
              label="Ngày sinh"
              value={
                profile?.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                  : "—"
              }
            />
            <ProfileRow
              icon={<Briefcase className="w-4 h-4" />}
              label="Nghề nghiệp"
              value={profile?.occupation || "—"}
            />
            <ProfileRow
              icon={<Building2 className="w-4 h-4" />}
              label="Công ty"
              value={profile?.companyName || "—"}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteAvatarConfirm}
        onOpenChange={setShowDeleteAvatarConfirm}
        title="Xóa ảnh đại diện"
        description="Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại không? Hành động này không thể hoàn tác."
        variant="danger"
        onConfirm={handleDeleteAvatar}
        isLoading={deleteAvatarMutation.isPending}
      />
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function ProfileField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium text-zinc-400 mb-1.5 ml-1">
        {label}
      </p>
      {children}
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50/80 border border-zinc-100/50 hover:bg-white hover:border-zinc-200 hover:shadow-sm transition-all group/row">
      <span className="text-zinc-400 shrink-0 group-hover/row:text-red-500 transition-colors">
        {icon}
      </span>
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
        <span className="text-[14px] font-medium text-zinc-400 shrink-0">
          {label}
        </span>
        <span className="text-[15px] font-semibold text-zinc-700 truncate">
          {value}
        </span>
      </div>
    </div>
  );
}
