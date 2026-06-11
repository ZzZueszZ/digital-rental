"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatVND, getImageUrl } from "@/lib/utils";
import { api } from "@/services/api";

type Product = {
  id: number;
  name: string;
  description: string;
  rentPricePerDay: number;
  salePrice: number;
  mainImageUrl: string | null;
  brand: string;
  quantity: number;
  rentalQuantity: number;
  categoryId: number;
  categoryName: string;
  active: boolean;
  forRent: boolean;
  forSale: boolean;
};

type Category = {
  id: number;
  name: string;
  isActive: boolean;
};

type Pagination = {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
};

type ApiResponse<T> = {
  data: T;
  pagination?: Pagination;
  success: boolean;
};

const PAGE_SIZE = 12;

const sortOptions = {
  newest: { sortBy: "createdAt", direction: "desc" },
  nameAsc: { sortBy: "name", direction: "asc" },
  rentAsc: { sortBy: "rentPricePerDay", direction: "asc" },
  saleAsc: { sortBy: "salePrice", direction: "asc" },
} as const;

const purposeLabels: Record<string, string> = {
  all: "Mua và thuê",
  rent: "Cho thuê",
  sale: "Đang bán",
};

const sortLabels: Record<keyof typeof sortOptions, string> = {
  newest: "Mới nhất",
  nameAsc: "Tên A–Z",
  rentAsc: "Giá thuê thấp nhất",
  saleAsc: "Giá bán thấp nhất",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [purpose, setPurpose] = useState("all");
  const [sort, setSort] = useState<keyof typeof sortOptions>("newest");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<ApiResponse<Category[]>>("/categories", {
          params: { activeOnly: true, page: 0, size: 100 },
        });
        setCategories(response.data.data ?? []);
      } catch {
        setCategories([]);
      }
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const selectedSort = sortOptions[sort];
        const response = await api.get<ApiResponse<Product[]>>("/products", {
          params: {
            page,
            size: PAGE_SIZE,
            name: search || undefined,
            categories: category === "all" ? undefined : category,
            isForRent: purpose === "rent" ? true : undefined,
            isForSale: purpose === "sale" ? true : undefined,
            sortBy: selectedSort.sortBy,
            direction: selectedSort.direction,
          },
        });

        setProducts(response.data.data ?? []);
        setPagination(response.data.pagination ?? null);
      } catch {
        setProducts([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProducts();
  }, [category, page, purpose, search, sort]);

  const resultLabel = useMemo(() => {
    if (!pagination) return `${products.length} thiết bị`;
    return `${pagination.totalElements} thiết bị`;
  }, [pagination, products.length]);

  const categoryLabel =
    category === "all"
      ? "Tất cả danh mục"
      : categories.find((item) => String(item.id) === category)?.name ??
        "Danh mục";

  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(0);
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.requestAnimationFrame(() => {
      document
        .getElementById("product-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-red-100">
      <Navbar />

      <main>
        <section className="border-b border-zinc-200 bg-zinc-50/70">
          <div className="container mx-auto max-w-[1320px] px-4 py-12 md:px-6 md:py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-normal text-red-700">
                  <Camera className="h-3.5 w-3.5" />
                  Danh mục thiết bị
                </div>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Chọn thiết bị phù hợp với dự án.
                </h1>
                <p className="mt-4 max-w-xl text-sm font-normal leading-7 text-zinc-500 md:text-base">
                  So sánh giá mua, giá thuê và khám phá thiết bị hình ảnh từ
                  các thương hiệu uy tín.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm sm:flex">
                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                  <p className="text-xs text-zinc-400">Danh mục</p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {categories.length || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                  <p className="text-xs text-zinc-400">Đang hiển thị</p>
                  <p className="mt-1 font-medium text-zinc-900">{resultLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="rounded-xl border border-zinc-200 bg-white p-3 md:p-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_220px_180px_200px]">
                <label className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 focus-within:border-zinc-300">
                  <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Tìm theo tên thiết bị..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-normal text-zinc-900 outline-none placeholder:text-zinc-400"
                  />
                </label>

                <Select
                  value={category}
                  onValueChange={(value) => {
                    if (value) changeFilter(setCategory, value);
                  }}
                >
                  <SelectTrigger className="w-full border-zinc-200 !bg-white px-3 text-zinc-900 hover:!bg-white focus-visible:border-zinc-300 focus-visible:!bg-white focus-visible:ring-0 data-[size=default]:h-11 dark:!bg-white dark:hover:!bg-white">
                    <SelectValue>{categoryLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="border border-zinc-200 bg-white p-1 text-zinc-900 shadow-xl">
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={purpose}
                  onValueChange={(value) => {
                    if (value) changeFilter(setPurpose, value);
                  }}
                >
                  <SelectTrigger className="w-full border-zinc-200 !bg-white px-3 text-zinc-900 hover:!bg-white focus-visible:border-zinc-300 focus-visible:!bg-white focus-visible:ring-0 data-[size=default]:h-11 dark:!bg-white dark:hover:!bg-white">
                    <SelectValue>{purposeLabels[purpose]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="border border-zinc-200 bg-white p-1 text-zinc-900 shadow-xl">
                    <SelectItem value="all">Mua và thuê</SelectItem>
                    <SelectItem value="rent">Cho thuê</SelectItem>
                    <SelectItem value="sale">Đang bán</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sort}
                  onValueChange={(value) => {
                    if (value) {
                      setSort(value as keyof typeof sortOptions);
                      setPage(0);
                    }
                  }}
                >
                  <SelectTrigger className="w-full border-zinc-200 !bg-white px-3 text-zinc-900 hover:!bg-white focus-visible:border-zinc-300 focus-visible:!bg-white focus-visible:ring-0 data-[size=default]:h-11 dark:!bg-white dark:hover:!bg-white">
                    <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
                    <SelectValue>{sortLabels[sort]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="border border-zinc-200 bg-white p-1 text-zinc-900 shadow-xl">
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="nameAsc">Tên A–Z</SelectItem>
                    <SelectItem value="rentAsc">Giá thuê thấp nhất</SelectItem>
                    <SelectItem value="saleAsc">Giá bán thấp nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              id="product-results"
              className="mb-5 mt-8 flex scroll-mt-24 items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900">{resultLabel}</p>
                <p className="mt-1 text-xs font-normal text-zinc-400">
                  Chọn sản phẩm để xem lịch trống và thông tin chi tiết.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[420px] animate-pulse rounded-xl bg-zinc-100"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300"
                  >
                    <div className="relative flex h-[210px] items-center justify-center overflow-hidden border-b border-zinc-100 bg-zinc-50">
                      <span className="absolute left-3 top-3 z-10 rounded-lg border border-zinc-200 bg-white/90 px-2.5 py-1 text-xs font-normal text-zinc-700 backdrop-blur-md">
                        {product.brand}
                      </span>
                      {product.mainImageUrl ? (
                        <Image
                          src={getImageUrl(product.mainImageUrl)}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-contain p-7 transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <Camera className="h-16 w-16 text-zinc-200" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-normal text-red-600">
                        {product.categoryName}
                      </p>
                      <h2 className="mt-2 line-clamp-2 text-lg font-medium leading-snug tracking-tight text-zinc-950 transition-colors group-hover:text-red-600">
                        {product.name}
                      </h2>

                      <div className="mt-auto border-t border-zinc-100 pt-4">
                        <div className="grid gap-2.5">
                          {product.forRent && product.rentPricePerDay > 0 && (
                            <div className="flex items-end justify-between gap-3">
                              <span className="text-xs text-zinc-500">
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
                              <span className="text-xs text-zinc-500">
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
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-zinc-950 group-hover:text-white">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-400">
                  <PackageSearch className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-medium text-zinc-900">
                  Không tìm thấy thiết bị
                </h2>
                <p className="mt-2 max-w-sm text-sm font-normal leading-6 text-zinc-500">
                  Thử đổi từ khóa, danh mục hoặc nhu cầu để xem thêm sản phẩm.
                </p>
              </div>
            )}

            {products.length > 0 && pagination && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={page === 0 || isLoading}
                  onClick={() => goToPage(Math.max(0, page - 1))}
                  className="h-9 w-9 rounded-xl border-zinc-200 bg-white text-zinc-600 shadow-none hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: pagination.totalPages }).map(
                  (_, index) => {
                    const isVisible =
                      index === 0 ||
                      index === pagination.totalPages - 1 ||
                      (index >= page - 1 && index <= page + 1);

                    if (isVisible) {
                      return (
                        <Button
                          key={index}
                          type="button"
                          variant={page === index ? "default" : "outline"}
                          onClick={() => goToPage(index)}
                          disabled={isLoading}
                          className={`h-9 w-9 rounded-xl border-zinc-200 text-sm font-medium shadow-none ${
                            page === index
                              ? "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800"
                              : "bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                          }`}
                        >
                          {index + 1}
                        </Button>
                      );
                    }

                    if (index === page - 2 || index === page + 2) {
                      return (
                        <span
                          key={index}
                          className="select-none px-1 text-zinc-300"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  },
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={
                    page >= pagination.totalPages - 1 || isLoading
                  }
                  onClick={() =>
                    goToPage(Math.min(pagination.totalPages - 1, page + 1))
                  }
                  className="h-9 w-9 rounded-xl border-zinc-200 bg-white text-zinc-600 shadow-none hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
