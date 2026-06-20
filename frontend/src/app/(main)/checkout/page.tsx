"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
  MapPin,
  CreditCard,
  Truck,
  Ticket,
  Loader2,
  Package,
  ShieldCheck,
  Plus,
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  Lock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, getImageUrl } from "@/lib/utils";
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

  const addresses = useMemo(() => addressesRes?.data || [], [addressesRes?.data]);
  const cartItems = useMemo(() => cartRes?.data || [], [cartRes?.data]);
  const directProduct = productRes?.data;
  const directProductSaleStock = directProduct?.quantity ?? 0;
  const directProductCanSale =
    directProduct?.isForSale ??
    directProduct?.forSale ??
    (directProduct?.salePrice ?? 0) > 0;

  const isDirectCheckoutUnavailable =
    isDirectCheckout &&
    !!directProduct &&
    (!directProductCanSale ||
      directProductSaleStock <= 0 ||
      quantity > directProductSaleStock);

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

  useEffect(() => {
    if (!isDirectCheckout || loadingProduct || !directProduct) return;

    if (isDirectCheckoutUnavailable) {
      toast.error(
        directProductSaleStock <= 0
          ? "Sản phẩm đã hết hàng trong kho bán"
          : `Kho bán chỉ còn ${directProductSaleStock} sản phẩm khả dụng`,
      );
      router.replace(`/products/${productId}`);
    }
  }, [
    directProduct,
    directProductSaleStock,
    isDirectCheckout,
    isDirectCheckoutUnavailable,
    loadingProduct,
    productId,
    router,
  ]);

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
    if (isDirectCheckoutUnavailable) {
      toast.error(
        directProductSaleStock <= 0
          ? "Sản phẩm đã hết hàng trong kho bán"
          : `Kho bán chỉ còn ${directProductSaleStock} sản phẩm khả dụng`,
      );
      router.replace(`/products/${productId}`);
      return;
    }

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
          } catch {
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

  const stepDescriptions: Record<CheckoutStep, string> = {
    [CheckoutStep.SHIPPING]: "Chọn nơi nhận hàng phù hợp với bạn.",
    [CheckoutStep.PAYMENT]: "Lựa chọn phương thức thanh toán thuận tiện.",
    [CheckoutStep.VOUCHER]: "Áp dụng ưu đãi cho đơn hàng này.",
    [CheckoutStep.REVIEW]: "Kiểm tra lần cuối trước khi đặt hàng.",
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-16 selection:bg-red-100">
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (currentStep > 1 ? prevStep() : router.back())}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-950"
              aria-label="Quay lại"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-zinc-950">Thanh toán</p>
              <p className="hidden text-xs text-zinc-500 sm:block">
                Hoàn tất đơn hàng trong vài bước
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-700">
            <Lock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Thanh toán an toàn</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-red-600">
            Hoàn tất đơn mua
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
            Kiểm tra và xác nhận đơn hàng
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Thông tin của bạn được bảo vệ trong suốt quá trình đặt hàng và
            thanh toán.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-5 md:px-7">
              <div className="grid grid-cols-4 gap-2">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isComplete = currentStep > step.id;

                  return (
                    <div key={step.id} className="relative">
                      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
                        <div
                          className={cn(
                            "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                            isActive
                              ? "border-red-200 bg-red-50 text-red-600"
                              : isComplete
                                ? "border-zinc-950 bg-zinc-950 text-white"
                                : "border-zinc-200 bg-white text-zinc-400",
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <StepIcon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "truncate text-xs font-medium sm:text-sm",
                              isActive || isComplete
                                ? "text-zinc-950"
                                : "text-zinc-400",
                            )}
                          >
                            {step.name}
                          </p>
                          <p className="hidden text-[11px] text-zinc-400 sm:block">
                            Bước {step.id}
                          </p>
                        </div>
                      </div>
                      {step.id < steps.length && (
                        <div className="absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-[18px] hidden h-px bg-zinc-200 sm:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 md:p-7">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                  {React.createElement(
                    steps.find((step) => step.id === currentStep)?.icon ||
                      ShoppingBag,
                    { className: "h-4 w-4" },
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">
                    {steps.find((step) => step.id === currentStep)?.name}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {stepDescriptions[currentStep]}
                  </p>
                </div>
              </div>

              <div className="min-h-[360px]">
            {currentStep === CheckoutStep.SHIPPING && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-700">
                      Địa chỉ nhận hàng
                    </p>
                    <button
                      onClick={() => setUseManualAddress(!useManualAddress)}
                      className="flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {useManualAddress ? "Dùng địa chỉ đã lưu" : "Địa chỉ mới"}
                    </button>
                  </div>

                  {useManualAddress ? (
                    <div className="animate-in zoom-in-95 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 duration-300">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-zinc-600">
                            Họ và tên người nhận
                          </Label>
                          <Input
                            placeholder="Nguyễn Văn A"
                            value={manualAddress.name}
                            onChange={(e) =>
                              setManualAddress({
                                ...manualAddress,
                                name: e.target.value,
                              })
                            }
                            className="h-10 rounded-xl border-zinc-200 bg-white px-4 text-sm font-normal focus-visible:border-red-200 focus-visible:ring-0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-zinc-600">
                            Số điện thoại liên hệ
                          </Label>
                          <Input
                            placeholder="09xx xxx xxx"
                            value={manualAddress.phone}
                            onChange={(e) =>
                              setManualAddress({
                                ...manualAddress,
                                phone: e.target.value,
                              })
                            }
                            className="h-10 rounded-xl border-zinc-200 bg-white px-4 text-sm font-normal focus-visible:border-red-200 focus-visible:ring-0"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium text-zinc-600">
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
                            className="h-10 rounded-xl border-zinc-200 bg-white px-4 text-sm font-normal focus-visible:border-red-200 focus-visible:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {addresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-10 text-center">
                          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-zinc-400 shadow-sm">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-medium text-zinc-700">
                            Bạn chưa có địa chỉ nhận hàng
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Thêm địa chỉ mới để tiếp tục thanh toán.
                          </p>
                          <Button
                            onClick={() => setUseManualAddress(true)}
                            className="mt-5 h-10 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
                          >
                            <Plus className="h-4 w-4" />
                            Thêm địa chỉ
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
                                "relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors",
                                selectedAddressId === addr.id
                                  ? "border-red-200 bg-red-50/40"
                                  : "border-zinc-200 bg-white hover:bg-zinc-50/60",
                              )}
                            >
                              <RadioGroupItem
                                value={addr.id.toString()}
                                className="mt-1 border-zinc-300 checked:border-red-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-zinc-950">
                                    {addr.receiverName}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <p className="mb-1 text-xs text-zinc-600">
                                  {addr.receiverPhone}
                                </p>
                                <p className="text-sm leading-relaxed text-zinc-500">
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
                  className="grid grid-cols-1 gap-3"
                >
                  {[
                    {
                      id: PaymentMethod.COD,
                      label: "Tiền mặt (COD)",
                      description: "Thanh toán khi nhận hàng.",
                      icon: Truck,
                    },
                    {
                      id: PaymentMethod.ONLINE,
                      label: "Thanh toán qua VNPAY",
                      description: "Chuyển đến cổng VNPAY sau khi đặt hàng.",
                      icon: ShieldCheck,
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors",
                        paymentMethod === method.id
                          ? "border-red-200 bg-red-50/40"
                          : "border-zinc-200 bg-white hover:bg-zinc-50/60",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                          paymentMethod === method.id
                            ? "bg-white text-red-600 shadow-sm"
                            : "bg-zinc-100 text-zinc-500",
                        )}
                      >
                        <method.icon
                          className="h-5 w-5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-950">
                          {method.label}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {method.description}
                        </p>
                      </div>
                      <RadioGroupItem
                        value={method.id}
                        className="border-zinc-300 checked:border-red-600"
                      />
                    </label>
                  ))}
                </RadioGroup>

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <p className="text-xs leading-relaxed text-blue-700">
                    Lenshub không lưu thông tin thẻ. Giao dịch trực tuyến được
                    xử lý trực tiếp bởi VNPAY.
                  </p>
                </div>
              </div>
            )}

            {currentStep === CheckoutStep.VOUCHER && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
                  <p className="mb-3 text-sm font-medium text-zinc-700">
                    Mã giảm giá
                  </p>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Nhập mã ưu đãi"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      className="h-10 flex-1 rounded-xl border-zinc-200 bg-white px-4 text-sm font-normal focus-visible:border-red-200 focus-visible:ring-0"
                    />
                    <Button
                      onClick={() => handleApplyVoucher()}
                      disabled={isApplyingVoucher || !voucherCode}
                      className="h-10 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                      {isApplyingVoucher ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Áp dụng"
                      )}
                    </Button>
                  </div>
                  {voucherData?.valid && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Đã giảm {formatVND(voucherData.discountAmount)}
                      </span>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                      >
                        Gỡ mã
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-700">
                    Ưu đãi đang có
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {vouchersRes?.data?.map((v) => {
                      const isSelected =
                        voucherCode === v.code && voucherData?.valid;

                      return (
                        <button
                          key={v.id}
                          onClick={() => handleApplyVoucher(v.code)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                            isSelected
                              ? "border-red-200 bg-red-50/40"
                              : "border-zinc-200 bg-white hover:bg-zinc-50",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              isSelected
                                ? "bg-white text-red-600 shadow-sm"
                                : "bg-zinc-100 text-zinc-500",
                            )}
                          >
                            <Ticket className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-zinc-950">
                              {v.code}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {v.type === "PERCENTAGE"
                                ? `Giảm ${v.discountValue}%`
                                : `Giảm ${formatVND(Number(v.discountValue))}`}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </button>
                      );
                    })}
                  </div>
                  {!vouchersRes?.data?.length && (
                    <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                      Hiện chưa có ưu đãi khả dụng.
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === CheckoutStep.REVIEW && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-500">
                <div className="rounded-xl border border-zinc-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-zinc-500">Người nhận</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-950">
                        {getAddressSummary()}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                        {useManualAddress
                          ? manualAddress.address
                          : addresses.find((a) => a.id === selectedAddressId)
                              ?.fullAddress}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(CheckoutStep.SHIPPING)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Sửa
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-zinc-500">
                        Phương thức thanh toán
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-950">
                        {paymentMethod === PaymentMethod.COD
                          ? "Thanh toán khi nhận hàng"
                          : "Thanh toán qua VNPAY"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {paymentMethod === PaymentMethod.COD
                          ? "Bạn thanh toán trực tiếp cho đơn vị giao hàng."
                          : "Bạn sẽ được chuyển đến VNPAY sau khi xác nhận."}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(CheckoutStep.PAYMENT)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Sửa
                    </button>
                  </div>
                </div>

                {voucherData?.valid && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">
                        Mã {voucherCode} đã được áp dụng
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-700">
                        Bạn tiết kiệm {formatVND(voucherData.discountAmount)}.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <p className="text-xs leading-relaxed text-blue-700">
                    Khi xác nhận, bạn đồng ý với điều khoản mua hàng và chính
                    sách giao nhận của Lenshub.
                  </p>
                </div>
              </div>
            )}
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  onClick={
                    currentStep > CheckoutStep.SHIPPING
                      ? prevStep
                      : () => router.back()
                  }
                  className="h-11 rounded-xl border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {currentStep > CheckoutStep.SHIPPING
                    ? "Quay lại"
                    : "Tiếp tục mua sắm"}
                </Button>

                <Button
                  onClick={
                    currentStep === CheckoutStep.REVIEW
                      ? handleCheckout
                      : nextStep
                  }
                  disabled={isSubmitting}
                  className="h-11 rounded-xl bg-red-600 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý
                    </>
                  ) : (
                    <>
                      {currentStep === CheckoutStep.REVIEW
                        ? paymentMethod === PaymentMethod.ONLINE
                          ? "Đặt hàng và thanh toán"
                          : "Xác nhận đặt hàng"
                        : "Tiếp tục"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-sm font-semibold text-zinc-950">
                    Đơn hàng của bạn
                  </h2>
                </div>
                <span className="text-xs text-zinc-500">
                  {itemsToDisplay.length} sản phẩm
                </span>
              </div>

              <div className="max-h-[310px] space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                {itemsToDisplay.map((item: CheckoutDisplayItem) => {
                  const unitPrice = Number(
                    item.salePrice || item.rentPricePerDay || 0,
                  );

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 p-2">
                        <img
                          src={
                            item.productImage
                              ? getImageUrl(item.productImage)
                              : "/placeholder-camera.jpg"
                          }
                          alt={item.productName}
                          className="h-full w-full object-contain"
                        />
                        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-950 px-1 text-[10px] font-medium text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-950">
                          {item.productName}
                        </p>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {item.brand || item.categoryName || "Lenshub"}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-900">
                          {formatVND(unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3 border-t border-zinc-100 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Tạm tính</span>
                  <span className="font-medium text-zinc-900">
                    {formatVND(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Phí giao hàng</span>
                  <span className="font-medium text-emerald-600">Miễn phí</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Ưu đãi</span>
                    <span className="font-medium text-emerald-600">
                      -{formatVND(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-end justify-between border-t border-zinc-100 pt-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-950">
                      Tổng thanh toán
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Đã bao gồm thuế
                    </p>
                  </div>
                  <p className="text-xl font-semibold tracking-tight text-red-600">
                    {formatVND(total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Giao hàng được kiểm soát
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Sản phẩm được kiểm tra và đóng gói trước khi bàn giao.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
