"use client";

import { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateUser } from "@/services/user";
import type { UserCreateRequest } from "@/types/user";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";

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

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={UserPlus}
      iconClassName="bg-gradient-to-br from-red-500 to-rose-600 text-white"
      title="Tạo tài khoản mới"
      description="Email kích hoạt sẽ được gửi tự động"
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      submitText="Tạo tài khoản"
      submitIcon={UserPlus}
    >
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
              : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
          )}
        />
        {errors.email && (
          <p className="text-[11px] text-red-500 font-medium mt-1">
            {errors.email}
          </p>
        )}
      </div>

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
                : "border-zinc-200 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
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
                    : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-400"
                )}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </div>
    </AdminFormDialog>
  );
}

