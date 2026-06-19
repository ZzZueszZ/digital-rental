"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Routers from "@/constants/routers";
import { authService } from "@/services/auth";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    otpCode: "",
    newPassword: "",
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword(form);
      if (response.data.success) {
        toast.success(
          response.data.message || "Thiết lập mật khẩu thành công.",
        );
        router.push(Routers.LOGIN);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Xác thực không thành công.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      title="Thiết lập mật khẩu mới."
      description="Sử dụng mã OTP đã nhận để khôi phục quyền truy cập vào tài khoản."
      backHref={Routers.LOGIN}
      backLabel="Quay lại đăng nhập"
    >
      <div className="mb-7">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <KeyRound className="h-5 w-5" />
        </div>
        <p className="mb-2 text-sm font-medium text-red-600">
          Khôi phục tài khoản
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
          Cập nhật mật khẩu
        </h2>
        <p className="mt-2 text-sm font-normal leading-6 text-zinc-500">
          Nhập email, mã OTP và mật khẩu mới của bạn.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-normal text-zinc-600">
            Email
          </label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            className="h-10 rounded-xl border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-normal text-zinc-600">
            Mã xác thực OTP
          </label>
          <Input
            inputMode="numeric"
            placeholder="6 chữ số"
            value={form.otpCode}
            onChange={(event) =>
              setForm({ ...form, otpCode: event.target.value })
            }
            className="h-10 rounded-xl border-zinc-200 bg-white px-3 text-sm font-medium tracking-wide text-zinc-900 shadow-none placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-normal text-zinc-600">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
              value={form.newPassword}
              onChange={(event) =>
                setForm({ ...form, newPassword: event.target.value })
              }
              className="h-10 rounded-xl border-zinc-200 bg-white px-3 pr-10 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-900"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting || !form.email || !form.otpCode || !form.newPassword
          }
          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span style={{ color: "#ffffff" }}>
            {isSubmitting ? "Đang cập nhật..." : "Hoàn tất thiết lập"}
          </span>
        </button>

        <p className="pt-1 text-center text-sm font-normal text-zinc-500">
          <Link href={Routers.LOGIN} className="font-medium text-red-600">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
