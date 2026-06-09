"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import Routers from "@/constants/routers";
import { authService } from "@/services/auth";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

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

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const values = value.split("");
    values[index] = char;
    const nextValue = values.join("").slice(0, OTP_LENGTH);
    onChange(nextValue);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div
      className="flex w-full flex-nowrap items-center justify-between gap-2"
      role="group"
      aria-label="Mã xác thực OTP gồm 6 chữ số"
    >
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index] && index > 0) {
              inputRefs.current[index - 1]?.focus();
            }
          }}
          onPaste={handlePaste}
          className="h-11 w-11 min-w-0 flex-none rounded-xl border border-zinc-200 bg-white p-0 text-center text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-400 sm:h-12 sm:w-12"
          aria-label={`Số OTP ${index + 1}`}
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (values: EmailFormValues) => {
    try {
      const response = await authService.forgotPassword({ email: values.email });
      if (response.data.success) {
        toast.success("Mã OTP đã được gửi đến email của bạn");
        setEmail(values.email);
        setStep(2);
        setCountdown(COUNTDOWN_SECONDS);
      } else {
        toast.error(response.data.message || "Không thể gửi OTP");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      );
    }
  };

  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return;
    try {
      const response = await authService.forgotPassword({ email });
      if (response.data.success) {
        toast.success("Đã gửi lại mã OTP");
        setCountdown(COUNTDOWN_SECONDS);
        setOtp("");
      } else {
        toast.error(response.data.message || "Không thể gửi lại OTP");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  }, [countdown, email]);

  const handleResetPassword = async (values: ResetFormValues) => {
    if (otp.length < OTP_LENGTH) {
      toast.error("Vui lòng nhập đầy đủ mã OTP");
      return;
    }
    try {
      const response = await authService.resetPassword({
        email,
        otpCode: otp,
        newPassword: values.newPassword,
      });
      if (response.data.success) {
        toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
        router.push(Routers.LOGIN);
      } else {
        toast.error(response.data.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      );
    }
  };

  return (
    <AuthPageShell
      title={step === 1 ? "Khôi phục tài khoản." : "Tạo mật khẩu mới."}
      description={
        step === 1
          ? "Nhập email đăng ký để nhận mã xác thực OTP."
          : "Xác nhận mã OTP và đặt một mật khẩu mới cho tài khoản."
      }
      backHref={Routers.LOGIN}
      backLabel="Quay lại đăng nhập"
    >
      <div className="mb-7">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
          {step === 1 ? (
            <Mail className="h-5 w-5" />
          ) : (
            <KeyRound className="h-5 w-5" />
          )}
        </div>
        <p className="mb-2 text-sm font-medium text-red-600">
          {step === 1 ? "Quên mật khẩu" : "Xác nhận OTP"}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
          {step === 1 ? "Nhận mã khôi phục" : "Đặt lại mật khẩu"}
        </h2>
        <p className="mt-2 text-sm font-normal leading-6 text-zinc-500">
          {step === 1
            ? "Chúng tôi sẽ gửi mã gồm 6 chữ số đến email của bạn."
            : `Mã xác thực đã được gửi đến ${email}.`}
        </p>
      </div>

      {step === 1 ? (
        <form
          onSubmit={emailForm.handleSubmit(handleSendOtp)}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-normal text-zinc-600">
              Email
            </label>
            <Input
              type="email"
              placeholder="email@example.com"
              {...emailForm.register("email")}
              className={`h-10 rounded-xl border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0 ${emailForm.formState.errors.email ? "border-red-500" : ""}`}
            />
            {emailForm.formState.errors.email && (
              <p className="mt-1 text-xs font-normal text-red-600">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={emailForm.formState.isSubmitting}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            <span style={{ color: "#ffffff" }}>
              {emailForm.formState.isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
            </span>
            {!emailForm.formState.isSubmitting && (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </form>
      ) : (
        <form
          onSubmit={resetForm.handleSubmit(handleResetPassword)}
          className="space-y-4"
        >
          <OtpInput value={otp} onChange={setOtp} />
          <div className="flex items-center justify-between text-xs font-normal">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
              className="text-zinc-500 hover:text-zinc-900"
            >
              Đổi email
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0}
              className="font-medium text-red-600 disabled:text-zinc-300"
            >
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
            </button>
          </div>

          {[
            {
              label: "Mật khẩu mới",
              name: "newPassword" as const,
              visible: showNewPassword,
              toggle: () => setShowNewPassword((value) => !value),
            },
            {
              label: "Xác nhận mật khẩu",
              name: "confirmPassword" as const,
              visible: showConfirmPassword,
              toggle: () => setShowConfirmPassword((value) => !value),
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                {field.label}
              </label>
              <div className="relative">
                <Input
                  type={field.visible ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  {...resetForm.register(field.name)}
                  className={`h-10 rounded-xl border-zinc-200 bg-white px-3 pr-10 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0 ${resetForm.formState.errors[field.name] ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={field.toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                >
                  {field.visible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {resetForm.formState.errors[field.name] && (
                <p className="mt-1 text-xs font-normal text-red-600">
                  {resetForm.formState.errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={resetForm.formState.isSubmitting}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            <span style={{ color: "#ffffff" }}>
              {resetForm.formState.isSubmitting
                ? "Đang xử lý..."
                : "Đặt lại mật khẩu"}
            </span>
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm font-normal text-zinc-500">
        Nhớ mật khẩu?{" "}
        <Link href={Routers.LOGIN} className="font-medium text-red-600">
          Đăng nhập
        </Link>
      </p>
    </AuthPageShell>
  );
}
