"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, PackageOpen } from "lucide-react";
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
  const router = useRouter();

  const getImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = "https://api.lenshub.shop";
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${normalizedUrl}`;
  };

  return (
    <div className="admin-card flex h-full flex-col !p-0">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Cảnh báo kho
          </span>
        </div>
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-medium text-red-600">
          {products.length} mục
        </span>
      </div>

      <div className="flex-1 p-2">
        <div className="space-y-1">
          {products.length === 0 ? (
            <div className="py-12 text-center text-sm font-medium text-zinc-400">
              Kho hàng ổn định
            </div>
          ) : (
            products.map((product) => (
              <button
                type="button"
                key={product.productId}
                onClick={() =>
                  router.push(`/staff/products/${product.productId}`)
                }
                className="group flex w-full items-center justify-between rounded-xl border border-transparent p-2 text-left transition-all hover:border-red-100 hover:bg-red-50/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    {product.imageUrl ? (
                      <Image
                        src={getImageUrl(product.imageUrl)}
                        alt={product.productName}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-50">
                        <PackageOpen className="h-4 w-4 text-zinc-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-tight text-zinc-950">
                      {product.productName}
                    </p>
                    <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                      Kho: {product.stock}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-red-500" />
              </button>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-zinc-100 p-3">
        <Button
          type="button"
          onClick={() => router.push("/staff/products")}
          className="h-9 w-full rounded-xl bg-zinc-950 text-[13px] font-medium text-white hover:bg-red-600"
        >
          Kiểm kê ngay
        </Button>
      </div>
    </div>
  );
}
