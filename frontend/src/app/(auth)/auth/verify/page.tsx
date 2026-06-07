"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import Routers from "@/constants/routers";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthStatusCard } from "@/components/auth/AuthStatusCard";

export default function VerifyPage() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (canResend) return;
    const timer = setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [canResend]);

  return (
    <AuthPageShell
      title="Chỉ còn một bước xác thực."
      description="Kiểm tra hộp thư để hoàn tất đăng ký và bảo vệ tài khoản của bạn."
      backHref={Routers.LOGIN}
      backLabel="Quay lại đăng nhập"
    >
      <AuthStatusCard
        icon={<Mail className="h-5 w-5" />}
        eyebrow="Xác thực email"
        title="Kiểm tra hộp thư của bạn"
        description="Chúng tôi đã gửi liên kết kích hoạt đến email đăng ký. Hãy mở email và làm theo hướng dẫn."
      >
        <button
          type="button"
          disabled={!canResend}
          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200"
        >
          <span style={{ color: canResend ? "#ffffff" : "#71717a" }}>
            {canResend ? "Gửi lại email xác thực" : `Có thể gửi lại sau ${countdown}s`}
          </span>
        </button>
        <p className="mt-5 text-center text-sm font-normal text-zinc-500">
          Đã kích hoạt?{" "}
          <Link href={Routers.LOGIN} className="font-medium text-red-600">
            Đăng nhập
          </Link>
        </p>
      </AuthStatusCard>
    </AuthPageShell>
  );
}
