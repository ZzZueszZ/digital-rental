"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterRequest } from "@/schemas/auth/register";
import { authService } from "@/services/auth";
import Routers from "@/constants/routers";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterRequest) => {
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      };

      const res = await authService.register(payload);
      toast.success(
        res.data.message || "Đăng ký thành công, vui lòng kiểm tra email",
      );
      router.push(Routers.VERIFY);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
      {/* Header for Mobile only */}
      <div className="lg:hidden space-y-2 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
          Tạo tài khoản
        </h1>
        <p className="text-sm font-medium text-zinc-500">
          Bắt đầu hành trình sáng tạo của bạn
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-900">Họ và tên</label>
          <Input
            placeholder="Nhập họ và tên của bạn"
            {...register("fullName")}
            className={`h-12 bg-white border-black/5 rounded-xl focus-visible:ring-1 focus-visible:ring-red-600/30 focus-visible:border-red-600/30 caret-red-600 text-zinc-900 text-sm px-5 shadow-dash-card placeholder:text-zinc-400 ${errors.fullName ? "border-red-500 ring-red-500" : ""}`}
          />
          {errors.fullName && (
            <p className="text-xs text-error font-medium">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-900">Email</label>
          <Input
            placeholder="Nhập địa chỉ email của bạn"
            type="email"
            {...register("email")}
            className={`h-12 bg-white border-black/5 rounded-xl focus-visible:ring-1 focus-visible:ring-red-600/30 focus-visible:border-red-600/30 caret-red-600 text-zinc-900 text-sm px-5 shadow-dash-card placeholder:text-zinc-400 ${errors.email ? "border-red-500 ring-red-500" : ""}`}
          />
          {errors.email && (
            <p className="text-xs text-error font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-900">Mật khẩu</label>
          <div className="relative">
            <Input
              placeholder="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`h-12 bg-white border-black/5 rounded-xl focus-visible:ring-1 focus-visible:ring-red-600/30 focus-visible:border-red-600/30 caret-red-600 text-zinc-900 text-sm px-5 pr-12 shadow-dash-card placeholder:text-zinc-400 ${errors.password ? "border-red-500 ring-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-error font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-900">
            Xác nhận mật khẩu
          </label>
          <Input
            placeholder="Nhập lại mật khẩu"
            type="password"
            {...register("confirmPassword")}
            className={`h-12 bg-white border-black/5 rounded-xl focus-visible:ring-1 focus-visible:ring-red-600/30 focus-visible:border-red-600/30 caret-red-600 text-zinc-900 text-sm px-5 shadow-dash-card placeholder:text-zinc-400 ${errors.confirmPassword ? "border-red-500 ring-red-500" : ""}`}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-error font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          className="w-full h-12 text-sm font-bold bg-zinc-900 text-white rounded-xl hover:bg-red-600 shadow-dash-card transition-all active:scale-95 mt-2"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative mt-8 mb-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/5"></div>
        </div>
        <span className="relative bg-zinc-50 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Hoặc
        </span>
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <Button className="w-full h-12 justify-center gap-3 rounded-xl bg-white border border-black/5 text-zinc-900 font-bold text-sm hover:bg-zinc-50 transition-all shadow-dash-card hover:shadow-sm">
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            width={18}
            height={18}
            alt="Google"
          />
          Đăng ký với Google
        </Button>
        <Button className="w-full h-12 justify-center gap-3 rounded-xl bg-white border border-black/5 text-zinc-900 font-bold text-sm hover:bg-zinc-50 transition-all shadow-dash-card hover:shadow-sm">
          <svg
            className="w-5 h-5 fill-current text-[#1877F2]"
            viewBox="0 0 24 24"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Đăng ký với Facebook
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Đã có tài khoản?{" "}
        <Link
          href={Routers.LOGIN}
          className="text-red-600 hover:text-red-700 transition-all ml-1 font-bold"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
