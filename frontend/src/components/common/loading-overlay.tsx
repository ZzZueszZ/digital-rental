"use client";

import { useLoadingStore } from "@/store/loading";
import { Aperture } from "lucide-react";

/**
 * Global loading indicator for all API requests.
 */
export function LoadingOverlay() {
  const requestCount = useLoadingStore((s) => s.requestCount);

  if (requestCount <= 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
      <div className="flex flex-col items-center gap-4">
        {/* Minimalist Lens Aperture */}
        <div className="relative flex items-center justify-center">
          {/* Outer Lens Body */}
          <div className="w-16 h-16 rounded-full bg-zinc-950 border-[3px] border-zinc-900 flex items-center justify-center shadow-2xl">
            {/* Signature Red Ring */}
            <div className="absolute inset-[3px] rounded-full border border-red-600/40" />

            {/* Rotating Aperture */}
            <Aperture className="w-7 h-7 text-red-600 animate-[spin_4s_linear_infinite]" />
          </div>

          {/* Subtle Glow */}
          <div className="absolute w-16 h-16 rounded-full bg-red-600/5 blur-xl animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] font-semibold text-white tracking-wide opacity-80">
            Đang xử lý
          </p>
          <div className="flex gap-1.5">
            <div className="w-1 h-1 bg-red-600/60 rounded-full animate-bounce [animation-duration:1s]" />
            <div className="w-1 h-1 bg-red-600/60 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
            <div className="w-1 h-1 bg-red-600/60 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    </div>
  );
}
