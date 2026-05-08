"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  ShoppingBag,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = searchParams.get("code");

  return (
    <div className="min-h-screen bg-white py-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-10 border border-black/5 text-center relative overflow-hidden shadow-dash-card">
          {/* Decorative Background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-10 bg-emerald-500" />

          <div className="w-20 h-20 rounded-xl mx-auto mb-8 flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100/50">
            <PackageCheck className="w-10 h-10" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight mb-4">
            Đặt hàng thành công
          </h1>

          <p className="text-zinc-500 text-[15px] font-medium leading-relaxed mb-8 px-2">
            Cảm ơn bạn đã tin tưởng LensHub. Đơn hàng của bạn đã được tiếp nhận
            và đang trong quá trình chuẩn bị.
          </p>

          {orderCode && (
            <div className="bg-zinc-50/50 rounded-xl p-4 mb-8 flex items-center justify-between border border-black/5">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-400">
                  Mã đơn hàng
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
              className="w-full h-12 rounded-xl font-bold text-sm transition-all shadow-dash-card bg-zinc-950 hover:bg-red-600 text-white border-none flex items-center justify-center gap-2"
            >
              Quản lý đơn hàng
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="w-full h-12 rounded-xl bg-white text-zinc-400 font-bold text-sm hover:bg-zinc-50 hover:text-zinc-950 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Tiếp tục mua sắm
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
