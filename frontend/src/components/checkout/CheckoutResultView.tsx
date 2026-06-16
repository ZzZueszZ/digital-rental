"use client";

import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CheckoutResultStatus = "success" | "error" | "loading";

type CheckoutResultViewProps = {
  status: CheckoutResultStatus;
  title: string;
  description: string;
  code?: string | null;
  codeLabel: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function CheckoutResultView({
  status,
  title,
  description,
  code,
  codeLabel,
  primaryLabel,
  primaryHref,
  secondaryLabel = "Về trang chủ",
  secondaryHref = "/",
}: CheckoutResultViewProps) {
  const router = useRouter();
  const isSuccess = status === "success";
  const isLoading = status === "loading";

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 sm:py-16 flex items-center justify-center">
      <section className="w-full max-w-[560px]">
        <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-50 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-52 w-52 rounded-full bg-zinc-100 blur-3xl" />

          <div className="relative p-6 sm:p-8 md:p-10">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm",
                  isLoading
                    ? "border-zinc-200 bg-zinc-50 text-zinc-500"
                    : isSuccess
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-red-100 bg-red-50 text-red-600",
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <AlertCircle className="h-8 w-8" />
                )}
              </div>

              <div className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-500">
                DigitalRental
              </div>
            </div>

            <div className="space-y-3">
              <p
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                  isLoading
                    ? "bg-zinc-100 text-zinc-600"
                    : isSuccess
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700",
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {isLoading
                  ? "Đang xử lý"
                  : isSuccess
                    ? "Giao dịch hợp lệ"
                    : "Cần kiểm tra lại"}
              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-[440px] text-sm leading-6 text-zinc-500 sm:text-[15px]">
                {description}
              </p>
            </div>

            {code && (
              <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-zinc-500">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm">
                      <ReceiptText className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{codeLabel}</span>
                  </div>
                  <span className="break-all rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950">
                    {code}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button
                onClick={() => router.push(primaryHref)}
                disabled={isLoading}
                className={cn(
                  "h-12 rounded-2xl px-6 text-sm font-semibold text-white shadow-none",
                  isSuccess
                    ? "bg-zinc-950 hover:bg-red-600"
                    : "bg-red-600 hover:bg-red-700",
                )}
              >
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(secondaryHref)}
                className="h-12 min-w-[190px] rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 shadow-none hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
              >
                <Home className="mr-2 h-4 w-4 text-zinc-500" />
                <span className="text-zinc-700 group-hover/button:text-zinc-950">
                  {secondaryLabel}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400">
          <ShoppingBag className="h-3.5 w-3.5" />
          DigitalRental · Thiết bị hình ảnh chuyên nghiệp
        </p>
      </section>
    </main>
  );
}
