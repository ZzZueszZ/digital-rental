"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Routers from "@/constants/routers";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthStatusCard } from "@/components/auth/AuthStatusCard";

export default function ActivationSuccessPage() {
  return (
    <AuthPageShell
      title="Tài khoản đã sẵn sàng."
      description="Bạn có thể đăng nhập để khám phá thiết bị, quản lý đơn hàng và hoàn thiện hồ sơ thuê."
      backHref={Routers.LOGIN}
      backLabel="Đến trang đăng nhập"
    >
      <AuthStatusCard
        icon={<CheckCircle2 className="h-5 w-5" />}
        eyebrow="Kích hoạt thành công"
        title="Chào mừng bạn đến Digital Rental"
        description="Email của bạn đã được xác thực. Tài khoản hiện đã có thể sử dụng."
      >
        <Link
          href={Routers.LOGIN}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <span style={{ color: "#ffffff" }}>Đăng nhập ngay</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </AuthStatusCard>
    </AuthPageShell>
  );
}
