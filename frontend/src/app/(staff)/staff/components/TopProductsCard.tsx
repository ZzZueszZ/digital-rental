"use client";

import Image from "next/image";
import { PackageOpen, TrendingUp } from "lucide-react";

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
    <div className="admin-card flex h-full flex-col !p-0">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <PackageOpen className="h-4 w-4 text-zinc-500" />
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Thiết bị nổi bật
          </span>
        </div>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </div>

      <div className="flex-1 p-2">
        <div className="space-y-1">
          {products.length === 0 ? (
            <div className="py-12 text-center text-sm font-medium text-zinc-400">
              Chưa có dữ liệu bán hàng
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.productId}
                className="group flex items-center justify-between rounded-xl border border-transparent p-2 transition-all hover:border-zinc-200 hover:bg-zinc-50/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    {product.imageUrl ? (
                      <Image
                        src={getImageUrl(product.imageUrl)}
                        alt={product.productName}
                        fill
                        className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-xs font-semibold text-zinc-300">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-tight text-zinc-950">
                      {product.productName}
                    </p>
                    <p className="mt-1 truncate text-[12px] font-medium text-zinc-400">
                      {product.brand}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] font-semibold leading-none text-zinc-950">
                    {product.totalSold}
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-zinc-400">
                    lượt bán
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
