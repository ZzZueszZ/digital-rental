"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Routers from "@/constants/routers";
import { authService } from "@/services/auth";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    otpCode: "",
    newPassword: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(form);
      if (res.data.success) {
        toast.success(res.data.message || "Thiết lập mật mã thành công.");
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
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-8 overflow-hidden relative">
      <div className="absolute -top-1/4 -right-1/4 w-[1200px] h-[1200px] bg-indigo-500/5 rounded-full blur-[250px] pointer-events-none" />

      <div className="w-full max-w-xl bg-white border border-black/5 rounded-xl p-10 flex flex-col space-y-8 shadow-dash-card relative z-10">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-zinc-50 border border-black/5 mb-2 relative overflow-hidden shadow-sm">
            <KeyRound className="w-10 h-10 text-red-600 relative z-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
              Cập nhật mật khẩu
            </h1>
            <p className="text-zinc-500 font-medium text-base max-w-sm mx-auto leading-relaxed">
              Nhập mã OTP đã nhận được và thiết lập mật mã mới cho tài khoản của
              bạn.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Identity & OTP Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900 ml-1">
                Tài khoản (Email)
              </label>
              <Input
                placeholder="Nhập email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 bg-white border-black/5 rounded-xl px-5 text-zinc-900 placeholder:text-zinc-400 transition-all focus-visible:ring-1 focus-visible:ring-red-600/30 shadow-dash-card"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900 ml-1">
                Mã xác thực (OTP)
              </label>
              <Input
                placeholder="6 chữ số"
                value={form.otpCode}
                onChange={(e) => setForm({ ...form, otpCode: e.target.value })}
                className="h-12 bg-white border-black/5 rounded-xl px-5 text-zinc-900 text-center font-bold tracking-[0.2em] focus-visible:ring-1 focus-visible:ring-red-600/30 shadow-dash-card placeholder:text-zinc-400"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-900 ml-1">
              Mật mã mới
            </label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật mã mới"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                className="h-12 bg-white border-black/5 rounded-xl px-5 pr-14 text-zinc-900 placeholder:text-zinc-400 transition-all focus-visible:ring-1 focus-visible:ring-red-600/30 shadow-dash-card"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !form.email ||
                !form.otpCode ||
                !form.newPassword
              }
              className="w-full h-12 text-sm font-bold bg-zinc-900 text-white rounded-xl hover:bg-red-600 shadow-dash-card transition-all active:scale-[0.95] disabled:opacity-30"
            >
              {isSubmitting ? "Đang cập nhật..." : "Hoàn tất thiết lập"}
            </Button>

            <div className="flex justify-center">
              <Link
                href={Routers.LOGIN}
                className="group flex items-center gap-3 text-zinc-500 hover:text-zinc-900 transition-all font-bold text-sm"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </form>
      </div>

      <div className="absolute bottom-12 w-full text-center opacity-40">
        <p className="text-[10px] font-bold text-zinc-400">
          LensHub • Studio Visuals
        </p>
      </div>
    </main>
  );
}
