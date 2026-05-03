"use client";

import Image from "next/image";
import { PackageOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopProduct {
  productId: number;
  productName: string;
  brand: string;
  imageUrl: string | null;
  totalSold: number;
}

interface TopProductsCardProps {
  products: TopProduct[];
}

export function TopProductsCard({ products }: TopProductsCardProps) {
  const getImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = "http://localhost:8080";
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${normalizedUrl}`;
  };

  return (
    <div className="admin-card flex flex-col h-full !p-0">
      <div className="p-4 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/20">
        <div className="flex items-center gap-2">
           <PackageOpen className="w-4 h-4 text-zinc-400" />
           <span className="text-xs font-bold text-zinc-950 uppercase tracking-tight">Sản phẩm tiêu biểu</span>
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>

      <div className="p-2 overflow-y-auto">
        <div className="space-y-1">
          {products.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 italic">Chưa có dữ liệu bán hàng</div>
          ) : (
            products.map((p, i) => (
              <div
                key={p.productId}
                className="flex items-center justify-between group p-2 rounded-xl transition-all border border-transparent hover:border-zinc-100 hover:bg-zinc-50/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg border border-zinc-100 overflow-hidden relative flex-shrink-0 bg-white shadow-sm">
                    {p.imageUrl ? (
                      <Image
                        src={getImageUrl(p.imageUrl)}
                        alt={p.productName}
                        fill
                        className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-50 flex items-center justify-center font-bold text-zinc-300 text-xs">
                        {i + 1}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <p className="text-[13px] font-bold text-zinc-950 truncate leading-tight mb-0.5">
                      {p.productName}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                      {p.brand}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end pr-1">
                  <div className="font-bold text-[15px] text-zinc-950 leading-none">
                    {p.totalSold}
                  </div>
                  <div className="text-[10px] font-bold text-zinc-300 uppercase mt-1">
                    Sales
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
