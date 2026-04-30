"use client";

import Image from "next/image";
import { PackageOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    <Card className="rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm">
      <CardHeader className="px-5 sm:px-8 pt-6 sm:pt-8 flex flex-row items-center justify-between">
        <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
          Sản phẩm tiêu biểu
        </CardTitle>
        <PackageOpen className="w-6 h-6 text-zinc-200" />
      </CardHeader>
      <CardContent className="p-4 sm:p-8">
        <div className="space-y-4 sm:space-y-5">
          {products.map((p, i) => (
            <div
              key={p.productId}
              className="flex items-center justify-between group p-3 rounded-2xl transition-all border border-transparent hover:border-zinc-200 hover:bg-zinc-50/80 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-zinc-200 overflow-hidden relative flex-shrink-0 bg-white shadow-sm">
                  {p.imageUrl ? (
                    <Image
                      src={getImageUrl(p.imageUrl)}
                      alt={p.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400">
                      {i + 1}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <p className="text-sm sm:text-[15px] font-bold text-zinc-950 group-hover:text-red-600 transition-colors truncate">
                    {p.productName}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 truncate mt-0.5">
                    {p.brand}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="font-black text-md sm:text-lg text-zinc-950 leading-none">
                  {p.totalSold}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                  Đã bán
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
