"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Camera, CheckCircle2, ShoppingCart, Calendar, Star, ShieldCheck, Truck, ChevronDown, ChevronUp, Video } from "lucide-react";
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

interface ApiResponse {
  data: Product;
  message: string;
  statusCode: number;
  success: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("specs"); // 'specs' or 'terms'

  // Fetch product data
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<ApiResponse>(`/products/${id}`);
        if (res.data?.success) {
          setProduct(res.data.data);
          setMainImageUrl(res.data.data.mainImageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
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
      <div className="min-h-screen bg-[#0c0c0c] pt-24 px-6 container mx-auto flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 animate-pulse flex items-center justify-center">
          <Camera className="w-8 h-8 text-white/20" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] pt-32 px-6 container mx-auto text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Không tìm thấy sản phẩm</h1>
        <p className="text-zinc-500 mb-8">Sản phẩm này có thể đã bị xóa hoặc không còn tồn tại.</p>
        <Button onClick={() => router.push("/")} variant="outline" className="rounded-full bg-white/5 border-none text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] pb-24 text-white relative selection:bg-[#ff8c5a]/30">
      <div className="container mx-auto px-6 md:px-12 max-w-[1600px] pt-8 md:pt-12">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-10"
        >
          <div className="w-10 h-10 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center group-hover:bg-[#ff8c5a] group-hover:text-black group-hover:border-[#ff8c5a] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Trang trước</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Image Gallery & Engineering */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Main Image & Thumbnail Gallery */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square md:aspect-4/3 bg-linear-to-b from-[#1a1c20] to-[#0c0c0c] rounded-[2rem] border border-white/5 flex items-center justify-center overflow-hidden p-8 md:p-16 shadow-2xl">
                {mainImageUrl ? (
                  <Image
                    src={getImageUrl(mainImageUrl)}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-contain p-12 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <Camera className="w-32 h-32 text-white/5" />
                )}
              </div>

              {/* Sub-gallery (dynamic) */}
              {product.gallery && product.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {/* Insert main image as first thumbnail if not explicitly in gallery */}
                  <div
                    onClick={() => setMainImageUrl(product.mainImageUrl)}
                    className={`relative aspect-square rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                      mainImageUrl === product.mainImageUrl
                        ? "border-[#ff8c5a] bg-linear-to-br from-[#1a1c20] to-[#111]"
                        : "border-white/5 bg-[#111111] hover:border-white/20"
                    } flex items-center justify-center`}
                  >
                    {product.mainImageUrl ? (
                      <Image
                        src={getImageUrl(product.mainImageUrl)}
                        alt="main thumb"
                        fill
                        unoptimized
                        className="object-cover opacity-80"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-white/20" />
                    )}
                  </div>

                  {product.gallery.slice(0, 3).map((img, idx) => {
                    if (idx === 2 && product.gallery.length > 3) {
                      return (
                        <div
                          key={img.id}
                          className="relative aspect-square bg-[#0c0c0c] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center text-white/30 font-bold hover:text-white transition-colors cursor-pointer shadow-inner"
                        >
                          +{product.gallery.length - 2}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={img.id}
                        onClick={() => setMainImageUrl(img.url)}
                        className={`relative aspect-square rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                          mainImageUrl === img.url
                            ? "border-[#ff8c5a] bg-linear-to-br from-[#1a1c20] to-[#111]"
                            : "border-white/5 bg-[#111111] hover:border-white/20"
                        } flex items-center justify-center`}
                      >
                        <Image
                          src={getImageUrl(img.url)}
                          alt={`gallery-${img.id}`}
                          fill
                          unoptimized
                          className="object-cover opacity-80"
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
                <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Cấu hình nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.slice(0, 2).map((spec, idx) => (
                    <div key={spec.id} className="bg-[#111111] border border-white/5 rounded-[2rem] p-8 hover:bg-[#161616] transition-colors">
                      {idx === 0 ? <Camera className="w-6 h-6 text-[#ff8c5a] mb-6" /> : <Video className="w-6 h-6 text-[#ff8c5a] mb-6" />}
                      <h3 className="text-lg font-bold text-white mb-3">{spec.specKey}</h3>
                      <p className="text-[#a1a1aa] text-sm leading-relaxed">
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
              <span className="flex items-center gap-1.5 text-[#ff8c5a] text-[11px] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#ff8c5a]" /> 4.9 <span className="text-zinc-500 font-medium ml-1">(128 Reviews)</span>
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-6">
              {product.name}
            </h1>

            <p className="text-[#a1a1aa] text-sm md:text-base leading-relaxed mb-10">
              {product.description || "Máy ảnh mirrorless full-frame phù hợp chụp sự kiện, chân dung và quay video 4K. Hiệu năng vượt trội trong mọi điều kiện ánh sáng."}
            </p>

            <div className="space-y-4 mb-10">
              {/* Purchase Box */}
              {product.forSale && (
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-[#ff8c5a]/20 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Purchase Price</p>
                    <div className="flex items-center gap-1.5 text-[#4ade80] text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-8">
                    {product.salePrice ? formatVND(product.salePrice) : "Liên hệ"}
                  </p>
                  <Button className="w-full rounded-full h-14 bg-[#e85d04] text-white hover:bg-[#ff7b00] text-sm font-bold shadow-[0_4px_20px_rgba(232,93,4,0.3)] transition-all active:scale-[0.98] border-none flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ hàng
                  </Button>
                </div>
              )}

              {/* Rental Box */}
              {product.forRent && (
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-[#efc352]/20 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Rental Service</p>
                    <span className="px-2.5 py-0.5 rounded bg-[#efc352] text-black text-[9px] font-black tracking-widest uppercase">
                      INSURED
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-[#efc352] mb-8">
                    {product.rentPricePerDay ? formatVND(product.rentPricePerDay) : "Liên hệ"} <span className="text-sm font-medium text-zinc-500 normal-case">/ ngày</span>
                  </p>
                  <Button className="w-full rounded-full h-14 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white font-bold transition-all active:scale-[0.98] border border-white/10 flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" /> Đặt lịch thuê ngay
                  </Button>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex-1 bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <ShieldCheck className="w-6 h-6 text-[#efc352]" />
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Warranty</p>
                  <p className="text-xs font-bold text-white mt-0.5">24 Months Official</p>
                </div>
              </div>
              <div className="flex-1 bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <Truck className="w-6 h-6 text-[#efc352]" />
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Shipping</p>
                  <p className="text-xs font-bold text-white mt-0.5">Free Nationwide</p>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-white/5 pt-6 space-y-2">
              <div className="border-b border-white/5">
                <button 
                  onClick={() => setActiveTab(activeTab === "specs" ? "" : "specs")}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-sm font-bold text-white group-hover:text-[#ff8c5a] transition-colors">Full Specifications</span>
                  {activeTab === "specs" ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </button>
                
                {activeTab === "specs" && (
                  <div className="pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-4">
                      {product.specifications && product.specifications.length > 0 ? (
                        product.specifications.map((spec) => (
                          <div key={spec.id} className="grid grid-cols-3 gap-4">
                            <div className="text-xs font-medium text-zinc-500">{spec.specKey}</div>
                            <div className="col-span-2 text-xs text-[#a1a1aa]">{spec.specValue}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500">Đang cập nhật thêm thông tin.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-white/5">
                <button 
                  onClick={() => setActiveTab(activeTab === "terms" ? "" : "terms")}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-sm font-bold text-white group-hover:text-[#ff8c5a] transition-colors">Rental Terms</span>
                  {activeTab === "terms" ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </button>
                {activeTab === "terms" && (
                  <div className="pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                     <p className="text-xs text-[#a1a1aa] leading-relaxed">
                       Thiết bị được giao trong tình trạng hoàn hảo. Vui lòng xuất trình CCCD/Hộ chiếu gốc khi nhận máy. Đặt cọc 50% giá trị thiết bị hoặc theo thỏa thuận hợp đồng doanh nghiệp.
                     </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
