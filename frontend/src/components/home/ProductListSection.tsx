"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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

  const pageSize = 20; // Default amount is 20 items per page

  const fetchProducts = async (page: number) => {
    try {
      setIsLoading(true);
      const res = await api.get<ApiResponse>("/products", {
        params: {
          page: page,
          size: pageSize,
          sortBy: "createdAt",
          direction: "desc",
          forSale: true,
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

  const hasNextPage = pagination
    ? currentPage < pagination.totalPages - 1
    : false;
  const hasPrevPage = currentPage > 0;

  const getImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    // Assuming relative path from backend (e.g., /api/uploads/...)
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
      "http://localhost:8080";
    return `${baseUrl}${url}`;
  };

  return (
    <section
      id="product-section"
      className="py-24 bg-white relative"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <h2 className="text-4xl md:text-[3.5rem] font-bold text-zinc-950 tracking-tight leading-tight">
              Cửa hàng{""}
              <span className="text-red-600 italic pr-2">
                Thiết bị.
              </span>
            </h2>
            <p className="text-zinc-500 text-base font-medium max-w-lg mt-4 leading-relaxed">
              Các sản phẩm và phụ kiện máy ảnh chính hãng đang được mở bán. Nâng
              cấp bộ gear chuyên nghiệp của bạn ngay hôm nay.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(pageSize)].map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-[2rem] bg-zinc-100 animate-pulse"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative h-[420px] rounded-[2rem] bg-white border border-zinc-200 overflow-hidden transition-all duration-500 hover:border-red-600/30 hover:shadow-xl flex flex-col cursor-pointer"
              >
                {/* Image Wrapper */}
                <div className="relative h-[220px] w-full bg-zinc-50 p-4 flex items-center justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 text-[9px] font-bold tracking-widest uppercase text-zinc-900 shadow-xs">
                    {product.brand}
                  </div>
                  {product.forRent && product.rentPricePerDay && (
                    <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-red-600 text-[10px] font-bold tracking-widest uppercase text-white shadow-lg">
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
                    <Camera className="w-16 h-16 text-zinc-200" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-red-600 text-[10px] font-bold tracking-widest uppercase mb-2">
                      {product.categoryName}
                    </p>
                    <h3 className="text-xl font-bold text-zinc-950 tracking-tight line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      {product.forSale && product.salePrice ? (
                        <p className="text-zinc-500 text-xs font-medium">
                          Giá mua:{" "}
                          <span className="text-zinc-900 font-bold">
                            {formatVND(product.salePrice)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-zinc-500 text-xs font-medium">
                          Chỉ cho thuê
                        </p>
                      )}
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-red-600 text-zinc-500 group-hover:text-white transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-200 rounded-[2rem] bg-white">
            <Camera className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium text-sm">Không tìm thấy sản phẩm nào.</p>
          </div>
        )}

        {/* Pagination Component */}
        {products.length > 0 && pagination && pagination.totalPages >= 1 && (
          <div className="mt-16 flex flex-wrap justify-center items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!hasPrevPage || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="h-12 w-12 rounded-full border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {[...Array(pagination.totalPages)].map((_, i) => {
              // Sliding window of pages
              if (
                i === 0 ||
                i === pagination.totalPages - 1 ||
                (i >= currentPage - 1 && i <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    onClick={() => {
                      setCurrentPage(i);
                      window.scrollTo({
                        top: document.getElementById("product-section")
                          ?.offsetTop,
                        behavior: "smooth",
                      });
                    }}
                    className={`h-12 w-12 rounded-full border-zinc-200 font-bold transition-all ${
                      currentPage === i
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {i + 1}
                  </Button>
                );
              } else if (i === currentPage - 2 || i === currentPage + 2) {
                return (
                  <span
                    key={i}
                    className="text-zinc-300 px-2 font-bold select-none"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}

            <Button
              variant="outline"
              size="icon"
              disabled={!hasNextPage || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-12 w-12 rounded-full border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
