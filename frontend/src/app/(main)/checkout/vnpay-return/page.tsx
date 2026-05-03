"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ShoppingBag, 
  ChevronRight,
  FileText,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VNPayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"success" | "error" | "loading">("loading");
  
  const message = searchParams.get("message");
  const orderCode = searchParams.get("orderCode");
  const urlStatus = searchParams.get("status");

  useEffect(() => {
    if (urlStatus === "success") {
      setStatus("success");
    } else if (urlStatus === "error") {
      setStatus("error");
    }
  }, [urlStatus]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-100 border-t-red-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Đang xác thực giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 py-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-zinc-200/50 border border-zinc-100 text-center relative overflow-hidden">
          {/* Decorative Background */}
          <div className={cn(
            "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20",
            status === "success" ? "bg-emerald-500" : "bg-red-500"
          )} />
          
          <div className={cn(
            "w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center rotate-3 scale-110",
            status === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}>
            {status === "success" ? (
              <CheckCircle2 className="w-12 h-12" />
            ) : (
              <XCircle className="w-12 h-12" />
            )}
          </div>

          <h1 className="text-3xl font-black text-zinc-950 tracking-tight mb-4">
            {status === "success" ? "Thanh toán thành công" : "Thanh toán thất bại"}
          </h1>
          
          <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 px-4">
            {message || (status === "success" 
              ? "Giao dịch của bạn đã được xác nhận thành công. Chúng tôi sẽ chuẩn bị đơn hàng ngay." 
              : "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau hoặc chọn phương thức khác.")}
          </p>

          {orderCode && (
            <div className="bg-zinc-50 rounded-2xl p-4 mb-10 flex items-center justify-between border border-zinc-100">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mã đơn hàng</span>
              </div>
              <span className="text-sm font-black text-zinc-950 tracking-tight">{orderCode}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={() => router.push("/profile?tab=orders")}
              className={cn(
                "w-full h-12 rounded-2xl font-black text-sm transition-all shadow-lg border-none flex items-center justify-center gap-2",
                status === "success" 
                  ? "bg-emerald-600 hover:bg-zinc-950 text-white shadow-emerald-100" 
                  : "bg-red-600 hover:bg-zinc-950 text-white shadow-red-100"
              )}
            >
              Xem đơn hàng của tôi
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full h-12 rounded-2xl bg-white border-zinc-100 text-zinc-400 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-950 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Quay về trang chủ
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5" />
          Cảm ơn bạn đã tin dùng Studio Visuals
        </p>
      </div>
    </div>
  );
}
