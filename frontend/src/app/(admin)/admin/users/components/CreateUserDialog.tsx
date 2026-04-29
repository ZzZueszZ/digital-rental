"use client";

import { useState } from "react";
import { X, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateUser } from "@/services/user";
import type { UserCreateRequest } from "@/types/user";

const ROLES = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "STAFF", label: "Staff" },
];

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const createMutation = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<UserCreateRequest & { password: string }>({
    email: "",
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
    roles: ["CUSTOMER"],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "Email là bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không hợp lệ";
    if (!form.password) errs.password = "Mật khẩu là bắt buộc";
    else if (form.password.length < 6)
      errs.password = "Mật khẩu tối thiểu 6 ký tự";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await createMutation.mutateAsync(form);
      toast.success("Tạo tài khoản thành công! Email kích hoạt đã được gửi.");
      onOpenChange(false);
      setForm({
        email: "",
        phone: "",
        password: "",
        firstName: "",
        lastName: "",
        roles: ["CUSTOMER"],
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles?.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...(prev.roles || []), role],
    }));
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Top accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-rose-500" />

          {/* Header */}
          <div className="px-6 pt-7 pb-5 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-zinc-950 tracking-tight">
                    Tạo tài khoản mới
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    Email kích hoạt sẽ được gửi tự động
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">
                  Họ
                </label>
                <Input
                  placeholder="Nguyễn"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-900 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">
                  Tên
                </label>
                <Input
                  placeholder="Văn A"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-900 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">
                Email *
              </label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => {
                  setForm((p) => ({ ...p, email: e.target.value }));
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                className={cn(
                  "h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900",
                  errors.email
                    ? "border-red-400 focus:ring-red-400/20"
                    : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20",
                )}
              />
              {errors.email && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">
                Số điện thoại
              </label>
              <Input
                placeholder="0376xxxxxx"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-900 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">
                Mật khẩu *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, password: e.target.value }));
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  className={cn(
                    "h-10 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 pr-10",
                    errors.password
                      ? "border-red-400 focus:ring-red-400/20"
                      : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Roles */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 block">
                Phân quyền
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => {
                  const selected = form.roles?.includes(role.value);
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => toggleRole(role.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-all duration-200",
                        selected
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-400",
                      )}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-10 rounded-xl border border-zinc-200 bg-white text-zinc-600 font-bold text-sm hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
              >
                Hủy
              </button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 h-10 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-bold text-sm transition-all duration-300"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tạo tài khoản
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
