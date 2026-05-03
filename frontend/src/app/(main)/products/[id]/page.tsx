"use client";

import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAddToCart } from "@/services/cart";
import { useMyAddresses } from "@/services/address";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { MapPin, Plus, Minus } from "lucide-react";

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
  const [quantity, setQuantity] = useState(1);

  const { accessToken } = useAuthStore();
  const { mutateAsync: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { data: addressesRes } = useMyAddresses();
  const defaultAddress = addressesRes?.data?.find(a => a.isDefault) || addressesRes?.data?.[0];

  const handleAddToCart = async () => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push("/login");
      return;
    }

    try {
      await addToCart({ productId: Number(id), quantity });
      toast.success("Đã thêm vào giỏ hàng", {
        description: `${product?.name} x${quantity}`,
        action: {
          label: "Xem giỏ hàng",
          onClick: () => router.push("/profile?section=cart"),
        },
      });
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : error instanceof Error
        ? error.message
        : "Không thể thêm vào giỏ hàng";
      toast.error(message);
    }
  };

  const handleBuyNow = async () => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      router.push("/login");
      return;
    }

    try {
      await addToCart({ productId: Number(id), quantity });
      router.push("/checkout");
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : error instanceof Error
        ? error.message
        : "Không thể xử lý yêu cầu";
      toast.error(message);
    }
  };

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
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] pt-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors mb-6"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-wide">
            Trang trước
          </span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Gallery & Engineering */}
          <div className="lg:col-span-7 space-y-8">
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
                    onClick={() => setMainImageUrl(product.mainImageUrl)}
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
                <h2 className="text-[28px] md:text-[32px] font-semibold text-zinc-900 mb-4 tracking-tight">
                  Cấu hình nổi bật
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.slice(0, 2).map((spec, idx) => (
                    <div
                      key={spec.id}
                      className="bg-white border border-zinc-200 shadow-sm rounded-xl p-5 hover:bg-zinc-50 transition-colors"
                    >
                      {idx === 0 ? (
                        <Camera className="w-6 h-6 text-red-600 mb-6" />
                      ) : (
                        <Video className="w-6 h-6 text-red-600 mb-6" />
                      )}
                      <h3 className="text-[18px] md:text-[20px] font-semibold text-zinc-900 mb-3">
                        {spec.specKey}
                      </h3>
                      <p className="text-zinc-500 text-base leading-[1.6]">
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
              <span className="px-3 py-1 rounded-sm bg-amber-500/10 text-amber-600 text-sm font-semibold border border-amber-500/20">
                Sản phẩm mới
              </span>
              {reviewMeta && (
                <span className="flex items-center gap-1.5 text-red-600 text-sm font-semibold">
                  <Star className="w-3.5 h-3.5 fill-red-600" />{" "}
                  {(reviewMeta.averageRating || 0).toFixed(1)}{" "}
                  <span className="text-zinc-500 font-medium ml-1">
                    ({reviewMeta.totalReviews || 0} Reviews)
                  </span>
                </span>
              )}
            </div>

            <h1 className="text-[32px] md:text-[40px] lg:text-[44px] font-bold text-zinc-900 tracking-tight leading-[1.2] mb-6">
              {product.name}
            </h1>

            <p className="text-zinc-500 text-base leading-[1.6] mb-8">
              {product.description ||
                "Máy ảnh mirrorless full-frame phù hợp chụp sự kiện, chân dung và quay video 4K. Hiệu năng vượt trội trong mọi điều kiện ánh sáng."}
            </p>

            {/* Quantity Selector */}
            <div className="mb-6 p-5 bg-white border border-zinc-100 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-semibold text-zinc-400 mb-1.5">Số lượng</p>
                <p className="text-sm font-medium text-zinc-900">Thiết lập quy mô đơn hàng</p>
              </div>
              <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-500 hover:text-red-600 shadow-sm border border-zinc-100 transition-all active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-black text-zinc-950 text-lg tracking-tighter">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-500 hover:text-red-600 shadow-sm border border-zinc-100 transition-all active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Shipping Address Preview - Premium Light Version */}
            {accessToken && (
              <div className="mb-6 p-5 bg-white border border-zinc-100 rounded-xl shadow-sm relative overflow-hidden group transition-all hover:border-red-600/30">
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-zinc-900" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">Địa chỉ giao hàng</p>
                  </div>
                  
                  {defaultAddress ? (
                    <div className="space-y-1.5">
                      <p className="font-semibold text-sm text-zinc-950">{defaultAddress.receiverName} • {defaultAddress.receiverPhone}</p>
                      <p className="text-sm font-medium text-zinc-500 line-clamp-1">{defaultAddress.fullAddress}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest italic">Chưa cấu hình địa chỉ mặc định</p>
                  )}

                  <button 
                    onClick={() => router.push("/profile?section=address")}
                    className="mt-6 text-sm font-semibold text-red-600 hover:text-zinc-950 transition-colors flex items-center gap-2"
                  >
                    Cập nhật thông tin nhận hàng <ArrowLeft className="w-3 h-3 rotate-180" />
                  </button>
                </div>
                
                {/* Subtle light flourish */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full blur-[40px] -mr-16 -mt-16 opacity-50" />
              </div>
            )}

            <div className="space-y-4 mb-8">
              {/* Purchase Box - Standardized Admin Style */}
              {product.forSale && (
                <div className="bg-white border border-zinc-100 shadow-sm rounded-xl p-5 hover:border-red-600/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-semibold text-zinc-400">
                      Giá bán niêm yết
                    </p>
                    <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Còn hàng
                    </div>
                  </div>
                  <p className="text-[32px] md:text-[40px] font-bold text-zinc-950 mb-6 tracking-tight">
                    {product.salePrice
                      ? formatVND(product.salePrice)
                      : "Liên hệ"}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="w-full rounded-xl h-12 bg-red-600 text-white text-[14px] md:text-[16px] font-semibold transition-all active:scale-[0.98] border-none flex items-center justify-center gap-3 hover:bg-zinc-900 disabled:opacity-50"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                      Thêm vào giỏ hàng
                    </Button>
                    <Button 
                      onClick={handleBuyNow}
                      disabled={isAddingToCart}
                      variant="outline"
                      className="w-full rounded-xl h-12 border-zinc-200 bg-zinc-50/50 text-zinc-900 text-[14px] md:text-[16px] font-semibold hover:bg-zinc-900 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      Mua ngay
                    </Button>
                  </div>
                </div>
              )}

              {/* Rental Box - Standardized Admin Style */}
              {product.forRent && (
                <div className="bg-white border border-zinc-100 shadow-sm rounded-xl p-5 hover:border-amber-400/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-semibold text-zinc-400">
                      Dịch vụ cho thuê
                    </p>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold border border-amber-100">
                      Bảo hiểm 100%
                    </span>
                  </div>
                  <p className="text-[32px] md:text-[40px] font-bold text-amber-600 mb-6 tracking-tight">
                    {product.rentPricePerDay
                      ? formatVND(product.rentPricePerDay)
                      : "Liên hệ"}{" "}
                    <span className="text-sm font-semibold text-zinc-400 normal-case tracking-normal">
                      / ngày
                    </span>
                  </p>
                  <Button className="w-full rounded-xl h-12 bg-zinc-50 border border-zinc-200 text-zinc-900 text-[14px] md:text-[16px] font-semibold hover:bg-amber-400 hover:text-black hover:border-amber-400 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" /> Đặt lịch thuê ngay
                  </Button>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center gap-4">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Bảo hành
                  </p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">
                    24 tháng chính hãng
                  </p>
                </div>
              </div>
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center gap-4">
                <Truck className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Giao hàng
                  </p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">
                    Miễn phí toàn quốc
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
                  <span className="text-base font-semibold text-zinc-900 group-hover:text-red-600 transition-colors">
                    Thông số kỹ thuật
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
                  <span className="text-base font-semibold text-zinc-900 group-hover:text-red-600 transition-colors">
                    Điều khoản thuê
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
        <div className="mt-10 border-t border-zinc-200 pt-8">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[28px] md:text-[32px] font-semibold text-zinc-900 tracking-tight">
              Đánh giá từ khách hàng
            </h2>
            {reviewMeta && (
              <div className="flex items-center gap-2 bg-red-600/10 px-4 py-2 rounded-full border border-red-600/20">
                <Star className="w-4 h-4 fill-red-600 text-red-600" />
                <span className="text-red-600 font-bold">
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
                  className="bg-white p-5 lg:p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-600 to-zinc-950 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">
                          {r.userName}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
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
                        className={`w-3.5 h-3.5 ${i < r.rating ? "fill-red-600 text-red-600" : "text-zinc-300"}`}
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
