"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ShoppingCart,
  Calendar,
  Star,
  ShieldCheck,
  Truck,
  ChevronDown,
  ChevronUp,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

interface ProductImage {
  id: number;
  url: string;
}

interface ProductSpecification {
  id: number;
  specKey: string;
  specValue: string;
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
  specifications: ProductSpecification[];
  gallery: ProductImage[];
}

interface Review {
  id: number;
  content: string;
  rating: number;
  userName: string;
  createdAt: string;
  userAvatar?: string | null;
}

interface MetaData {
  averageRating: number;
  totalReviews: number;
}

interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
  meta?: MetaData;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMeta, setReviewMeta] = useState<MetaData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("specs"); // 'specs' or 'terms'

  // Fetch product data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productRes, reviewRes] = await Promise.all([
          api.get<ApiResponse<Product>>(`/products/${id}`),
          api.get<ApiResponse<Review[]>>(`/reviews/product/${id}`),
        ]);

        if (productRes.data?.success) {
          setProduct(productRes.data.data);
          setMainImageUrl(productRes.data.data.mainImageUrl);
        }

        if (reviewRes.data?.success) {
          setReviews(reviewRes.data.data);
          setReviewMeta(reviewRes.data.meta || null);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    // Assuming backend is at localhost:8080
    return `http://localhost:8080${url}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-24 px-6 container mx-auto flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-black/5 animate-pulse flex items-center justify-center">
          <Camera className="w-8 h-8 text-black/20" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-32 px-6 container mx-auto text-center">
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">
          Không tìm thấy sản phẩm
        </h1>
        <p className="text-zinc-500 mb-8">
          Sản phẩm này có thể đã bị xóa hoặc không còn tồn tại.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-full bg-black/5 border-none text-zinc-900 hover:bg-black/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 text-zinc-900 relative selection:bg-[#ff8c5a]/30">
      <div className="container mx-auto px-6 md:px-12 max-w-[1600px] pt-8 md:pt-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-10"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">
            Trang trước
          </span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Image Gallery & Engineering */}
          <div className="lg:col-span-7 space-y-12">
            {/* Main Image & Thumbnail Gallery */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square md:aspect-4/3 bg-white rounded-[2.5rem] flex items-center justify-center overflow-hidden p-6 md:p-8 mask-[radial-gradient(circle_at_center,black_75%,transparent_100%)] group-hover:mask-[radial-gradient(circle_at_center,black_85%,transparent_100%)] transition-all duration-700">
                {mainImageUrl ? (
                  <Image
                    src={getImageUrl(mainImageUrl)}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-contain p-4 transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <Camera className="w-32 h-32 text-black/5" />
                )}
                {/* Bloom Effect */}
                <div className="absolute inset-0 bg-white/20 blur-3xl -z-10" />
              </div>

              {/* Sub-gallery (dynamic & resized) */}
              {product.gallery && product.gallery.length > 0 && (
                <div className="flex flex-wrap gap-3 md:gap-4 mt-4">
                  {/* Insert main image as first thumbnail if not explicitly in gallery */}
                  <div
                    className={`w-20 md:w-28 shrink-0 aspect-4/3 relative rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ${
                      mainImageUrl === product.mainImageUrl
                        ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-zinc-50 scale-105"
                        : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    <div className="absolute inset-0 bg-white" />
                    {product.mainImageUrl ? (
                      <Image
                        src={getImageUrl(product.mainImageUrl)}
                        alt="main thumb"
                        fill
                        unoptimized
                        className="object-contain p-1.5 z-10"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-black/20 z-10" />
                    )}
                  </div>

                  {product.gallery.slice(0, 4).map((img, idx) => {
                    if (idx === 3 && product.gallery.length > 4) {
                      return (
                        <div
                          key={img.id}
                          className="w-20 md:w-28 shrink-0 aspect-4/3 relative bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center text-zinc-500 font-bold hover:text-zinc-900 transition-colors cursor-pointer shadow-inner"
                        >
                          +{product.gallery.length - 3}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={img.id}
                        onClick={() => setMainImageUrl(img.url)}
                        className={`w-20 md:w-28 shrink-0 aspect-4/3 relative rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ${
                          mainImageUrl === img.url
                            ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-zinc-50 scale-105"
                            : "opacity-40 hover:opacity-100"
                        }`}
                      >
                        <div className="absolute inset-0 bg-white" />
                        <Image
                          src={getImageUrl(img.url)}
                          alt={`gallery-${img.id}`}
                          fill
                          unoptimized
                          className="object-contain p-1.5 z-10"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Engineering Excellence Section (Dynamic from specifications) */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="pt-8">
                <h2 className="text-2xl font-bold text-zinc-900 mb-6 tracking-tight">
                  Cấu hình nổi bật
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.slice(0, 2).map((spec, idx) => (
                    <div
                      key={spec.id}
                      className="bg-white border border-zinc-200 shadow-sm rounded-[2rem] p-8 hover:bg-zinc-50 transition-colors"
                    >
                      {idx === 0 ? (
                        <Camera className="w-6 h-6 text-[#ff8c5a] mb-6" />
                      ) : (
                        <Video className="w-6 h-6 text-[#ff8c5a] mb-6" />
                      )}
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">
                        {spec.specKey}
                      </h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        {spec.specValue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Information & Pricing */}
          <div className="lg:col-span-5 flex flex-col justify-start pb-12 lg:pb-0">
            <div className="inline-flex items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-sm bg-[#efc352]/10 text-[#efc352] text-[10px] font-black tracking-widest uppercase border border-[#efc352]/20">
                NEW ARRIVAL
              </span>
              {reviewMeta && (
                <span className="flex items-center gap-1.5 text-[#ff8c5a] text-[11px] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#ff8c5a]" />{" "}
                  {(reviewMeta.averageRating || 0).toFixed(1)}{" "}
                  <span className="text-zinc-500 font-medium ml-1">
                    ({reviewMeta.totalReviews || 0} Reviews)
                  </span>
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.15] mb-6">
              {product.name}
            </h1>

            <p className="text-zinc-500 text-sm md:text-base leading-relaxed mb-10">
              {product.description ||
                "Máy ảnh mirrorless full-frame phù hợp chụp sự kiện, chân dung và quay video 4K. Hiệu năng vượt trội trong mọi điều kiện ánh sáng."}
            </p>

            <div className="space-y-4 mb-10">
              {/* Purchase Box */}
              {product.forSale && (
                <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 md:p-8 hover:border-[#ff8c5a] transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                      Purchase Price
                    </p>
                    <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-zinc-900 mb-8">
                    {product.salePrice
                      ? formatVND(product.salePrice)
                      : "Liên hệ"}
                  </p>
                  <Button className="w-full rounded-full h-14 bg-zinc-900 text-white text-sm font-bold shadow-md transition-all active:scale-[0.98] border-none flex items-center justify-center gap-2 group-hover:bg-[#ff8c5a] group-hover:text-black">
                    <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ hàng
                  </Button>
                </div>
              )}

              {/* Rental Box */}
              {product.forRent && (
                <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 md:p-8 hover:border-amber-400 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                      Rental Service
                    </p>
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-black tracking-widest uppercase">
                      INSURED
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-amber-600 mb-8">
                    {product.rentPricePerDay
                      ? formatVND(product.rentPricePerDay)
                      : "Liên hệ"}{" "}
                    <span className="text-sm font-medium text-zinc-500 normal-case">
                      / ngày
                    </span>
                  </p>
                  <Button className="w-full rounded-full h-14 bg-zinc-100 hover:bg-amber-400 hover:text-black text-zinc-900 font-bold shadow-sm transition-all active:scale-[0.98] border border-zinc-200 hover:border-transparent flex items-center justify-center gap-2 group-hover:bg-amber-400 group-hover:border-transparent group-hover:text-black">
                    <Calendar className="w-5 h-5" /> Đặt lịch thuê ngay
                  </Button>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center gap-4">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Warranty
                  </p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">
                    24 Months Official
                  </p>
                </div>
              </div>
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center gap-4">
                <Truck className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Shipping
                  </p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">
                    Free Nationwide
                  </p>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-zinc-200 pt-6 space-y-2">
              <div className="border-b border-zinc-200">
                <button
                  onClick={() =>
                    setActiveTab(activeTab === "specs" ? "" : "specs")
                  }
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-sm font-bold text-zinc-900 group-hover:text-[#ff8c5a] transition-colors">
                    Full Specifications
                  </span>
                  {activeTab === "specs" ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </button>

                {activeTab === "specs" && (
                  <div className="pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-4">
                      {product.specifications &&
                      product.specifications.length > 0 ? (
                        product.specifications.map((spec) => (
                          <div key={spec.id} className="grid grid-cols-3 gap-4">
                            <div className="text-xs font-medium text-zinc-500">
                              {spec.specKey}
                            </div>
                            <div className="col-span-2 text-xs text-zinc-600">
                              {spec.specValue}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500">
                          Đang cập nhật thêm thông tin.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-zinc-200">
                <button
                  onClick={() =>
                    setActiveTab(activeTab === "terms" ? "" : "terms")
                  }
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-sm font-bold text-zinc-900 group-hover:text-[#ff8c5a] transition-colors">
                    Rental Terms
                  </span>
                  {activeTab === "terms" ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </button>
                {activeTab === "terms" && (
                  <div className="pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Thiết bị được giao trong tình trạng hoàn hảo. Vui lòng
                      xuất trình CCCD/Hộ chiếu gốc khi nhận máy. Đặt cọc 50% giá
                      trị thiết bị hoặc theo thỏa thuận hợp đồng doanh nghiệp.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 border-t border-zinc-200 pt-16">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Đánh giá từ khách hàng
            </h2>
            {reviewMeta && (
              <div className="flex items-center gap-2 bg-[#ff8c5a]/10 px-4 py-2 rounded-full border border-[#ff8c5a]/20">
                <Star className="w-4 h-4 fill-[#ff8c5a] text-[#ff8c5a]" />
                <span className="text-[#ff8c5a] font-bold">
                  {reviewMeta.averageRating.toFixed(1)}
                </span>
                <span className="text-zinc-500 font-medium text-sm">
                  ({reviewMeta.totalReviews} lượt)
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-6 lg:p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#ff8c5a] to-[#e85d04] flex items-center justify-center font-bold text-white text-lg shadow-lg">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">
                          {r.userName}
                        </p>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? "fill-[#ff8c5a] text-[#ff8c5a]" : "text-zinc-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {r.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white shadow-sm rounded-[2rem] border border-zinc-200">
              <Star className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
