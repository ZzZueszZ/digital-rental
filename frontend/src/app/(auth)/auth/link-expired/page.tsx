"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Routers from "@/constants/routers";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthStatusCard } from "@/components/auth/AuthStatusCard";

export default function LinkExpiredPage() {
  return (
    <AuthPageShell
      title="Khôi phục quyền truy cập."
      description="Yêu cầu một liên kết mới để tiếp tục xác thực tài khoản Digital Rental."
      backHref={Routers.LOGIN}
      backLabel="Quay lại đăng nhập"
    >
      <AuthStatusCard
        icon={<AlertCircle className="h-5 w-5" />}
        eyebrow="Liên kết hết hạn"
        title="Yêu cầu liên kết mới"
        description="Liên kết xác thực hiện không còn hiệu lực. Nhập email để nhận lại hướng dẫn."
      >
        <label className="mb-1.5 block text-xs font-normal text-zinc-600">
          Email của bạn
        </label>
        <Input
          type="email"
          placeholder="email@example.com"
          className="h-10 rounded-xl border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
        />
        <button
          type="button"
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <span style={{ color: "#ffffff" }}>Gửi lại liên kết kích hoạt</span>
        </button>
        <p className="mt-5 text-center text-sm font-normal text-zinc-500">
          <Link href={Routers.LOGIN} className="font-medium text-red-600">
            Quay lại đăng nhập
          </Link>
        </p>
      </AuthStatusCard>
    </AuthPageShell>
  );
}
