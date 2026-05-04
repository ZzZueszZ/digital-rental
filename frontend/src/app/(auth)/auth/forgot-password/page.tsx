"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ArrowRight, KeyRound, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Routers from "@/constants/routers";
import { authService } from "@/services/auth";
// Step 1: Email schema
const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

// Step 2: New password schema
const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

// ── OTP Input Component ──────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = value.split("");
    arr[index] = char;
    const next = arr.join("").slice(0, OTP_LENGTH);
    onChange(next);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-12 rounded-lg border border-black/5 bg-white text-center text-xl font-bold text-zinc-900 outline-none transition-all shadow-dash-card focus:border-red-600 focus:ring-1 focus:ring-red-600/30"
        />
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1 form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // Step 2 form
  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // ── Countdown timer ──
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // ── Step 1: send OTP ──
  const handleSendOtp = async (values: EmailFormValues) => {
    try {
      const res = await authService.forgotPassword({ email: values.email });
      if (res.data.success) {
        toast.success("Mã OTP đã được gửi đến email của bạn");
        setEmail(values.email);
        setStep(2);
        setCountdown(COUNTDOWN_SECONDS);
      } else {
        toast.error(res.data.message || "Không thể gửi OTP");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      );
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return;
    try {
      const res = await authService.forgotPassword({ email });
      if (res.data.success) {
        toast.success("Đã gửi lại mã OTP");
        setCountdown(COUNTDOWN_SECONDS);
        setOtp("");
      } else {
        toast.error(res.data.message || "Không thể gửi lại OTP");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  }, [countdown, email]);

  // ── Step 2: reset password ──
  const handleResetPassword = async (values: ResetFormValues) => {
    if (otp.length < OTP_LENGTH) {
      toast.error("Vui lòng nhập đầy đủ mã OTP");
      return;
    }
    try {
      const res = await authService.resetPassword({
        email,
        otpCode: otp,
        newPassword: values.newPassword,
      });
      if (res.data.success) {
        toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
        router.push(Routers.LOGIN);
      } else {
        toast.error(res.data.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-1000 bg-zinc-50">
      {/* Top Navigation */}
      <div className="px-8 py-6 flex items-center relative z-10">
        <Link href={Routers.LOGIN}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-lg h-10 w-10 border-black/5 bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-red-600 shadow-dash-card transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <main className="flex-1 flex items-center px-8 pb-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* ── Left: Hero ── */}
          <div className="hidden lg:flex flex-col items-start justify-center relative pl-8">
            <div className="space-y-3 mb-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
                {step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"}
              </h1>
              <p className="text-lg md:text-xl text-zinc-500 font-medium">
                {step === 1
                  ? "Nhập email để nhận mã xác thực"
                  : "Nhập mã OTP và mật khẩu mới"}
              </p>
            </div>
            <div className="relative w-full max-w-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/images/auth-login-hero.png"
                alt="Reset password illustration"
                width={600}
                height={500}
                className="w-full h-auto object-contain scale-[1.05]"
                priority
              />
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {step === 1 ? (
              /* ===== STEP 1: Enter Email ===== */
              <div>
                {/* Mobile heading */}
                <div className="lg:hidden space-y-3 mb-10 text-center">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
                    Quên mật khẩu?
                  </h1>
                  <p className="text-base text-zinc-500 font-medium">
                    Nhập email để nhận mã xác thực OTP
                  </p>
                </div>

                <form
                  onSubmit={emailForm.handleSubmit(handleSendOtp)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-900">
                      Email
                    </label>
                    <Input
                      placeholder="Nhập địa chỉ email của bạn"
                      type="email"
                      {...emailForm.register("email")}
                      className={`h-12 bg-white border-black/5 rounded-lg focus-visible:ring-1 focus-visible:ring-red-600/30 focus-visible:border-red-600/30 caret-red-600 text-zinc-900 text-sm px-5 shadow-dash-card ${emailForm.formState.errors.email ? "border-red-500 ring-red-500" : ""}`}
                    />
                    {emailForm.formState.errors.email && (
                      <p className="text-xs text-error font-medium">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-red-600 shadow-dash-card transition-all active:scale-95 gap-2 mt-2"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting ? (
                      "Đang gửi..."
                    ) : (
                      <>
                        Gửi mã OTP
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-10 text-center text-sm text-zinc-500">
                  Nhớ mật khẩu?{" "}
                  <Link
                    href={Routers.LOGIN}
                    className="text-red-600  hover:text-red-700 transition-all ml-1 font-bold"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            ) : (
              /* ===== STEP 2: OTP + New Password ===== */
              <div>
                {/* Mobile heading */}
                <div className="lg:hidden space-y-3 mb-10 text-center">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
                    Đặt lại mật khẩu
                  </h1>
                </div>

                {/* OTP info */}
                <div className="mb-10">
                  <h2 className="text-2xl font-bold text-zinc-900 hidden lg:block mb-2">
                    Đã gửi mã OTP
                  </h2>
                  <p className="text-base text-zinc-500 font-medium">
                    Nhập mã xác thực đã gửi đến{" "}
                    <span className="font-bold text-zinc-950">{email}</span>
                    <button
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                      }}
                      className="text-red-600 font-bold ml-2 hover:text-red-700 transition-colors"
                    >
                      Sửa
                    </button>
                  </p>
                </div>

                <form
                  onSubmit={resetForm.handleSubmit(handleResetPassword)}
                  className="space-y-4"
                >
                  {/* OTP Boxes */}
                  <div className="space-y-4">
                    <OtpInput value={otp} onChange={setOtp} />

                    {/* Resend row */}
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-zinc-500">
                        Không nhận được mã?{" "}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={countdown > 0}
                          className={`font-bold transition-colors ${
                            countdown > 0
                              ? "text-zinc-300 cursor-not-allowed"
                              : "text-red-600 hover:text-red-700"
                          }`}
                        >
                          Gửi lại
                        </button>
                      </span>
                      {countdown > 0 && (
                        <span className="flex items-center gap-1.5 text-zinc-400 tabular-nums text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          {countdown}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* New password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-900">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Tối thiểu 6 ký tự"
                        {...resetForm.register("newPassword")}
                        className={`h-12 bg-white border-black/5 rounded-lg focus-visible:ring-1 focus-visible:ring-red-600/30 focus-visible:border-red-600/30 caret-red-600 text-zinc-900 text-sm px-5 pr-12 shadow-dash-card ${resetForm.formState.errors.newPassword ? "border-red-500 ring-red-500" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition"
                      >
                        {showNewPassword ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                    {resetForm.formState.errors.newPassword && (
                      <p className="text-xs text-error font-medium">
                        {resetForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-900">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu mới"
                        {...resetForm.register("confirmPassword")}
                        className={`h-12 bg-white border-black/5 rounded-lg focus-visible:ring-1 focus-visible:ring-red-600/30 focus-visible:border-red-600/30 caret-red-600 text-zinc-900 text-sm px-5 pr-12 shadow-dash-card ${resetForm.formState.errors.confirmPassword ? "border-red-500 ring-red-500" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                    {resetForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-error font-medium">
                        {resetForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-12 mt-4 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-red-600 shadow-dash-card transition-all active:scale-95 gap-2"
                    disabled={resetForm.formState.isSubmitting}
                  >
                    {resetForm.formState.isSubmitting ? (
                      "Đang xử lý..."
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Đặt lại mật khẩu
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-10 text-center text-sm text-zinc-500">
                  Nhớ mật khẩu?{" "}
                  <Link
                    href={Routers.LOGIN}
                    className="text-red-600  hover:text-red-700 transition-all ml-1 font-bold"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
