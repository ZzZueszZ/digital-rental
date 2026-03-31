"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";


interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  rentPricePerDay: number;
  salePrice: number;
  mainImageUrl: string | null;
  brand: string;
  categoryId: number;
  categoryName: string;
  active: boolean;
  forRent: boolean;
  forSale: boolean;
}

interface ApiResponse {
  data: Product[];
  message: string;
  pagination: Pagination;
  statusCode: number;
  success: boolean;
}

export function ProductListSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const pageSize = 8; // Fetch a moderate amount like 8

  const fetchProducts = async (page: number) => {
    try {
      setIsLoading(true);
      const res = await api.get<ApiResponse>("/products", {
        params: {
          page: page,
          size: pageSize,
          sortBy: "createdAt",
          direction: "desc",
        },
      });
      if (res.data?.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const hasNextPage = pagination ? currentPage < pagination.totalPages - 1 : false;
  const hasPrevPage = currentPage > 0;

  const getImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    // Assuming relative path from backend (e.g., /api/uploads/...)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || "http://localhost:8080";
    return `${baseUrl}${url}`;
  };

  return (
    <section className="py-24 bg-[#0c0c0c] border-t border-white/5 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <h2 className="text-4xl md:text-[3.5rem] font-bold text-white tracking-tight leading-tight">
              Tuyển tập <br className="hidden md:block" />
              <span className="bg-linear-to-br from-[#ffd9c7] to-[#ff8c5a] bg-clip-text text-transparent italic pr-2">Chuyên nghiệp.</span>
            </h2>
            <p className="text-on-surface-variant text-base font-medium max-w-lg mt-4 leading-relaxed">
              Những công cụ quay chụp tối tân nhất vừa cập bến Digital Rental. Chọn lựa vũ khí cho dự án tiếp theo của bạn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!hasPrevPage || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="h-12 w-12 rounded-full border-white/10 bg-[#111111] text-white hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-[#111111]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!hasNextPage || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-12 w-12 rounded-full border-white/10 bg-[#111111] text-white hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-[#111111]"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="h-[420px] rounded-[2rem] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative h-[420px] rounded-[2rem] bg-[#111111] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#ff8c5a]/30 hover:shadow-[0_20px_60px_rgba(255,140,90,0.08)] flex flex-col"
              >
                {/* Image Wrapper */}
                <div className="relative h-[220px] w-full bg-[#161616] p-4 flex items-center justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold tracking-widest uppercase text-white">
                    {product.brand}
                  </div>
                  {product.forRent && product.rentPricePerDay && (
                    <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-[#ff8c5a] text-[10px] font-bold tracking-widest uppercase text-[#131313] shadow-lg">
                      {formatVND(product.rentPricePerDay)} / NGÀY
                    </div>
                  )}

                  {product.mainImageUrl ? (
                    <Image
                      src={getImageUrl(product.mainImageUrl)}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain p-8 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                    />
                  ) : (
                    <Camera className="w-16 h-16 text-white/10" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-[#ff8c5a] text-[10px] font-bold tracking-widest uppercase mb-2">
                      {product.categoryName}
                    </p>
                    <h3 className="text-xl font-bold text-white tracking-tight line-clamp-2 leading-snug group-hover:text-[#ff8c5a] transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      {product.forSale && product.salePrice ? (
                        <p className="text-on-surface-variant text-xs font-medium">
                          Giá mua: <span className="text-white font-bold">{formatVND(product.salePrice)}</span>
                        </p>
                      ) : (
                        <p className="text-on-surface-variant text-xs font-medium">Chỉ cho thuê</p>
                      )}
                    </div>
                    
                    <Button size="icon" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#ff8c5a] text-white hover:text-black transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-on-surface-variant border border-dashed border-white/10 rounded-[2rem]">
            <Camera className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium text-sm">Không tìm thấy sản phẩm nào.</p>
          </div>
        )}

        {/* View All CTA */}
        {products.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-sm font-bold tracking-widest border-white/10 bg-transparent text-white hover:bg-white hover:text-black transition-all active:scale-95 uppercase">
              XEM TẤT CẢ VŨ KHÍ
            </Button>
          </div>
        )}

      </div>
    </section>
  );
}
