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
  MapPin,
  Plus,
  Minus,
  Box,
  Layers,
  Cpu,
  Zap,
  Shield,
  Flag,
  Edit,
  Trash2,
  MoreHorizontal,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ReviewFormDialog } from "@/components/common/ReviewFormDialog";
import {
  useProductReviews,
  useReportReview,
  useDeleteReview,
} from "@/hooks/useReviews";
import { useMyProfile } from "@/services/profile";
import { ReviewResponse } from "@/types/review";
import { api } from "@/services/api";
import { useAddToCart } from "@/services/cart";
import { useMyAddresses } from "@/services/address";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { cn, getImageUrl, formatVND } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { identityService } from "@/services/identity";
import { http } from "@/lib/http";

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
  quantity: number;
  rentalQuantity: number;
  active: boolean;
  forRent: boolean;
  forSale: boolean;
  specifications: ProductSpecification[];
  gallery: ProductImage[];
}

type Review = ReviewResponse;

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

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("specs"); // 'specs' or 'terms'
  const [quantity, setQuantity] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // Rental configuration states
  const [rentalStartDate, setRentalStartDate] = useState("");
  const [rentalEndDate, setRentalEndDate] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("08:00 - 12:00");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE">("ONLINE");
  const [isSubmittingRental, setIsSubmittingRental] = useState(false);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  const { accessToken } = useAuthStore();
  const { data: profileRes } = useMyProfile();
  const currentUser = profileRes?.data;

  // Calculate rental duration in days
  const calculateDays = () => {
    if (!rentalStartDate || !rentalEndDate) return 0;
    const start = new Date(rentalStartDate);
    const end = new Date(rentalEndDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays();

  // Check device availability dynamically
  const checkAvailability = async (start: string, end: string) => {
    if (!start || !end) return;
    try {
      setIsCheckingAvailability(true);
      const res = await http.get(`/rentals/products/${id}/availability`, {
        params: {
          startDate: `${start}T00:00:00`,
          endDate: `${end}T00:00:00`,
          quantity: quantity,
        },
      });
      setIsAvailable(res.data.data);
      setAvailabilityChecked(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (rentalStartDate && rentalEndDate) {
      checkAvailability(rentalStartDate, rentalEndDate);
    } else {
      setIsAvailable(null);
      setAvailabilityChecked(false);
    }
  }, [rentalStartDate, rentalEndDate, quantity]);

  const handleRentalSubmit = async () => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để thuê thiết bị");
      router.push("/auth/login");
      return;
    }

    if (!rentalStartDate || !rentalEndDate) {
      toast.error("Vui lòng chọn ngày nhận và ngày trả");
      return;
    }

    if (days <= 0) {
      toast.error("Thời gian thuê không hợp lệ");
      return;
    }

    if (!isAvailable) {
      toast.error("Thiết bị không sẵn sàng trong khoảng thời gian này");
      return;
    }

    try {
      setIsSubmittingRental(true);

      // Check KYC status
      const kyc = await identityService.getKycStatus();
      if (kyc.status !== "APPROVED" && (kyc.status as string) !== "VERIFIED") {
        setKycStatus(kyc.status);
        setShowKycDialog(true);
        return;
      }

      // Removed shippingAddress check as user picks up at branch

      const res = await http.post("/rentals/checkout", {
        items: [
          {
            productId: Number(id),
            quantity: quantity,
          },
        ],
        startDate: `${rentalStartDate}T00:00:00`,
        endDate: `${rentalEndDate}T00:00:00`,
        pickupTimeSlot: pickupTimeSlot,
        paymentMethod: paymentMethod,
      });

      if (res.data?.success) {
        toast.success(
          "Gửi yêu cầu đặt thuê thành công! Đang chuyển hướng thanh toán...",
        );

        // Redirect to VNPay
        const orderId = res.data.data.id;
        try {
          const vnpayRes = await http.post(
            `/payments/vnpay/rental-fee/create?rentalOrderId=${orderId}`,
          );
          if (vnpayRes.data?.success && vnpayRes.data.data) {
            window.location.href = vnpayRes.data.data;
            return;
          }
        } catch (e) {
          toast.error(
            "Không thể khởi tạo thanh toán VNPay. Vui lòng thanh toán sau trong trang cá nhân.",
          );
        }

        router.push("/profile/orders");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Không thể gửi yêu cầu thuê";
      toast.error(msg);
    } finally {
      setIsSubmittingRental(false);
    }
  };

  const { data: reviewsRes, isLoading: isReviewsLoading } = useProductReviews(
    Number(id),
  );
  const reviews = reviewsRes?.data || [];
  const reviewMeta = reviewsRes?.meta as unknown as MetaData | null;

  const reportMutation = useReportReview();
  const deleteMutation = useDeleteReview();

  const { mutateAsync: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { data: addressesRes } = useMyAddresses();
  const defaultAddress =
    addressesRes?.data?.find((a) => a.isDefault) || addressesRes?.data?.[0];

  const handleAddToCart = async () => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push("/auth/login");
      return;
    }

    try {
      await addToCart({ productId: Number(id), quantity });
      toast.success("Đã thêm vào giỏ hàng", {
        description: `${product?.name} x${quantity}`,
        action: {
          label: "Xem giỏ hàng",
          onClick: () => router.push("/profile/cart"),
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
      router.push("/auth/login");
      return;
    }

    router.push(`/checkout?productId=${id}&quantity=${quantity}`);
  };

  // Fetch product data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productRes = await api.get<ApiResponse<Product>>(
          `/products/${id}`,
        );

        if (productRes.data?.success) {
          setProduct(productRes.data.data);
          setMainImageUrl(productRes.data.data.mainImageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);
  const getImageUrlLocal = (url: string | null) => getImageUrl(url);

  const handleReportReview = async (reviewId: number) => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để báo cáo");
      return;
    }

    try {
      await reportMutation.mutateAsync(reviewId);
      toast.success("Đã gửi báo cáo đánh giá");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể gửi báo cáo";
      toast.error(message);
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;

    try {
      await deleteMutation.mutateAsync(deletingReviewId);
      toast.success("Đã xóa đánh giá");
      setDeletingReviewId(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xóa đánh giá";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-24 px-6 container mx-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            <p className="text-xs font-semibold text-zinc-400">
              Đang khởi tạo studio...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-32 px-6 container mx-auto text-center">
          <h1 className="text-4xl font-bold text-zinc-950 tracking-tight mb-4">
            404: Không tìm thấy
          </h1>
          <p className="text-zinc-500 font-medium mb-12">
            Sản phẩm này không còn tồn tại.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="h-12 px-10 rounded-xl bg-zinc-950 text-white font-bold text-sm shadow-dash-card"
          >
            Quay lại trang chủ
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pb-24 selection:bg-red-50">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1600px] pt-10">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-4 text-zinc-400 hover:text-zinc-950 transition-all"
            >
              <div className="w-9 h-9 rounded-xl border border-black/5 flex items-center justify-center group-hover:bg-zinc-50 transition-all shadow-dash-card">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold">
                Quay lại
              </span>
            </button>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-zinc-400 leading-none mb-1">
                  Thương hiệu
                </span>
                <span className="text-sm font-bold text-zinc-950 tracking-tight">
                  {product.brand}
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-100 hidden sm:block" />
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-zinc-400 leading-none mb-1">
                  Danh mục
                </span>
                <span className="text-sm font-bold text-red-600 tracking-tight">
                  {product.categoryName}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Image Showcase */}
            <div className="lg:col-span-7 space-y-10">
              <div className="relative aspect-square w-full bg-white rounded-xl border border-black/5 overflow-hidden group flex items-center justify-center p-8 shadow-dash-card">
                {/* Main Image */}
                {mainImageUrl ? (
                  <Image
                    src={getImageUrlLocal(mainImageUrl)}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-contain p-4 transition-transform duration-1000 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <Camera className="w-32 h-32 text-zinc-100" />
                )}
              </div>

              {/* Sub-gallery Cards */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                {/* Main Image as first thumbnail */}
                <button
                  onClick={() => setMainImageUrl(product.mainImageUrl)}
                  className={cn(
                    "aspect-square rounded-xl border transition-all p-2 flex items-center justify-center bg-white overflow-hidden shadow-dash-card",
                    mainImageUrl === product.mainImageUrl
                      ? "border-red-600 ring-2 ring-red-600/10 scale-105"
                      : "border-black/5 hover:border-zinc-200",
                  )}
                >
                  <img
                    src={getImageUrlLocal(product.mainImageUrl)}
                    className="w-full h-full object-contain"
                    alt="thumb-main"
                  />
                </button>

                {/* Gallery Images */}
                {product.gallery?.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setMainImageUrl(img.url)}
                    className={cn(
                      "aspect-square rounded-xl border transition-all p-2 flex items-center justify-center bg-white overflow-hidden shadow-dash-card",
                      mainImageUrl === img.url
                        ? "border-red-600 ring-2 ring-red-600/10 scale-105"
                        : "border-black/5 hover:border-zinc-200",
                    )}
                  >
                    <img
                      src={getImageUrlLocal(img.url)}
                      className="w-full h-full object-contain"
                      alt={`thumb-${img.id}`}
                    />
                  </button>
                ))}
              </div>

              {/* Features Spotlight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100/50">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-dash-card">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
                    Hiệu năng tối thượng
                  </h3>
                  <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">
                    Trang bị vi xử lý thế hệ mới nhất, mang lại khả năng xử lý
                    hình ảnh vượt trội trong mọi điều kiện.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-dash-card">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
                    Tốc độ & Chính xác
                  </h3>
                  <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">
                    Hệ thống lấy nét tự động cực nhanh, đảm bảo bạn không bỏ lỡ
                    bất kỳ khoảnh khắc quý giá nào.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Detailed Info & Actions */}
            <div className="lg:col-span-5 space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {reviewMeta && (
                    <div className="flex items-center gap-1.5 text-zinc-700 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                      <span>{reviewMeta.averageRating.toFixed(1)}</span>
                      <span className="text-zinc-400 font-medium ml-1">
                        ({reviewMeta.totalReviews} đánh giá)
                      </span>
                    </div>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight leading-tight mb-6">
                  {product.name}
                </h1>
                <p className="text-base text-zinc-500 font-medium leading-relaxed mb-8 italic border-l-2 border-red-600 pl-5">
                  &ldquo;{product.description}&rdquo;
                </p>

                {/* Status Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {product.forSale && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-black/5">
                      <Box className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[11px] font-bold text-zinc-950">
                        Tồn kho bán: {product.quantity}
                      </span>
                    </div>
                  )}
                  {product.forRent && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-black/5">
                      <Box className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[11px] font-bold text-zinc-950">
                        Tồn kho thuê: {product.rentalQuantity ?? 0}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-black/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-bold text-zinc-950">
                      Chính hãng 100%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-black/5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[11px] font-bold text-zinc-950">
                      Bảo hiểm mặc định
                    </span>
                  </div>
                </div>
              </div>

              {/* Configuration / Quantity Selection */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-zinc-50/50 rounded-xl border border-black/5 border-dashed">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-0.5">
                      Số lượng
                    </p>
                    <p className="text-sm font-semibold text-zinc-950">
                      Thiết bị cần thuê/mua
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-black/5 shadow-dash-card">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-zinc-50 transition-all active:scale-90"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-zinc-950 text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-zinc-50 transition-all active:scale-90"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 gap-5">
                  {product.forSale && (
                    <div className="bg-white rounded-xl p-6 border border-black/5 shadow-dash-card relative overflow-hidden group">
                      <p className="text-xs font-medium text-zinc-500 mb-4">
                        Giá bán
                      </p>
                      <div className="mb-6">
                        <p className="text-3xl font-bold tracking-tight text-zinc-950 leading-none">
                          {formatVND(product.salePrice).replace("₫", "")}
                          <span className="text-lg ml-1 text-red-600 font-bold">
                            ₫
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={handleAddToCart}
                          disabled={isAddingToCart}
                          className="h-10 px-5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-[14px] transition-all duration-200 shadow-lg shadow-zinc-200 active:scale-95 flex items-center gap-2"
                        >
                          {isAddingToCart ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                          Giỏ hàng
                        </Button>
                        <Button
                          onClick={handleBuyNow}
                          className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] transition-all duration-200 shadow-lg shadow-red-100 active:scale-95"
                        >
                          Mua ngay
                        </Button>
                      </div>
                    </div>
                  )}

                  {product.forRent && (
                    <div className="bg-zinc-50/50 rounded-xl p-6 border border-black/5 border-dashed relative group">
                      <p className="text-xs font-medium text-zinc-500 mb-4">
                        Đặt thuê thiết bị
                      </p>

                      {/* Price and Badges */}
                      <div className="flex items-end justify-between mb-6">
                        <p className="text-3xl font-bold tracking-tight text-amber-600 leading-none">
                          {formatVND(product.rentPricePerDay).replace("₫", "")}
                          <span className="text-lg ml-1 text-zinc-400 font-bold">
                            ₫/ngày
                          </span>
                        </p>
                        <span className="text-xs font-semibold text-zinc-400">
                          Bảo hiểm trọn gói
                        </span>
                      </div>

                      {/* Date Pickers */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-medium text-zinc-500 block mb-1.5">
                             Ngày nhận
                          </label>
                          <DateInput
                            min={new Date().toISOString().split("T")[0]}
                            value={rentalStartDate}
                            onChange={(v) => setRentalStartDate(v)}
                            className="w-full h-11 px-3 rounded-xl border border-black/5 bg-white text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-950 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-zinc-500 block mb-1.5">
                             Ngày trả
                          </label>
                          <DateInput
                            min={
                              rentalStartDate ||
                              new Date().toISOString().split("T")[0]
                            }
                            value={rentalEndDate}
                            onChange={(v) => setRentalEndDate(v)}
                            className="w-full h-11 px-3 rounded-xl border border-black/5 bg-white text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-950 transition-all"
                          />
                        </div>
                      </div>

                      {/* Dynamic Availability Status Indicator */}
                      {rentalStartDate && rentalEndDate && (
                        <div className="mb-4">
                          {isCheckingAvailability ? (
                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                              <Loader2 className="w-4 h-4 animate-spin" /> Đang
                              kiểm tra lịch trống...
                            </div>
                          ) : isAvailable === true ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Thiết bị
                              có sẵn để thuê
                            </div>
                          ) : isAvailable === false ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                              Hết thiết bị trong khoảng thời gian này
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Pickup Branch & Time Slot Selection */}
                      {isAvailable === true && (
                        <>
                          <div className="mb-4">
                            <label className="text-xs font-medium text-zinc-500 block mb-1.5">
                               Khung giờ nhận máy tại cửa hàng
                            </label>
                            <Select value={pickupTimeSlot} onValueChange={(v) => v && setPickupTimeSlot(v)}>
                              <SelectTrigger className="w-full h-10 px-3 rounded-xl !border !border-zinc-200 !bg-white text-sm font-semibold text-zinc-800 !outline-none !ring-0 focus:!border-zinc-400 transition-all shadow-sm [&>span]:flex [&>span]:items-center">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl !border !border-zinc-100 shadow-xl !bg-white overflow-hidden p-1">
                                {[
                                  { value: "08:00 - 12:00", label: "08:00 - 12:00 (Sáng)" },
                                  { value: "13:00 - 17:00", label: "13:00 - 17:00 (Chiều)" },
                                  { value: "18:00 - 21:00", label: "18:00 - 21:00 (Tối)" },
                                ].map((slot) => (
                                  <SelectItem
                                    key={slot.value}
                                    value={slot.value}
                                    className="text-sm font-semibold py-2.5 px-3 rounded-xl cursor-pointer !text-zinc-800 focus:!bg-zinc-100 focus:!text-zinc-950 data-[state=checked]:!text-zinc-950 transition-colors"
                                  >
                                    {slot.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>


                          {/* Price Calculations */}
                          {days > 0 && (
                            <div className="mt-6 pt-4 border-t border-black/5 space-y-2.5">
                              <div className="flex justify-between text-xs font-semibold text-zinc-500">
                                <span>Số ngày thuê:</span>
                                <span className="text-zinc-950">
                                  {days} ngày
                                </span>
                              </div>
                              <div className="flex justify-between text-xs font-semibold text-zinc-500">
                                <span>Tổng phí thuê (tạm tính):</span>
                                <span className="font-bold text-zinc-950">
                                  {formatVND(
                                    product.rentPricePerDay * days * quantity,
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs font-semibold text-zinc-500">
                                <span>Tiền cọc thiết bị (20%):</span>
                                <span className="font-bold text-amber-600">
                                  {formatVND(
                                    product.salePrice * 0.2 * quantity,
                                  )}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed pt-1">
                                * Tiền đặt cọc thực tế sẽ được nhân viên xác
                                nhận và hoàn duyệt sau khi thẩm định hồ sơ eKYC.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Booking/Checkout Action Button */}
                      <Button
                        onClick={handleRentalSubmit}
                        disabled={
                          isSubmittingRental ||
                          (rentalStartDate !== "" &&
                            rentalEndDate !== "" &&
                            isAvailable !== true)
                        }
                        className="w-full h-10 mt-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] transition-all duration-200 shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmittingRental ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : !rentalStartDate || !rentalEndDate ? (
                          <>Chọn ngày nhận & trả máy</>
                        ) : isAvailable === false ? (
                          <>Thiết bị không có sẵn</>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" /> Đặt lịch thuê ({days} ngày)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <div className="pt-10 border-t border-zinc-100">
                <h4 className="text-sm font-semibold text-zinc-900 mb-4">
                  Thông số kỹ thuật
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {product.specifications?.map((spec) => (
                    <div
                      key={spec.id}
                      className="flex items-center justify-between py-4 border-b border-zinc-50 group"
                    >
                      <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-950 transition-colors">
                        {spec.specKey}
                      </span>
                      <span className="text-xs font-bold text-zinc-950">
                        {spec.specValue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-zinc-100">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-zinc-950 tracking-tight mb-2">
                  Đánh giá
                </h2>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                  Nhận xét từ khách hàng đã trực tiếp sử dụng thiết bị.
                </p>
              </div>
              {reviewMeta && (
                <div className="flex items-center gap-8 bg-white p-6 rounded-xl border border-black/5 shadow-dash-card">
                  <div className="text-center px-4">
                    <p className="text-4xl font-bold text-zinc-950 leading-none mb-3">
                      {reviewMeta.averageRating.toFixed(1)}
                    </p>
                    <div className="flex items-center gap-1 justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < Math.round(reviewMeta.averageRating)
                              ? "fill-red-600 text-red-600"
                              : "text-zinc-200",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="w-px h-12 bg-zinc-100" />
                  <div className="px-4">
                    <p className="text-2xl font-bold text-zinc-950 leading-none mb-2">
                      {reviewMeta.totalReviews}
                    </p>
                    <p className="text-xs font-semibold text-zinc-400 tracking-wider">
                      Đánh giá
                    </p>
                  </div>
                </div>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-8 rounded-xl border border-black/5 shadow-dash-card hover:border-red-600/20 transition-all duration-300 group flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {r.userAvatar ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-100 shadow-sm shrink-0">
                            <img
                              src={getImageUrlLocal(r.userAvatar)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center font-bold text-zinc-950 text-sm shadow-sm group-hover:bg-red-50 group-hover:border-red-100 transition-colors shrink-0">
                            {r.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-zinc-950 text-[15px] line-clamp-1">
                            {r.userName}
                          </p>
                          <p className="text-[10px] font-semibold text-zinc-400 tracking-widest">
                            {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-950 hover:bg-zinc-50 transition-all cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 bg-white rounded-xl border border-zinc-100 shadow-dash-overlay p-1.5"
                        >
                          {currentUser?.id === r.userId ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingReview(r);
                                  setIsEditOpen(true);
                                }}
                                className="gap-3 text-[13px] font-bold py-3 rounded-xl cursor-pointer text-zinc-900 focus:bg-red-600 focus:text-white transition-all duration-200"
                              >
                                <Edit className="w-4 h-4" /> Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingReviewId(r.id)}
                                className="gap-3 text-[13px] font-bold py-3 rounded-xl text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" /> Xóa đánh giá
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleReportReview(r.id)}
                              className="gap-3 text-[13px] font-bold py-3 rounded-xl text-amber-600 focus:bg-amber-50 focus:text-amber-700 cursor-pointer transition-all duration-200"
                            >
                              <Flag className="w-4 h-4" /> Báo cáo
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-1 mb-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < r.rating
                              ? "fill-red-600 text-red-600"
                              : "text-zinc-200",
                          )}
                        />
                      ))}
                    </div>

                    <p className="text-[15px] font-medium text-zinc-600 leading-relaxed italic border-l-2 border-zinc-100 pl-4 group-hover:border-red-200 transition-colors mb-6 flex-grow">
                      &ldquo;{r.content}&rdquo;
                    </p>

                    {/* Review Images */}
                    {r.images && r.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {r.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-xl border border-zinc-100 overflow-hidden shadow-sm hover:scale-105 transition-transform cursor-pointer"
                          >
                            <img
                              src={getImageUrlLocal(img)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-zinc-50/50 rounded-xl border-2 border-dashed border-zinc-100">
                <Star className="w-16 h-16 text-zinc-100 mx-auto mb-6" />
                <p className="text-xs font-semibold text-zinc-300">
                  Chưa có đánh giá nào
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Editing Dialog */}
        {editingReview && (
          <ReviewFormDialog
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setEditingReview(null);
            }}
            productId={product.id}
            productName={product.name}
            initialData={editingReview}
          />
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingReviewId}
          onOpenChange={(open) => !open && setDeletingReviewId(null)}
          onConfirm={handleDeleteReview}
          title="Xóa đánh giá?"
          description="Hành động này không thể hoàn tác. Đánh giá của bạn sẽ bị gỡ bỏ hoàn toàn."
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* KYC Alert Dialog */}
        {showKycDialog && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl max-w-md w-full p-8 border border-black/5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 mb-2">
                Yêu cầu xác thực eKYC
              </h3>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-6">
                Bạn cần hoàn tất xác minh danh tính eKYC bằng Căn cước công dân
                trước khi có thể gửi yêu cầu thuê thiết bị nhiếp ảnh.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowKycDialog(false)}
                  className="flex-1 h-11 rounded-xl border-zinc-200 text-zinc-700 font-semibold text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={() => {
                    setShowKycDialog(false);
                    router.push("/profile/ekyc");
                  }}
                  className="flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-zinc-950 transition-all border-none"
                >
                  Định danh ngay
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
