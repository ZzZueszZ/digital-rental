"use client";

import { useEffect, useState } from "react";

export function FullPageLoading({ message = "Đang khởi tạo" }: { message?: string }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[#0c0c0c] select-none">
      <div className="flex flex-col items-center gap-5 p-8 rounded-3xl bg-zinc-900/90 border border-white/5 shadow-2xl">
        {/* Spinner */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-[3px] border-white/10" />
          <div className="w-10 h-10 absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#ff8c5a] animate-spin" />
        </div>
        
        {/* Status */}
        <p className="text-xs font-bold text-zinc-300 tracking-widest uppercase">
          {message}{dots}
        </p>
      </div>
    </div>
  );
}
