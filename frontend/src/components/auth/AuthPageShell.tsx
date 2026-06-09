"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2 } from "lucide-react";
import Routers from "@/constants/routers";

interface AuthPageShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  backHref?: string;
  backLabel?: string;
  badge?: string;
}

export function AuthPageShell({
  children,
  title,
  description,
  imageSrc = "/images/auth-login-hero.png",
  imageAlt = "Thiết bị hình ảnh chuyên nghiệp",
  backHref = Routers.HOME,
  backLabel = "Quay lại trang chủ",
  badge = "Tài khoản Digital Rental",
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-zinc-50/70 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-[1320px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-5 md:px-7">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-950">
              Digital<span className="text-red-600">Rental</span>
            </span>
          </Link>

          <Link
            href={backHref}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-normal text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
        </header>

        <div className="grid flex-1 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden border-r border-zinc-200 bg-zinc-50/70 p-7 lg:flex lg:flex-col">
            <div className="mb-6 max-w-lg">
              <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-normal text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                {badge}
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-950">
                {title}
              </h1>
              <p className="mt-3 max-w-md text-sm font-normal leading-6 text-zinc-500">
                {description}
              </p>
            </div>

            <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-contain p-8"
                priority
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {["Bảo mật tài khoản", "Quản lý đơn hàng", "Hỗ trợ nhanh"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="text-xs font-normal text-zinc-600">
                      {item}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}

