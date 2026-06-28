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

  const pageSize = 8;

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
      className="relative bg-white py-16 md:py-20"
    >
      <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-red-600">
              Thiết bị mới
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-950">
              Sản phẩm dành cho bạn
            </h2>
            <p className="mt-3 max-w-lg text-sm font-normal leading-6 text-zinc-500">
              So sánh giá mua, giá thuê và chọn thiết bị phù hợp với dự án.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
          >
            Xem tất cả thiết bị
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(pageSize)].map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-xl bg-zinc-100"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative flex min-h-[420px] cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300"
              >
                {/* Image Wrapper */}
                <div className="relative flex h-[210px] w-full items-center justify-center overflow-hidden border-b border-zinc-100 bg-zinc-50 p-4">
                  <div className="absolute left-3 top-3 z-10 rounded-lg border border-zinc-200 bg-white/90 px-2.5 py-1 text-xs font-normal text-zinc-700 backdrop-blur-md">
                    {product.brand}
                  </div>
                  {product.mainImageUrl ? (
                    <Image
                      src={getImageUrl(product.mainImageUrl)}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain p-7 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <Camera className="w-16 h-16 text-zinc-200" />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="mb-2 text-xs font-normal text-red-600">
                      {product.categoryName}
                    </p>
                    <h3 className="line-clamp-2 text-lg font-medium leading-snug tracking-tight text-zinc-950 transition-colors group-hover:text-red-600">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-4 border-t border-zinc-100 pt-4">
                    <div className="grid gap-2.5">
                      {product.forRent && product.rentPricePerDay > 0 && (
                        <div className="flex items-end justify-between gap-3">
                          <span className="text-xs font-normal text-zinc-500">
                            Giá thuê
                          </span>
                          <p className="text-right text-base font-semibold text-red-600">
                            {formatVND(product.rentPricePerDay)}
                            <span className="ml-1 text-[11px] font-normal text-zinc-400">
                              / ngày
                            </span>
                          </p>
                        </div>
                      )}

                      {product.forSale && product.salePrice > 0 && (
                        <div className="flex items-end justify-between gap-3">
                          <span className="text-xs font-normal text-zinc-500">
                            Giá bán
                          </span>
                          <p className="text-right text-base font-semibold text-zinc-900">
                            {formatVND(product.salePrice)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-normal text-zinc-400">
                        Xem chi tiết
                      </span>
                      <span
                        aria-label={`Xem chi tiết ${product.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-zinc-950 group-hover:text-white"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-200 rounded-xl bg-white">
            <Camera className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium text-sm">Không tìm thấy sản phẩm nào.</p>
          </div>
        )}

        {/* Pagination Component */}
        {products.length > 0 && pagination && pagination.totalPages >= 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!hasPrevPage || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="h-9 w-9 rounded-xl border-zinc-200 bg-white text-zinc-600 shadow-none hover:border-red-200 hover:!bg-white hover:!text-red-600 disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:!text-zinc-600"
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
                    variant="outline"
                    onClick={() => {
                      setCurrentPage(i);
                      window.scrollTo({
                        top: document.getElementById("product-section")
                          ?.offsetTop,
                        behavior: "smooth",
                      });
                    }}
                    className={`h-9 w-9 rounded-xl border-zinc-200 text-sm font-medium shadow-none transition-colors ${
                      currentPage === i
                        ? "border-zinc-950 !bg-zinc-950 !text-white hover:!bg-zinc-900 hover:!text-white"
                        : "bg-white text-zinc-600 hover:border-red-200 hover:!bg-white hover:!text-red-600"
                    }`}
                  >
                    {i + 1}
                  </Button>
                );
              } else if (i === currentPage - 2 || i === currentPage + 2) {
                return (
                  <span
                    key={i}
                    className="select-none px-1 text-zinc-300"
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
              className="h-9 w-9 rounded-xl border-zinc-200 bg-white text-zinc-600 shadow-none hover:border-red-200 hover:!bg-white hover:!text-red-600 disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:!text-zinc-600"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
