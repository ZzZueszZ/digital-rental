"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  ChevronRight,
  FileText,
  Home,
  ShoppingBag,
  PackageCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = searchParams.get("code");

  return (
    <div className="min-h-screen bg-zinc-50/50 py-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-zinc-200/50 border border-zinc-100 text-center relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-emerald-500" />
          
          <div className="w-24 h-24 rounded-[2rem] mx-auto mb-10 flex items-center justify-center rotate-6 scale-110 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100/50">
            <PackageCheck className="w-12 h-12" />
          </div>

          <h1 className="text-3xl font-bold text-zinc-950 tracking-tight mb-4">Đặt hàng thành công</h1>
          
          <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-10 px-4">
            Cảm ơn bạn đã tin tưởng LensHub. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình chuẩn bị.
          </p>

          {orderCode && (
            <div className="bg-zinc-50 rounded-2xl p-5 mb-10 flex items-center justify-between border border-zinc-100">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-400">Mã đơn hàng</span>
              </div>
              <span className="text-sm font-bold text-zinc-950 tracking-tight">{orderCode}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={() => router.push("/profile?section=orders")}
              className="w-full h-14 rounded-2xl font-bold text-sm transition-all shadow-xl bg-zinc-950 hover:bg-red-600 text-white shadow-zinc-200 border-none flex items-center justify-center gap-2"
            >
              Quản lý đơn hàng
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => router.push("/")}
              className="w-full h-14 rounded-2xl bg-white text-zinc-400 font-semibold text-xs hover:bg-zinc-50 hover:text-zinc-950 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>

        <p className="mt-10 text-center text-xs font-semibold text-zinc-400 flex items-center justify-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5" />
          LensHub • Studio Visuals
        </p>
      </div>
    </div>
  );
}
