"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
  MapPin,
  CreditCard,
  Truck,
  Ticket,
  Check,
  Loader2,
  Package,
  ShieldCheck,
  Plus,
  ArrowRight,
  ShoppingBag,
  Info,
  Calendar,
  ChevronLeft,
  Shield,
  Trash2,
  Lock,
  Camera,
  Star,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMyAddresses } from "@/services/address";
import { useMyCart } from "@/services/cart";
import { orderService } from "@/services/order";
import { PaymentMethod } from "@/types/order";
import { http as axios } from "@/lib/http";
import { IBackendRes } from "@/types/global";
import { useProduct } from "@/services/product";
import { useActiveVouchers } from "@/services/voucher";

interface VoucherApplyResponse {
  valid: boolean;
  message: string;
  cartTotal: number;
  discountAmount: number;
  finalPayable: number;
}

interface CheckoutDisplayItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  salePrice: number;
  rentPricePerDay: number;
  brand?: string;
  categoryName?: string;
  description?: string;
}

enum CheckoutStep {
  SHIPPING = 1,
  PAYMENT = 2,
  VOUCHER = 3,
  REVIEW = 4,
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const cartItemIds = useMemo(
    () =>
      searchParams.get("cartItemIds")?.split(",").map(Number).filter(Boolean) ||
      [],
    [searchParams],
  );
  const productId = searchParams.get("productId");
  const quantity = Number(searchParams.get("quantity")) || 1;
  const isDirectCheckout = !!productId;

  const { data: addressesRes, isLoading: loadingAddresses } = useMyAddresses();
  const { data: cartRes, isLoading: loadingCart } = useMyCart();
  const { data: productRes, isLoading: loadingProduct } = useProduct(
    Number(productId),
  );
  const { data: vouchersRes } = useActiveVouchers();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(
    CheckoutStep.SHIPPING,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.COD,
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherData, setVoucherData] = useState<VoucherApplyResponse | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const addresses = addressesRes?.data || [];
  const cartItems = cartRes?.data || [];
  const directProduct = productRes?.data;

  const itemsToDisplay = useMemo(() => {
    if (isDirectCheckout) {
      return directProduct
        ? [
            {
              id: directProduct.id,
              productId: directProduct.id,
              productName: directProduct.name,
              productImage: directProduct.mainImageUrl,
              quantity: quantity,
              salePrice: directProduct.salePrice,
              rentPricePerDay: directProduct.rentPricePerDay,
              brand: directProduct.brand,
              categoryName: directProduct.categoryName,
              description: directProduct.description,
            },
          ]
        : [];
    }
    return cartItems.filter((item) => cartItemIds.includes(item.id));
  }, [isDirectCheckout, directProduct, quantity, cartItems, cartItemIds]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const subtotal = itemsToDisplay.reduce((acc, item: CheckoutDisplayItem) => {
    const price = item.salePrice || item.rentPricePerDay || 0;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = voucherData?.discountAmount || 0;
  const shippingFee = 0;
  const total = subtotal - discountAmount + shippingFee;

  const handleApplyVoucher = async (codeOverride?: string) => {
    const code = codeOverride || voucherCode;
    if (!code.trim()) return;
    setIsApplyingVoucher(true);
    try {
      const res = await axios.post<IBackendRes<VoucherApplyResponse>>(
        "/vouchers/apply",
        {
          code: code.trim(),
          cartTotal: subtotal,
        },
      );
      
      const responseData = res.data.data;
      if (responseData && responseData.valid) {
        setVoucherData(responseData);
        setVoucherCode(code.trim());
        toast.success("Áp dụng mã giảm giá thành công!");
      } else {
        toast.error(responseData?.message || "Mã giảm giá không hợp lệ");
        setVoucherData(null);
      }
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : "Lỗi khi áp dụng voucher";
      toast.error(message);
      setVoucherData(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherData(null);
    setVoucherCode("");
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      let res;
      const commonData = {
        shippingAddressId: useManualAddress ? undefined : selectedAddressId!,
        shippingName: useManualAddress ? manualAddress.name : undefined,
        shippingPhone: useManualAddress ? manualAddress.phone : undefined,
        shippingAddress: useManualAddress ? manualAddress.address : undefined,
        paymentMethod,
        voucherCode: voucherData?.valid ? voucherCode : undefined,
      };

      if (isDirectCheckout) {
        res = await orderService.checkout({
          ...commonData,
          items: [{ productId: Number(productId), quantity }],
        });
      } else {
        res = await orderService.checkoutFromCart({
          ...commonData,
          cartItemIds,
        });
      }

      const orderData = res.data;
      if (orderData) {
        toast.success("Đặt hàng thành công!");
        if (paymentMethod === PaymentMethod.ONLINE) {
          try {
            const payRes = await orderService.createVnPayUrl(orderData.id);
            if (payRes.data) {
              window.location.href = payRes.data;
              return;
            }
          } catch (payError) {
            toast.error(
              "Lỗi tạo link thanh toán, vui lòng thử lại trong lịch sử đơn hàng",
            );
            router.push("/profile/orders");
          }
        } else {
          router.push(`/checkout/success?code=${orderData.code}`);
        }
      }
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : "Lỗi khi đặt hàng";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === CheckoutStep.SHIPPING) {
      if (useManualAddress) {
        if (
          !manualAddress.name ||
          !manualAddress.phone ||
          !manualAddress.address
        ) {
          toast.error("Vui lòng nhập đầy đủ thông tin nhận hàng");
          return;
        }
      } else if (!selectedAddressId) {
        toast.error("Vui lòng chọn địa chỉ nhận hàng");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loadingAddresses || (isDirectCheckout ? loadingProduct : loadingCart)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-zinc-400">
            Đang khởi tạo...
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: "Thông tin", icon: MapPin },
    { id: 2, name: "Thanh toán", icon: CreditCard },
    { id: 3, name: "Ưu đãi", icon: Ticket },
    { id: 4, name: "Xác nhận", icon: ShoppingBag },
  ];

  const getAddressSummary = () => {
    if (useManualAddress)
      return `${manualAddress.name} • ${manualAddress.phone}`;
    const addr = addresses.find((a) => a.id === selectedAddressId);
    return addr
      ? `${addr.receiverName} • ${addr.receiverPhone}`
      : "Chưa chọn địa chỉ";
  };

  return (
    <div className="min-h-screen bg-white pb-24 selection:bg-red-50">
      {/* Header - Compact Style */}
      <header className="h-16 border-b border-zinc-100 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (currentStep > 1 ? prevStep() : router.back())}
              className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-950 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">
                Quay lại
              </span>
            </button>
            <div className="w-px h-4 bg-zinc-100 mx-2" />
            <h1 className="text-xl font-bold text-zinc-950 tracking-tight">
              Thanh toán
            </h1>
          </div>

          {/* Minimalist Stepper - Compact */}
          <div className="hidden md:flex items-center gap-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  currentStep === step.id ? "opacity-100" : "opacity-30",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    currentStep >= step.id
                      ? "bg-red-600 shadow-sm"
                      : "bg-zinc-200",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    currentStep === step.id ? "text-zinc-950" : "text-zinc-400",
                  )}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">
              Bảo mật 100%
            </span>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 mt-8">
        {/* TOP SECTION: ORDER DETAILS & PRODUCT FOCUS - Reduced Padding */}
        <section className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                Chi tiết đơn hàng
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-zinc-400">
              <span className="text-xs font-medium">
                Tạm tính:
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                #{Math.random().toString(36).substring(7).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Product Cards Grid - More Compact */}
          <div className="space-y-3">
            {itemsToDisplay.map((item: CheckoutDisplayItem) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-zinc-200 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Image Preview - Smaller */}
                  <div className="w-32 h-32 aspect-square bg-zinc-50 rounded-xl border border-zinc-50 overflow-hidden p-3 relative shrink-0">
                    <img
                      src={
                        item.productImage
                          ? `http://localhost:8080${item.productImage}`
                          : "/placeholder-camera.jpg"
                      }
                      alt={item.productName}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-1 right-1">
                      <span className="bg-zinc-950 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Studio
                      </span>
                    </div>
                  </div>

                  {/* Product Meta - Tighter */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-red-600">
                        {item.brand || "Lens Hub"}
                      </span>
                      <span className="text-zinc-200">•</span>
                      <span className="text-xs font-semibold text-zinc-500">
                        {item.categoryName || "Thiết bị"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-950 truncate leading-tight mb-1">
                      {item.productName}
                    </h3>
                    <p className="text-zinc-400 text-xs font-medium italic line-clamp-1 mb-3">
                      &ldquo;
                      {item.description ||
                        "Siêu phẩm máy ảnh chuyên nghiệp cho mọi tác vụ sáng tạo."}
                      &rdquo;
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-xl border border-zinc-100">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        <span className="text-xs font-semibold text-zinc-950">
                          SL: {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span className="text-[11px] font-semibold text-emerald-600">
                          Bảo hiểm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price focus - Compact */}
                  <div className="text-right border-l border-zinc-100 pl-6 hidden md:block">
                    <p className="text-xs font-medium text-zinc-400 mb-1">
                      Đơn giá
                    </p>
                    <p className="text-xl font-bold tracking-tight text-zinc-950">
                      {formatVND(
                        Number(item.salePrice || item.rentPricePerDay || 0),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal Summary Card - Lowered Padding */}
          <div className="mt-4 p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-zinc-100 shadow-sm">
                <Ticket className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 leading-none mb-1.5">
                  Giá trị tạm tính
                </p>
                <p className="text-lg font-bold text-zinc-950 leading-none tracking-tight">
                  {formatVND(subtotal)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-medium text-zinc-500 leading-none mb-1.5">
                  Bàn giao
                </p>
                <p className="text-xs font-semibold text-emerald-600 leading-none">
                  Miễn phí
                </p>
              </div>
              <div className="w-px h-8 bg-zinc-200" />
              <div className="text-right">
                <p className="text-xs font-medium text-zinc-500 leading-none mb-1.5">
                  Tổng cộng
                </p>
                <p className="text-2xl font-bold text-zinc-950 leading-none tracking-tighter">
                  {formatVND(total).replace("₫", "")}
                  <span className="text-sm ml-0.5 text-red-600">₫</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION - Profile-style Inputs & Buttons */}
        <div className="max-w-2xl mx-auto mt-12">
          {/* Step Header - Compact */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center font-bold text-sm text-zinc-950 bg-white">
              {currentStep}
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
                {steps.find((s) => s.id === currentStep)?.name}
              </h3>
              <p className="text-zinc-400 text-xs font-medium">
                Cung cấp thông tin bắt buộc
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {/* SHIPPING STEP CONTENT - Profile style */}
            {currentStep === CheckoutStep.SHIPPING && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-medium text-zinc-400">
                      Lựa chọn địa chỉ
                    </span>
                    <button
                      onClick={() => setUseManualAddress(!useManualAddress)}
                      className="text-xs font-semibold text-red-600 hover:text-zinc-950 transition-colors underline underline-offset-4 decoration-2"
                    >
                      {useManualAddress ? "Sổ địa chỉ" : "Địa chỉ mới"}
                    </button>
                  </div>

                  {useManualAddress ? (
                    <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100/50 animate-in zoom-in-95 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-zinc-500 ml-1">
                            Họ và tên người nhận
                          </Label>
                          <Input
                            placeholder="Nhập tên..."
                            value={manualAddress.name}
                            onChange={(e) =>
                              setManualAddress({
                                ...manualAddress,
                                name: e.target.value,
                              })
                            }
                            className="h-10 bg-zinc-50 border-zinc-100 rounded-xl font-semibold text-sm focus-visible:ring-red-600/5 px-4"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-zinc-500 ml-1">
                            Số điện thoại liên hệ
                          </Label>
                          <Input
                            placeholder="Nhập SĐT..."
                            value={manualAddress.phone}
                            onChange={(e) =>
                              setManualAddress({
                                ...manualAddress,
                                phone: e.target.value,
                              })
                            }
                            className="h-10 bg-zinc-50 border-zinc-100 rounded-xl font-semibold text-sm focus-visible:ring-red-600/5 px-4"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-xs font-semibold text-zinc-500 ml-1">
                            Địa chỉ chi tiết
                          </Label>
                          <Input
                            placeholder="Số nhà, tên đường, phường/xã..."
                            value={manualAddress.address}
                            onChange={(e) =>
                              setManualAddress({
                                ...manualAddress,
                                address: e.target.value,
                              })
                            }
                            className="h-12 bg-zinc-50 border-zinc-100 rounded-xl font-semibold text-sm focus-visible:ring-red-600/5 px-4"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {addresses.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 flex flex-col items-center justify-center">
                          <MapPin className="w-8 h-8 text-zinc-200 mx-auto mb-4" />
                          <p className="text-xs font-semibold text-zinc-400 mb-6">
                            Chưa có thông tin địa chỉ
                          </p>
                          <Button
                            onClick={() => setUseManualAddress(true)}
                            className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95"
                          >
                            Thiết lập ngay
                          </Button>
                        </div>
                      ) : (
                        <RadioGroup
                          value={selectedAddressId?.toString()}
                          onValueChange={(v) => setSelectedAddressId(Number(v))}
                          className="grid grid-cols-1 gap-3"
                        >
                          {addresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={cn(
                                "flex items-start gap-5 p-6 rounded-2xl border transition-all cursor-pointer bg-white relative group",
                                selectedAddressId === addr.id
                                  ? "border-red-600 shadow-lg shadow-red-50"
                                  : "border-zinc-100 hover:border-zinc-200",
                              )}
                            >
                              <RadioGroupItem
                                value={addr.id.toString()}
                                className="mt-1 w-4 h-4 text-red-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-zinc-950 text-base">
                                    {addr.receiverName}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 font-bold mb-1.5">
                                  {addr.receiverPhone}
                                </p>
                                <p className="text-[13px] text-zinc-400 font-medium italic truncate">
                                  {addr.fullAddress}
                                </p>
                              </div>
                            </label>
                          ))}
                        </RadioGroup>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAYMENT STEP CONTENT - Compact */}
            {currentStep === CheckoutStep.PAYMENT && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {[
                    {
                      id: PaymentMethod.COD,
                      label: "Tiền mặt (COD)",
                      icon: Truck,
                      color: "text-zinc-400",
                    },
                    {
                      id: PaymentMethod.ONLINE,
                      label: "VNPAY Online",
                      icon: ShieldCheck,
                      color: "text-blue-500",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex flex-col gap-6 p-8 rounded-3xl border transition-all cursor-pointer bg-white group",
                        paymentMethod === method.id
                          ? "border-red-600 bg-red-50/30 shadow-lg shadow-red-100/50 scale-[1.02]"
                          : "border-zinc-100 hover:border-zinc-200",
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <method.icon
                          className={cn(
                            "w-6 h-6",
                            paymentMethod === method.id
                              ? "text-red-600"
                              : method.color,
                          )}
                        />
                        <RadioGroupItem
                          value={method.id}
                          className="w-4 h-4 border-zinc-200 text-red-600"
                        />
                      </div>
                      <div>
                        <span
                          className={cn(
                            "font-bold text-base tracking-tight block mb-1",
                            paymentMethod === method.id
                              ? "text-zinc-950"
                              : "text-zinc-950",
                          )}
                        >
                          {method.label}
                        </span>
                        <p
                          className={cn(
                            "text-xs font-semibold opacity-60",
                            paymentMethod === method.id
                              ? "text-red-600"
                              : "text-zinc-400",
                          )}
                        >
                          Giao dịch bảo mật
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* VOUCHER STEP CONTENT - Profile style input */}
            {currentStep === CheckoutStep.VOUCHER && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-zinc-50/50 p-8 rounded-3xl border border-zinc-100 mb-8">
                  <p className="text-xs font-medium text-zinc-400 mb-6 text-center">
                    Mã giảm giá độc quyền
                  </p>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Nhập mã của bạn..."
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      className="h-10 bg-white border-zinc-100 rounded-xl text-sm font-semibold px-4 focus-visible:ring-red-600/5 text-center flex-1"
                    />
                    <Button
                      onClick={() => handleApplyVoucher()}
                      disabled={isApplyingVoucher || !voucherCode}
                      className="h-10 px-5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 font-semibold text-[14px] flex items-center gap-2 shadow-md shadow-red-100/50 whitespace-nowrap active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isApplyingVoucher ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Áp dụng"
                      )}
                    </Button>
                  </div>
                  {voucherData?.valid && (
                    <div className="mt-4 p-4 bg-emerald-500 text-white rounded-xl flex items-center justify-between shadow-lg shadow-emerald-100">
                      <span className="text-xs font-semibold flex items-center gap-2">
                        <Ticket className="w-4 h-4" /> -
                        {formatVND(voucherData.discountAmount)}
                      </span>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-xs font-bold underline underline-offset-4 decoration-2"
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {vouchersRes?.data?.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleApplyVoucher(v.code)}
                      className={cn(
                        "flex items-center justify-between px-6 py-4 rounded-xl border transition-all text-left",
                        voucherCode === v.code && voucherData?.valid
                          ? "border-red-600 bg-red-50/50 shadow-md shadow-red-50"
                          : "border-zinc-50 bg-white hover:border-zinc-100",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Ticket
                          className={cn(
                            "w-4 h-4",
                            voucherCode === v.code && voucherData?.valid
                              ? "text-red-600"
                              : "opacity-30",
                          )}
                        />
                        <div>
                          <span
                            className={cn(
                              "font-bold text-[13px] block mb-0.5 tracking-tight uppercase",
                              voucherCode === v.code && voucherData?.valid
                                ? "text-zinc-950"
                                : "text-zinc-950",
                            )}
                          >
                            {v.code}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              voucherCode === v.code && voucherData?.valid
                                ? "text-red-600"
                                : "text-zinc-400",
                            )}
                          >
                            {v.type === "PERCENTAGE"
                              ? `Giảm ${v.discountValue}%`
                              : `Giảm ${formatVND(Number(v.discountValue))}`}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4",
                          voucherCode === v.code && voucherData?.valid
                            ? "text-red-400"
                            : "opacity-40",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEW STEP CONTENT - Compact Cards */}
            {currentStep === CheckoutStep.REVIEW && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-white rounded-2xl border border-zinc-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-50">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-400 mb-1.5">
                        Địa điểm nhận
                      </p>
                      <p className="text-sm font-bold text-zinc-950 truncate mb-0.5">
                        {getAddressSummary()}
                      </p>
                      <p className="text-xs text-zinc-400 font-medium italic truncate">
                        {useManualAddress
                          ? manualAddress.address
                          : addresses.find((a) => a.id === selectedAddressId)
                              ?.fullAddress}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-zinc-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-50">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-400 mb-1.5">
                        Phương thức
                      </p>
                      <p className="text-sm font-bold text-zinc-950 mb-0.5">
                        {paymentMethod === PaymentMethod.COD
                          ? "Tiền mặt (COD)"
                          : "VNPAY Online"}
                      </p>
                      <p className="text-xs text-emerald-500 font-semibold">
                        Giao dịch an toàn
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex gap-4 items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-600 font-semibold leading-relaxed">
                    &ldquo;Dữ liệu của bạn được mã hóa an toàn qua cổng thanh toán
                    LensHub.&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons - Profile style */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-zinc-50">
              <Button
                onClick={
                  currentStep === CheckoutStep.REVIEW
                    ? handleCheckout
                    : nextStep
                }
                disabled={isSubmitting}
                className={cn(
                  "h-10 px-5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-red-100 active:scale-95 flex-1 disabled:opacity-50 disabled:pointer-events-none"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {currentStep === CheckoutStep.REVIEW
                        ? "Xác nhận & Hoàn tất"
                        : "Tiếp tục"}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {currentStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  className="h-10 px-5 rounded-xl bg-white border border-zinc-200 text-zinc-600 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 sm:w-32"
                >
                  Quay lại
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="h-10 px-5 rounded-xl bg-white border border-zinc-200 text-zinc-600 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 sm:w-32"
                >
                  Hủy bỏ
                </Button>
              )}
            </div>

            {/* Safety Footer - Minimalist */}
            <div className="mt-12 flex items-center justify-center gap-8 opacity-30">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <Truck className="w-4 h-4 text-zinc-400" />
              <Lock className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-400">
                LensHub Studio
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
