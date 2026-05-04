"use client";

import Image from "next/image";
import { AlertTriangle, ArrowRight, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LowStockProduct {
  productId: number;
  productName: string;
  imageUrl: string | null;
  stock: number;
}

interface LowStockCardProps {
  products: LowStockProduct[];
}

export function LowStockCard({ products }: LowStockCardProps) {
  const getImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = "http://localhost:8080";
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${normalizedUrl}`;
  };

  return (
    <div className="admin-card flex flex-col h-full !p-0 border-red-100 shadow-red-50/50">
      <div className="p-4 border-b border-red-50 flex items-center justify-between bg-red-50/10">
        <div className="flex items-center gap-2">
           <AlertTriangle className="w-4 h-4 text-red-500" />
           <span className="text-[15px] font-semibold text-zinc-900 tracking-tight">Cảnh báo kho</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      </div>

      <div className="p-2 overflow-y-auto">
        <div className="space-y-1">
          {products.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 italic">Kho hàng ổn định</div>
          ) : (
            products.map((p) => (
              <div
                key={p.productId}
                className="flex items-center justify-between group p-2 rounded-xl transition-all border border-transparent hover:border-red-100 hover:bg-red-50/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg border border-zinc-100 overflow-hidden relative flex-shrink-0 bg-white">
                    {p.imageUrl ? (
                      <Image
                        src={getImageUrl(p.imageUrl)}
                        alt={p.productName}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                        <PackageOpen className="w-4 h-4 text-zinc-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <p className="text-[13px] font-bold text-zinc-950 truncate leading-tight mb-0.5">
                      {p.productName}
                    </p>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">
                          Kho: {p.stock}
                       </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-200 group-hover:text-red-500 transition-colors" />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3 border-t border-zinc-50">
        <Button className="w-full h-9 bg-zinc-950 text-white hover:bg-red-600 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all">
          Kiểm kê ngay
        </Button>
      </div>
    </div>
  );
}
