"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
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
  Loader2,
  Plus,
  Minus,
  Box,
  Flag,
  Edit,
  Trash2,
  MoreHorizontal,
  Info,
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
import { ReviewUserAvatar } from "@/components/common/ReviewUserAvatar";
import {
  useProductReviews,
  useReportReview,
  useDeleteReview,
} from "@/hooks/useReviews";
import { useMyProfile } from "@/services/profile";
import { ReviewResponse } from "@/types/review";
import { api } from "@/services/api";
import { useAddToCart } from "@/services/cart";
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

const formatRentalDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
};

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
  const [quantity, setQuantity] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // Rental configuration states
  const [rentalStartDate, setRentalStartDate] = useState("");
  const [rentalEndDate, setRentalEndDate] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("08:00 - 12:00");
  const paymentMethod = "ONLINE" as const;
  const [isSubmittingRental, setIsSubmittingRental] = useState(false);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [showRentalConfirmDialog, setShowRentalConfirmDialog] = useState(false);

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
  const checkAvailability = useCallback(async (start: string, end: string) => {
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [id, quantity]);

  useEffect(() => {
    if (rentalStartDate && rentalEndDate) {
      checkAvailability(rentalStartDate, rentalEndDate);
    } else {
      setIsAvailable(null);
    }
  }, [checkAvailability, rentalStartDate, rentalEndDate]);

  const handleRentalConfirmRequest = () => {
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

    setShowRentalConfirmDialog(true);
  };

  const handleRentalSubmit = async () => {
    try {
      setIsSubmittingRental(true);
      setShowRentalConfirmDialog(false);

      // Check KYC status
      const kyc = await identityService.getKycStatus();
      if (kyc.status !== "APPROVED" && (kyc.status as string) !== "VERIFIED") {
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
        } catch {
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

  const saleStock = product?.quantity ?? 0;
  const validateSaleStock = () => {
    if (!product?.forSale) {
      toast.error("Sản phẩm này chưa hỗ trợ mua hàng");
      return false;
    }

    if (saleStock <= 0) {
      toast.error("Sản phẩm đã hết hàng trong kho bán");
      return false;
    }

    if (quantity > saleStock) {
      toast.error(`Kho bán chỉ còn ${saleStock} sản phẩm khả dụng`);
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push("/auth/login");
      return;
    }

    try {
      if (!validateSaleStock()) return;

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

    if (!validateSaleStock()) return;

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
          const productData = productRes.data.data;
          const initialImage =
            productData.mainImageUrl ||
            productData.gallery?.find((img) => img.url?.trim())?.url ||
            null;

          setProduct(productData);
          setMainImageUrl(initialImage);
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

  const productImages = product
    ? [product.mainImageUrl, ...(product.gallery?.map((img) => img.url) ?? [])]
        .map((url) => ({
          raw: url?.trim() || "",
          src: getImageUrlLocal(url),
        }))
        .filter((img) => img.raw && img.src)
    : [];
  const activeProductImage =
    getImageUrlLocal(mainImageUrl) || productImages[0]?.src || "";
  const activeProductImageRaw = mainImageUrl || productImages[0]?.raw || "";

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
      <div className="min-h-screen bg-zinc-50/70 pb-20 selection:bg-red-50">
        <div className="container mx-auto max-w-[1320px] px-4 pt-8 lg:px-8">
          {/* Header Actions */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2.5 text-zinc-500 transition-colors hover:text-zinc-950"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white transition-colors group-hover:border-zinc-300">
                <ArrowLeft className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium">
                Quay lại
              </span>
            </button>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="mb-1 text-xs font-normal text-zinc-400 leading-none">
                  Thương hiệu
                </span>
                <span className="text-sm font-medium text-zinc-900">
                  {product.brand}
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-100 hidden sm:block" />
              <div className="flex flex-col items-end">
                <span className="mb-1 text-xs font-normal text-zinc-400 leading-none">
                  Danh mục
                </span>
                <span className="text-sm font-medium text-red-600">
                  {product.categoryName}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: Image Showcase */}
            <div className="space-y-5 lg:col-span-7">
              <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 bg-white">
                {/* Main Image */}
                {activeProductImage ? (
                  <Image
                    src={activeProductImage}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-[1.02]"
                    priority
                  />
                ) : (
                  <Camera className="w-32 h-32 text-zinc-100" />
                )}
              </div>

              {/* Sub-gallery Cards */}
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-7">
                {productImages.map((img, idx) => (
                  <button
                    key={`${img.raw}-${idx}`}
                    onClick={() => setMainImageUrl(img.raw)}
                    className={cn(
                      "aspect-square overflow-hidden rounded-xl border bg-white p-2 transition-colors",
                      activeProductImageRaw === img.raw
                        ? "border-zinc-400 bg-zinc-50"
                        : "border-zinc-200 hover:border-zinc-300",
                    )}
                  >
                    <img
                      src={img.src}
                      className="w-full h-full object-contain"
                      alt={`${product.name} ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>

              {product.description?.trim() && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500">
                      <Info className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-zinc-950">
                      Mô tả sản phẩm
                    </h2>
                  </div>
                  <p className="whitespace-pre-line text-sm font-normal leading-7 text-zinc-600">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Thiết bị chính hãng</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Kiểm tra trước khi giao</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                  <Truck className="h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Nhận hàng linh hoạt</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Mua giao tận nơi, thuê tại cửa hàng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                  <Camera className="h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Hỗ trợ kỹ thuật</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Tư vấn trong suốt quá trình dùng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Detailed Info & Actions */}
            <div className="self-start space-y-5 lg:col-span-5">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-3">
                  {reviewMeta && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{reviewMeta.averageRating.toFixed(1)}</span>
                      <span className="ml-1 font-normal text-zinc-400">
                        ({reviewMeta.totalReviews} đánh giá)
                      </span>
                    </div>
                  )}
                </div>

                <h1 className="mb-3 text-3xl font-semibold leading-tight tracking-tight text-zinc-950 md:text-4xl">
                  {product.name}
                </h1>

                {/* Status Pills */}
                <div className="flex flex-wrap gap-2">
                  {product.forSale && (
                    <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5">
                      <Box className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs font-normal text-zinc-600">
                        Tồn kho bán: {product.quantity}
                      </span>
                    </div>
                  )}
                  {product.forRent && (
                    <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5">
                      <Box className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs font-normal text-zinc-600">
                        Tồn kho thuê: {product.rentalQuantity ?? 0}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-2.5 py-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-normal text-emerald-700">
                      Chính hãng 100%
                    </span>
                  </div>
                </div>
              </div>

              {/* Configuration / Quantity Selection */}
              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
                  <div>
                    <p className="mb-0.5 text-xs font-normal text-zinc-500">
                      Số lượng
                    </p>
                    <p className="text-sm font-medium text-zinc-900">
                      Chọn số thiết bị
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white hover:text-zinc-950"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium text-zinc-950">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white hover:text-zinc-950"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 gap-5">
                  {product.forSale && (
                    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5">
                      <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="mb-2 text-xs font-normal text-zinc-500">
                            Giá mua
                          </p>
                          <p className="text-2xl font-semibold leading-none tracking-tight text-zinc-950">
                          {formatVND(product.salePrice).replace("₫", "")}
                          <span className="ml-1 text-base font-medium text-red-600">
                            ₫
                          </span>
                          </p>
                        </div>
                        <span className="text-xs font-normal text-zinc-400">
                          Giao hàng toàn quốc
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={handleAddToCart}
                          disabled={isAddingToCart}
                          className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 shadow-none hover:bg-zinc-50"
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
                          className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-none hover:bg-zinc-800"
                        >
                          Mua ngay
                        </Button>
                      </div>
                    </div>
                  )}

                  {product.forRent && (
                    <div className="relative rounded-xl border border-zinc-200 bg-white p-5">
                      <p className="mb-3 text-xs font-normal text-zinc-500">
                        Đặt thuê thiết bị
                      </p>

                      {/* Price and Badges */}
                      <div className="mb-5 flex items-end justify-between">
                        <p className="text-2xl font-semibold leading-none tracking-tight text-zinc-950">
                          {formatVND(product.rentPricePerDay).replace("₫", "")}
                          <span className="ml-1 text-sm font-normal text-zinc-500">
                            ₫/ngày
                          </span>
                        </p>
                        <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-normal text-amber-700">
                          Có bảo hiểm
                        </span>
                      </div>

                      {/* Date Pickers */}
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                            Ngày nhận
                          </label>
                          <DateInput
                            min={new Date().toISOString().split("T")[0]}
                            value={rentalStartDate}
                            onChange={(v) => setRentalStartDate(v)}
                            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-normal text-zinc-800 outline-none transition-colors focus:border-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                            Ngày trả
                          </label>
                          <DateInput
                            min={
                              rentalStartDate ||
                              new Date().toISOString().split("T")[0]
                            }
                            value={rentalEndDate}
                            onChange={(v) => setRentalEndDate(v)}
                            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-normal text-zinc-800 outline-none transition-colors focus:border-zinc-400"
                          />
                        </div>
                      </div>

                      {/* Dynamic Availability Status Indicator */}
                      {rentalStartDate && rentalEndDate && (
                        <div className="mb-4">
                          {isCheckingAvailability ? (
                            <div className="flex items-center gap-2 text-xs font-normal text-zinc-500">
                              <Loader2 className="w-4 h-4 animate-spin" /> Đang
                              kiểm tra lịch trống...
                            </div>
                          ) : isAvailable === true ? (
                            <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs font-normal text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Thiết bị
                              có sẵn để thuê
                            </div>
                          ) : isAvailable === false ? (
                            <div className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-normal text-red-700">
                              Hết thiết bị trong khoảng thời gian này
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Pickup Branch & Time Slot Selection */}
                      {isAvailable === true && (
                        <>
                          <div className="mb-4">
                            <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                              Khung giờ nhận máy tại cửa hàng
                            </label>
                            <Select value={pickupTimeSlot} onValueChange={(v) => v && setPickupTimeSlot(v)}>
                              <SelectTrigger className="h-10 w-full rounded-xl !border !border-zinc-200 !bg-white px-3 text-sm font-normal text-zinc-800 shadow-none !outline-none !ring-0 transition-colors focus:!border-zinc-400 [&>span]:flex [&>span]:items-center">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="overflow-hidden rounded-xl !border !border-zinc-200 !bg-white p-1 shadow-lg">
                                {[
                                  { value: "08:00 - 12:00", label: "08:00 - 12:00 (Sáng)" },
                                  { value: "13:00 - 17:00", label: "13:00 - 17:00 (Chiều)" },
                                  { value: "18:00 - 21:00", label: "18:00 - 21:00 (Tối)" },
                                ].map((slot) => (
                                  <SelectItem
                                    key={slot.value}
                                    value={slot.value}
                                    className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-normal !text-zinc-800 transition-colors focus:!bg-zinc-100 focus:!text-zinc-950 data-[state=checked]:!text-zinc-950"
                                  >
                                    {slot.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>


                          {/* Price Calculations */}
                          {days > 0 && (
                            <div className="mt-5 space-y-2.5 rounded-xl bg-zinc-50 p-4">
                              <div className="flex justify-between text-xs font-normal text-zinc-500">
                                <span>Số ngày thuê</span>
                                <span className="font-medium text-zinc-900">
                                  {days} ngày
                                </span>
                              </div>
                              <div className="flex justify-between text-xs font-normal text-zinc-500">
                                <span>Phí thuê tạm tính</span>
                                <span className="font-medium text-zinc-900">
                                  {formatVND(
                                    product.rentPricePerDay * days * quantity,
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs font-normal text-zinc-500">
                                <span>Tiền cọc dự kiến (20%)</span>
                                <span className="font-medium text-amber-700">
                                  {formatVND(
                                    product.salePrice * 0.2 * quantity,
                                  )}
                                </span>
                              </div>
                              <p className="pt-1 text-[11px] font-normal leading-relaxed text-zinc-400">
                                * Tiền đặt cọc thực tế sẽ được nhân viên xác
                                nhận và hoàn duyệt sau khi thẩm định hồ sơ eKYC.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Booking/Checkout Action Button */}
                      <Button
                        onClick={handleRentalConfirmRequest}
                        disabled={
                          isSubmittingRental ||
                          (rentalStartDate !== "" &&
                            rentalEndDate !== "" &&
                            isAvailable !== true)
                        }
                        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-medium text-white shadow-none transition-colors hover:bg-red-700 disabled:opacity-50"
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
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h4 className="mb-3 text-sm font-medium text-zinc-900">
                  Thông số kỹ thuật
                </h4>
                <div className="grid grid-cols-1">
                  {product.specifications?.map((spec) => (
                    <div
                      key={spec.id}
                      className="group flex items-center justify-between border-b border-zinc-100 py-3 last:border-0"
                    >
                      <span className="text-xs font-normal text-zinc-500 transition-colors group-hover:text-zinc-900">
                        {spec.specKey}
                      </span>
                      <span className="text-right text-xs font-medium text-zinc-900">
                        {spec.specValue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-zinc-200 pt-10">
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-950">
                  Đánh giá
                </h2>
                <p className="text-sm font-normal leading-relaxed text-zinc-500">
                  Nhận xét từ khách hàng đã trực tiếp sử dụng thiết bị.
                </p>
              </div>
              {reviewMeta && (
                <div className="flex items-center gap-6 rounded-xl border border-zinc-200 bg-white px-5 py-4">
                  <div className="text-center">
                    <p className="mb-2 text-3xl font-semibold leading-none text-zinc-950">
                      {reviewMeta.averageRating.toFixed(1)}
                    </p>
                    <div className="flex items-center gap-1 justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < Math.round(reviewMeta.averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-200",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="h-10 w-px bg-zinc-200" />
                  <div>
                    <p className="mb-1 text-xl font-medium leading-none text-zinc-950">
                      {reviewMeta.totalReviews}
                    </p>
                    <p className="text-xs font-normal text-zinc-500">
                      lượt đánh giá
                    </p>
                  </div>
                </div>
              )}
            </div>

            {isReviewsLoading ? (
              <div className="flex min-h-40 items-center justify-center rounded-xl border border-zinc-200 bg-white">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ReviewUserAvatar
                          name={r.userName}
                          src={r.userAvatar}
                          className="h-9 w-9 rounded-xl"
                        />
                        <div>
                          <p className="line-clamp-1 text-sm font-medium text-zinc-900">
                            {r.userName}
                          </p>
                          <p className="mt-0.5 text-xs font-normal text-zinc-400">
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
                          className="w-44 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg"
                        >
                          {currentUser?.id === r.userId ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingReview(r);
                                  setIsEditOpen(true);
                                }}
                                className="cursor-pointer gap-3 rounded-lg py-2.5 text-[13px] font-normal text-zinc-900 focus:bg-zinc-100 focus:text-zinc-950"
                              >
                                <Edit className="w-4 h-4" /> Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingReviewId(r.id)}
                                className="cursor-pointer gap-3 rounded-lg py-2.5 text-[13px] font-normal text-red-600 focus:bg-red-50 focus:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" /> Xóa đánh giá
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleReportReview(r.id)}
                              className="cursor-pointer gap-3 rounded-lg py-2.5 text-[13px] font-normal text-amber-600 focus:bg-amber-50 focus:text-amber-700"
                            >
                              <Flag className="w-4 h-4" /> Báo cáo
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-200",
                          )}
                        />
                      ))}
                    </div>

                    <p className="mb-5 flex-grow text-sm font-normal leading-6 text-zinc-600">
                      {r.content}
                    </p>

                    {/* Review Images */}
                    {r.images && r.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {r.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="h-12 w-12 cursor-pointer overflow-hidden rounded-xl border border-zinc-200"
                          >
                            <img
                              src={getImageUrlLocal(img)}
                              className="w-full h-full object-cover"
                              alt={`Ảnh đánh giá ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center">
                <Star className="mx-auto mb-4 h-10 w-10 text-zinc-200" />
                <p className="text-sm font-normal text-zinc-400">
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

        <ConfirmDialog
          open={showRentalConfirmDialog}
          onOpenChange={(open) => {
            if (!isSubmittingRental) setShowRentalConfirmDialog(open);
          }}
          onConfirm={handleRentalSubmit}
          title="Xác nhận đặt lịch thuê"
          description={
            <span className="block space-y-3">
              <span className="block">
                Vui lòng kiểm tra lại thông tin trước khi gửi yêu cầu thuê.
              </span>
              <span className="block rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-600">
                <span className="flex justify-between gap-4 py-1">
                  <span>Thiết bị</span>
                  <span className="text-right font-medium text-zinc-900">
                    {product.name}
                  </span>
                </span>
                <span className="flex justify-between gap-4 py-1">
                  <span>Ngày thuê</span>
                  <span className="font-medium text-zinc-900">
                    {formatRentalDate(rentalStartDate)} -{" "}
                    {formatRentalDate(rentalEndDate)}
                  </span>
                </span>
                <span className="flex justify-between gap-4 py-1">
                  <span>Thời gian</span>
                  <span className="font-medium text-zinc-900">
                    {days} ngày
                  </span>
                </span>
                <span className="flex justify-between gap-4 py-1">
                  <span>Khung giờ nhận</span>
                  <span className="font-medium text-zinc-900">
                    {pickupTimeSlot}
                  </span>
                </span>
                <span className="mt-2 flex justify-between gap-4 border-t border-zinc-200 pt-3">
                  <span>Phí thuê tạm tính</span>
                  <span className="font-semibold text-zinc-950">
                    {formatVND(product.rentPricePerDay * days * quantity)}
                  </span>
                </span>
                <span className="flex justify-between gap-4 py-1">
                  <span>Tiền cọc dự kiến</span>
                  <span className="font-medium text-amber-700">
                    {formatVND(product.salePrice * 0.2 * quantity)}
                  </span>
                </span>
              </span>
            </span>
          }
          confirmText="Xác nhận đặt thuê"
          cancelText="Hủy"
          isLoading={isSubmittingRental}
          variant="info"
          layout="stacked"
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
                  className="flex-1 h-11 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-700 shadow-none hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-red-500/15"
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
