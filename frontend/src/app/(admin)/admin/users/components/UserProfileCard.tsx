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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  useAdminUserProfile,
  useUpdateAdminUserProfile,
  useUploadAdminUserAvatar,
  useDeleteAdminUserAvatar,
} from "@/services/profile";
import { Role, type UserResponse, type UserProfileUpdateRequest } from "@/types/user";

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
  "from-red-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-fuchsia-600",
];

const GENDERS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const BASE_URL = "http://localhost:8080";

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

  const avatarGradient = AVATAR_COLORS[(userId || 0) % AVATAR_COLORS.length];
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
      if (form.fullName !== undefined) payload.fullName = form.fullName || undefined;
      if (form.firstName !== undefined) payload.firstName = form.firstName || undefined;
      if (form.lastName !== undefined) payload.lastName = form.lastName || undefined;
      if (form.gender) payload.gender = form.gender;
      if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
      if (form.occupation !== undefined) payload.occupation = form.occupation || undefined;
      if (form.companyName !== undefined) payload.companyName = form.companyName || undefined;
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
    if (file.size > 5 * 1024 * 1024) { toast.error("Ảnh tối đa 5MB"); return; }
    try {
      await uploadAvatarMutation.mutateAsync(file);
      toast.success("Đã cập nhật ảnh đại diện");
    } catch { toast.error("Không thể tải lên ảnh"); }
    e.target.value = "";
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatarMutation.mutateAsync();
      toast.success("Đã xóa ảnh đại diện");
      setShowDeleteAvatarConfirm(false);
    } catch { toast.error("Không thể xóa ảnh"); }
  };

  const toggleRole = (role: string) => {
    onRolesChange(
      roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
      {/* Accent line */}
      <div className={cn("h-1 bg-gradient-to-r from-red-600 to-rose-500", isEditing && "opacity-100")} />

      {/* ── AVATAR + IDENTITY ───────────────────────────────────── */}
      <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center border-b border-zinc-100">
        {/* Avatar */}
        <div className="relative group mb-4">
          {profile?.avatarUrl ? (
            <img
              src={getAvatarUrl(profile.avatarUrl)}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover shadow-sm border border-zinc-100"
            />
          ) : (
            <div className={cn("w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center shadow-sm", avatarGradient)}>
              <span className="text-white font-black text-4xl">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Upload overlay — always available for avatar management */}
          <div className="absolute inset-0 rounded-full bg-zinc-950/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatarMutation.isPending}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"
              title="Tải ảnh lên"
            >
              {uploadAvatarMutation.isPending
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Camera className="w-4 h-4 text-white" />}
            </button>
            {profile?.avatarUrl && (
              <button
                onClick={() => setShowDeleteAvatarConfirm(true)}
                disabled={deleteAvatarMutation.isPending}
                className="w-8 h-8 rounded-lg bg-red-500/60 hover:bg-red-500/80 flex items-center justify-center"
                title="Xóa ảnh"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>

        {/* Name */}
        {!isLoading && displayName !== "—" && (
          <h2 className="text-lg font-black text-zinc-950 tracking-tight mb-0.5">{displayName}</h2>
        )}
        <p className="text-xs text-zinc-400 font-medium truncate max-w-full px-2">{user.email}</p>
        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mt-1 mb-3">
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
                    "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest border transition-all",
                    roles.includes(role)
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  {role}
                  {roles.includes(role) && <CheckCircle2 className="w-2.5 h-2.5 inline-block ml-0.5" />}
                </button>
              ))
            : user.roles.map((role: string) => (
                <span
                  key={role}
                  className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border",
                    role === "ADMIN" || role === "SUPER_ADMIN"
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200"
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
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Email</p>
            <p className="text-sm font-bold text-zinc-900 truncate">{user.email}</p>
          </div>
          {user.emailVerified
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">SĐT</p>
            {isEditing ? (
              <Input
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="h-8 mt-0.5 text-sm text-zinc-900 bg-zinc-50 border-zinc-200 focus-visible:ring-1 focus-visible:ring-red-600 px-2 rounded-lg"
              />
            ) : (
              <p className="text-sm font-bold text-zinc-900">{user.phone || "Trống"}</p>
            )}
          </div>
          {!isEditing && user.phone && (user.phoneVerified
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />)}
        </div>
      </div>

      {/* ── PROFILE DETAILS ─────────────────────────────────────── */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Hồ sơ cá nhân</p>
          {!isEditing && (
            isProfileEditing ? (
              <div className="flex gap-2">
                <button onClick={handleProfileCancel} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Hủy
                </button>
                <Button size="sm" onClick={handleProfileSave} disabled={updateMutation.isPending}
                  className="h-6 px-2.5 text-[10px] rounded-lg bg-zinc-950 hover:bg-red-600 text-white font-bold transition-all">
                  {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  <span className="ml-1">Lưu</span>
                </Button>
              </div>
            ) : (
              <button onClick={handleProfileEdit} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors">
                <Edit2 className="w-3 h-3" /> Sửa
              </button>
            )
          )}
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
                <Input value={form.lastName || ""} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Nguyễn"
                  className="h-8 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
              </ProfileField>
              <ProfileField label="Tên">
                <Input value={form.firstName || ""} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="Văn A"
                  className="h-8 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
              </ProfileField>
            </div>
            <ProfileField label="Tên đầy đủ">
              <Input value={form.fullName || ""} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Nguyễn Văn A"
                className="h-8 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
            </ProfileField>
            <ProfileField label="Giới tính">
              <div className="flex gap-1.5">
                {GENDERS.map((g) => (
                  <button key={g.value} type="button"
                    onClick={() => setForm((p) => ({ ...p, gender: g.value as UserProfileUpdateRequest["gender"] }))}
                    className={cn("flex-1 h-8 rounded-lg text-[11px] font-bold border transition-all",
                      form.gender === g.value ? "bg-zinc-950 text-white border-zinc-950" : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-400")}>
                    {g.label}
                  </button>
                ))}
              </div>
            </ProfileField>
            <ProfileField label="Ngày sinh">
              <Input type="date" value={form.dateOfBirth || ""} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="h-8 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
            </ProfileField>
            <ProfileField label="Nghề nghiệp">
              <Input value={form.occupation || ""} onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))} placeholder="Nhiếp ảnh gia"
                className="h-8 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
            </ProfileField>
            <ProfileField label="Công ty">
              <Input value={form.companyName || ""} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} placeholder="Studio ABC"
                className="h-8 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
            </ProfileField>
          </div>
        ) : (
          <div className="space-y-2">
            <ProfileRow icon={<Users2 className="w-3.5 h-3.5" />} label="Giới tính"
              value={GENDERS.find((g) => g.value === profile?.gender)?.label || "—"} />
            <ProfileRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Ngày sinh"
              value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN") : "—"} />
            <ProfileRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Nghề nghiệp"
              value={profile?.occupation || "—"} />
            <ProfileRow icon={<Building2 className="w-3.5 h-3.5" />} label="Công ty"
              value={profile?.companyName || "—"} />
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

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">{label}</p>
      {children}
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-50/80 border border-zinc-100">
      <span className="text-zinc-400 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest shrink-0">{label}</span>
        <span className="text-xs font-semibold text-zinc-700 truncate">{value}</span>
      </div>
    </div>
  );
}
