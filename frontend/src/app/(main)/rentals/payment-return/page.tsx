"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ChevronRight,
  FileText,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RentalPaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message");
  const orderCode = searchParams.get("orderCode");
  const urlStatus = searchParams.get("status");
  const status =
    urlStatus === "success" || urlStatus === "error" ? urlStatus : "loading";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zinc-50 border-t-red-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-zinc-400 font-bold text-sm">
            Đang xác thực giao dịch...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl p-10 border border-black/5 text-center relative overflow-hidden shadow-dash-card">
          {/* Decorative Background */}
          <div
            className={cn(
              "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-10",
              status === "success" ? "bg-emerald-500" : "bg-red-500",
            )}
          />

          <div
            className={cn(
              "w-20 h-20 rounded-xl mx-auto mb-8 flex items-center justify-center bg-white shadow-sm border",
              status === "success"
                ? "text-emerald-600 border-emerald-100/50 bg-emerald-50"
                : "text-red-600 border-red-100/50 bg-red-50",
            )}
          >
            {status === "success" ? (
              <CheckCircle2 className="w-10 h-10" />
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight mb-4">
            {status === "success"
              ? "Thanh toán thành công"
              : "Thanh toán thất bại"}
          </h1>

          <p className="text-zinc-500 text-[15px] font-medium leading-relaxed mb-8 px-2">
            {message ||
              (status === "success"
                ? "Giao dịch thanh toán tiền thuê của bạn đã được xác nhận thành công. Chúng tôi sẽ chuẩn bị thiết bị ngay."
                : "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau hoặc chọn phương thức khác.")}
          </p>

          {orderCode && (
            <div className="bg-zinc-50/50 rounded-xl p-4 mb-8 flex items-center justify-between border border-black/5">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-400">
                  Mã đơn thuê
                </span>
              </div>
              <span className="text-sm font-bold text-zinc-950 tracking-tight">
                {orderCode}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => router.push("/profile/orders")}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-sm transition-all shadow-dash-card border-none flex items-center justify-center gap-2",
                status === "success"
                  ? "bg-emerald-600 hover:bg-zinc-950 text-white"
                  : "bg-red-600 hover:bg-zinc-950 text-white",
              )}
            >
              Xem đơn thuê của tôi
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="w-full h-12 rounded-xl bg-white text-zinc-400 font-bold text-sm hover:bg-zinc-50 hover:text-zinc-950 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Quay về trang chủ
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold text-zinc-400 flex items-center justify-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5" />
          LensHub • Studio Visuals
        </p>
      </div>
    </div>
  );
}
