"use client";

import Image from "next/image";
import { AlertTriangle, ArrowRight, PackageOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm relative group">
      <CardHeader className="px-5 sm:px-8 pt-6 sm:pt-8 flex flex-row items-center justify-between">
        <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          Cảnh báo kho
        </CardTitle>
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </CardHeader>
      <CardContent className="p-4 sm:p-8">
        <div className="space-y-4">
          {products.map((p) => (
            <div
              key={p.productId}
              className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-red-100 shadow-sm hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all duration-300 group/item relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 pl-1">
                <div className="w-12 h-12 rounded-xl border border-zinc-200 bg-white overflow-hidden flex-shrink-0 relative">
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
                      <PackageOpen className="w-5 h-5 text-zinc-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-bold text-zinc-950 truncate">
                    {p.productName}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="inline-flex px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase tracking-[0.15em]">
                      Còn {p.stock}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      Cần nhập thêm
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover/item:opacity-100 transition-all text-red-600 hover:bg-red-50 hover:text-red-700">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button className="w-full mt-6 h-12 sm:h-14 bg-zinc-950 text-white hover:bg-red-600 rounded-xl font-bold transition-all">
          Quản lý kho hàng
        </Button>
      </CardContent>
    </Card>
  );
}
