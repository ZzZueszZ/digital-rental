"use client";

import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Routers from "@/constants/routers";

export default function LinkExpiredPage() {
  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-black/5 rounded-xl p-10 flex flex-col items-center text-center space-y-8 shadow-dash-card">
        <div className="w-20 h-20 bg-zinc-50 border border-black/5 rounded-xl flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Liên kết hết hạn
          </h1>
          <p className="text-zinc-500 font-medium text-base">
            Mã xác thực của bạn không còn hiệu lực.
          </p>
        </div>
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-900 block text-left ml-1">
              Email của bạn
            </label>
            <Input
              placeholder="Nhập email để gửi lại"
              className="h-12 bg-white border-black/5 shadow-dash-card rounded-xl px-5 text-zinc-900 text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-red-600/30"
            />
          </div>
          <Button className="w-full h-12 bg-zinc-900 text-white hover:bg-red-600 font-bold rounded-xl shadow-dash-card transition-all active:scale-[0.95]">
            Gửi lại liên kết kích hoạt
          </Button>
          <Link
            href={Routers.LOGIN}
            className="flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all font-bold text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </main>
  );
}
