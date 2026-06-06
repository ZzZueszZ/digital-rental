"use client";

import { use } from "react";
import {
  ArrowLeft,
  Package,
    Tag,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Truck,
  ShieldCheck,
  Zap,
  Info,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getImageUrl, cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useMemo } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProductDialog } from "../components/ProductDialog";
import {
  useUpdateProductInfo,
  useProduct,
  useDeleteProduct,
  useRestoreProduct,
  PRODUCT_KEYS,
  usePriceHistory,
  useUpdateProductPrice,
} from "@/services/product";
import { useAdjustStock, useInventoryLogs } from "@/services/inventory";
import { useGetDevicesByProduct, useCreateDevice, useUpdateDevice, DeviceResponse } from "@/services/rental";
import { useCategories } from "@/services/category";
import {
  ProductInfoUpdateRequest,
  PriceHistoryResponse,
} from "@/types/product";
import { InventoryAuditResponse } from "@/types/inventory";
import { useQueryClient } from "@tanstack/react-query";
import { StockAdjustmentDialog } from "../components/StockAdjustmentDialog";
import { ProductPriceDialog } from "../components/ProductPriceDialog";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const productId = parseInt(id);

  const { data: response, isLoading, error } = useProduct(productId);
  const product = response?.data;

  const [priceHistoryPage, setPriceHistoryPage] = useState(0);
  const [inventoryPage, setInventoryPage] = useState(0);
  const PAGE_SIZE = 5;

  const { data: historyRes } = usePriceHistory(
    productId,
    priceHistoryPage,
    PAGE_SIZE,
  );
  const priceHistory = historyRes?.data || [];
  const pricePagination = historyRes?.pagination;

  const { data: inventoryRes } = useInventoryLogs(
    productId,
    inventoryPage,
    PAGE_SIZE,
  );
  const inventoryLogs = inventoryRes?.data || [];
  const inventoryPagination = inventoryRes?.pagination;

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  const updateInfoMutation = useUpdateProductInfo(productId);
  const updatePriceMutation = useUpdateProductPrice(productId);
  const { data: catRes } = useCategories({ activeOnly: true }, 0, 100);
  const categories = useMemo(() => catRes?.data || [], [catRes]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [saleStockInput, setSaleStockInput] = useState("");
  const [rentalStockInput, setRentalStockInput] = useState("");
  const [saleStockReason, setSaleStockReason] = useState("");
  const [rentalStockReason, setRentalStockReason] = useState("");
  const [saleStockAction, setSaleStockAction] = useState<"IMPORT" | "EXPORT">("IMPORT");
  const [rentalStockAction, setRentalStockAction] = useState<"IMPORT" | "EXPORT">("IMPORT");
  const adjustStockMutation = useAdjustStock(productId);
  const { data: devicesRes } = useGetDevicesByProduct(productId);
  const devices = devicesRes?.data || [];
  const createDeviceMutation = useCreateDevice();
  const updateDeviceMutation = useUpdateDevice(productId);
  
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [deviceSerial, setDeviceSerial] = useState("");
  const [deviceCondition, setDeviceCondition] = useState("");

  const handleBack = () => router.push("/staff/products");

  const handleDelete = () => {
    setConfirmConfig({
      open: true,
      title: "Vô hiệu hóa sản phẩm?",
      description:
        "Sản phẩm này sẽ bị ẩn khỏi cửa hàng nhưng không bị xóa vĩnh viễn.",
      variant: "warning",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(productId);
          await queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
          toast.success("Vô hiệu hóa thành công");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch {
          toast.error("Không thể vô hiệu hóa sản phẩm");
        }
      },
    });
  };

  const handleRestore = () => {
    setConfirmConfig({
      open: true,
      title: "Khôi phục sản phẩm?",
      description: "Sản phẩm sẽ hiển thị lại trên cửa hàng.",
      variant: "info",
      onConfirm: async () => {
        try {
          await restoreMutation.mutateAsync(productId);
          await queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
          toast.success("Khôi phục thành công");
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        } catch {
          toast.error("Không thể khôi phục sản phẩm");
        }
      },
    });
  };

  const handleUpdateInfo = async ({
    request,
    image,
  }: {
    request: ProductInfoUpdateRequest;
    image: File | null;
  }) => {
    try {
      await updateInfoMutation.mutateAsync({ request, image });
      toast.success("Cập nhật thông tin thành công");
      setIsEditDialogOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  const handleAdjustSaleStock = async () => {
    if (!product) return;
    const quantity = Number(saleStockInput);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Số lượng kho bán phải là số nguyên lớn hơn 0");
      return;
    }

    if (saleStockAction === "EXPORT" && quantity > product.quantity) {
      toast.error(`Số lượng xuất vượt quá kho bán hiện có (${product.quantity})`);
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        quantityChange: saleStockAction === "IMPORT" ? quantity : -quantity,
        type: "SALE",
        reason: saleStockReason.trim() || undefined,
      });
      toast.success(`${saleStockAction === "IMPORT" ? "Nhập" : "Xuất"} kho bán thành công`);
      setSaleStockInput("");
      setSaleStockReason("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể điều chỉnh kho bán");
    }
  };

  
  const handleCreateDevice = async () => {
    if (!deviceSerial.trim()) {
      toast.error("Vui lòng nhập Số Serial");
      return;
    }
    try {
      await createDeviceMutation.mutateAsync({
        productId,
        serialNumber: deviceSerial.trim(),
        conditionDetails: deviceCondition.trim() || "Mới"
      });
      toast.success("Thêm thiết bị thành công");
      setDeviceSerial("");
      setDeviceCondition("");
      setShowDeviceForm(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể thêm thiết bị");
    }
  };
  
  const handleUpdateDeviceStatus = async (deviceId: number, currentStatus: string) => {
    if (currentStatus !== "AVAILABLE" && currentStatus !== "MAINTENANCE") return;
    const nextStatus = currentStatus === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
    try {
      await updateDeviceMutation.mutateAsync({ id: deviceId, req: { status: nextStatus, conditionDetails: "" } });
      toast.success("Cập nhật trạng thái thành công");
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleAdjustRentalStock = async () => {
    if (!product) return;
    const quantity = Number(rentalStockInput);
    const currentRentalStock = product.rentalQuantity ?? 0;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Số lượng kho thuê phải là số nguyên lớn hơn 0");
      return;
    }

    if (rentalStockAction === "EXPORT" && quantity > currentRentalStock) {
      toast.error(`Số lượng xuất vượt quá kho thuê hiện có (${currentRentalStock})`);
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        quantityChange: rentalStockAction === "IMPORT" ? quantity : -quantity,
        type: "RENTAL",
        reason: rentalStockReason.trim() || undefined,
      });
      toast.success(`${rentalStockAction === "IMPORT" ? "Nhập" : "Xuất"} kho thuê thành công`);
      setRentalStockInput("");
      setRentalStockReason("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể điều chỉnh kho thuê");
    }
  };

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-950 rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-500">
          Đang tải dữ liệu...
        </p>
      </div>
    );

  if (!product || error)
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 gap-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-zinc-950 tracking-tight">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-sm font-medium text-zinc-500 mt-2">
            Sản phẩm này không tồn tại hoặc đã bị xóa vĩnh viễn.
          </p>
        </div>
        <Button
          onClick={handleBack}
          variant="outline"
          className="rounded-xl px-8 h-12 font-semibold gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Button>
      </div>
    );

  const images = [
    product.mainImageUrl,
    ...(product.gallery?.map((g) => g.url) || []),
  ];
  const currentImage = activeImage || product.mainImageUrl;
  const isDeleted = !!product.deletedAt;

  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl border border-zinc-100 bg-zinc-50 text-zinc-600 hover:bg-zinc-950 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-lg">
                Mã sản phẩm #{product.id}
              </span>
              <Badge
                className={cn(
                  "rounded-dash-sm px-3 py-1 text-xs font-semibold border-0 shadow-none inline-flex items-center gap-1.5",
                  !isDeleted
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", !isDeleted ? "bg-emerald-500" : "bg-red-500")} />
                {!isDeleted ? "Hoạt động" : "Đã xóa"}
              </Badge>
            </div>
            <h1 className="text-[28px] sm:text-[30px] font-semibold text-zinc-950 tracking-tight leading-tight truncate">
              {product.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isDeleted ? (
            <>
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="flex-1 sm:flex-none h-11 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold px-6 transition-colors gap-2"
              >
                <Edit2 className="w-4 h-4" /> Chỉnh sửa
              </Button>
              <Button
                onClick={handleDelete}
                variant="ghost"
                className="flex-1 sm:flex-none h-11 rounded-xl bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white font-semibold px-6 transition-colors gap-2"
              >
                <Trash2 className="w-4 h-4" /> Vô hiệu hóa
              </Button>
            </>
          ) : (
            <Button
              onClick={handleRestore}
              variant="ghost"
              className="flex-1 sm:flex-none h-11 rounded-xl bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold px-6 transition-colors gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Khôi phục
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Gallery & Visuals */}
        <div className="xl:col-span-7 space-y-6">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shadow-sm group">
            <Image
              src={getImageUrl(currentImage)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />
            {/* Overlay Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-black/5 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-zinc-900">
                  {product.brand}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto p-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={cn(
                  "relative w-24 h-24 rounded-xl flex-shrink-0 transition-all duration-200 overflow-hidden border border-zinc-100 bg-zinc-50",
                  currentImage === img
                    ? "ring-2 ring-red-600 ring-offset-2 shadow-sm z-10"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={getImageUrl(img)}
                  alt={`Gallery ${idx}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>

          {/* Description Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-100 shadow-sm group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center border border-black/5 group-hover:bg-white transition-colors">
                <Info className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-950">
                Mô tả sản phẩm
              </h3>
            </div>
            <p className="mt-4 text-sm text-zinc-600 leading-6">
              {product.description ||
                "Chưa có mô tả chi tiết cho sản phẩm này."}
            </p>
          </div>
        </div>

        {/* Right Column: Key Info & Actions */}
        <div className="xl:col-span-5 space-y-6">
          {/* Status & Inventory Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
            <div className={cn(
              "grid gap-4",
              product.isForSale && product.isForRent ? "grid-cols-3" : "grid-cols-2"
            )}>
              {product.isForSale && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center relative group/stock">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3 group-hover/stock:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-emerald-700/80 mb-1">
                    Kho bán lẻ
                  </span>
                  <span className="text-2xl font-semibold text-emerald-950">
                    {product.quantity}{" "}
                    <span className="text-xs font-medium text-emerald-600/60">
                      máy
                    </span>
                  </span>

                  <button
                    onClick={() => setIsStockDialogOpen(true)}
                    className="mt-3 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors shadow-sm"
                  >
                    Điều chỉnh
                  </button>
                </div>
              )}

              {product.isForRent && (
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col items-center text-center relative group/rental-stock">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3 group-hover/rental-stock:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-amber-700/80 mb-1">
                    Kho cho thuê
                  </span>
                  <span className="text-2xl font-semibold text-zinc-950">
                    {product.rentalQuantity ?? 0}{" "}
                    <span className="text-xs font-medium text-amber-600/60">
                      máy
                    </span>
                  </span>

                  <button
                    onClick={() => setIsStockDialogOpen(true)}
                    className="mt-3 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-600 hover:text-white transition-colors shadow-sm"
                  >
                    Điều chỉnh
                  </button>
                </div>
              )}

              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center text-center justify-center">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-indigo-700/70 mb-1">
                  Trạng thái
                </span>
                <span className="text-sm font-semibold text-indigo-950">
                  {(!product.isForRent && product.isForSale) ? "Sẵn sàng bán" : "Sẵn sàng thuê"}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStockForm((prev) => !prev)}
                className="w-full h-11 rounded-dash-sm bg-zinc-950 text-white border-0 text-sm font-semibold shadow-dash-sm hover:bg-zinc-800 hover:shadow-dash-md transition-all duration-200 ease-in-out"
              >
                {showStockForm ? "Ẩn form chỉnh tồn kho" : "Chỉnh tồn kho trực tiếp"}
              </Button>

              {showStockForm && (
                <div className="grid gap-3">
                  <div className="rounded-dash-md border border-emerald-100 bg-emerald-50/50 p-4 space-y-4 shadow-dash-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-dash-md">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950">kho bán</h4>
                        <p className="text-xs font-medium text-emerald-700/70">
                          Nhập số lượng cần cộng thêm hoặc trừ bớt.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-white border border-emerald-100 rounded-dash-sm px-3 py-1">
                        hiện có {product.quantity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-dash-sm border border-emerald-100 bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setSaleStockAction("IMPORT")}
                        disabled={adjustStockMutation.isPending}
                        className={cn(
                          "h-9 rounded-dash-sm text-xs font-bold transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60",
                          saleStockAction === "IMPORT"
                            ? "bg-emerald-600 text-white"
                            : "text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700",
                        )}
                      >
                        nhập thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaleStockAction("EXPORT")}
                        disabled={adjustStockMutation.isPending}
                        className={cn(
                          "h-9 rounded-dash-sm text-xs font-bold transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60",
                          saleStockAction === "EXPORT"
                            ? "bg-red-600 text-white"
                            : "text-zinc-500 hover:bg-red-50 hover:text-red-600",
                        )}
                      >
                        trừ bớt
                      </button>
                    </div>

                    <label className="space-y-1 block">
                      <span className="text-xs font-semibold text-zinc-700">
                        số lượng {saleStockAction === "IMPORT" ? "nhập thêm" : "trừ bớt"}
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={saleStockInput}
                        onChange={(e) => setSaleStockInput(e.target.value)}
                        placeholder="Ví dụ: 10"
                        className="w-full h-10 px-3 rounded-dash-sm border border-emerald-100 bg-white text-sm font-semibold"
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-xs font-semibold text-zinc-700">lý do chỉnh kho bán</span>
                      <input
                        type="text"
                        value={saleStockReason}
                        onChange={(e) => setSaleStockReason(e.target.value)}
                        placeholder="Ví dụ: nhập hàng mới, hàng lỗi trả hãng"
                        className="w-full h-10 px-3 rounded-dash-sm border border-emerald-100 bg-white text-sm"
                      />
                    </label>
                    <Button
                      type="button"
                      onClick={handleAdjustSaleStock}
                      disabled={adjustStockMutation.isPending}
                      className="w-full h-10 rounded-dash-sm bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-dash-sm hover:shadow-dash-md transition-all duration-200 ease-in-out"
                    >
                      {adjustStockMutation.isPending
                        ? "Đang cập nhật..."
                        : `${saleStockAction === "IMPORT" ? "Nhập thêm" : "Trừ bớt"} kho bán`}
                    </Button>
                  </div>

                  <div className="rounded-dash-md border border-amber-100 bg-amber-50/50 p-4 space-y-4 shadow-dash-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-dash-md">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-amber-950">Quản lý kho thuê (Serial)</h4>
                        <p className="text-xs font-medium text-amber-700/70">
                          Quản lý độc lập từng thiết bị cho thuê.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-amber-700 bg-white border border-amber-100 rounded-dash-sm px-3 py-1">
                        {devices.length} máy
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                      {devices.length === 0 ? (
                        <div className="text-xs text-center py-4 text-amber-600/70">Chưa có thiết bị nào.</div>
                      ) : (
                        devices.map((d: DeviceResponse) => (
                          <div key={d.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-dash-sm p-2 text-sm">
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-900">SN: {d.serialNumber}</span>
                              <span className="text-xs text-zinc-500 line-clamp-1">{d.conditionDetails}</span>
                            </div>
                            <button
                              onClick={() => handleUpdateDeviceStatus(d.id, d.status)}
                              className={cn("text-[10px] font-bold px-2 py-1 rounded-md transition-colors", 
                                d.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                                d.status === "RENTED" ? "bg-blue-100 text-blue-700" :
                                "bg-red-100 text-red-700 hover:bg-red-200"
                              )}
                            >
                              {d.status === "AVAILABLE" ? "Sẵn sàng" : d.status === "RENTED" ? "Đang cho thuê" : "Bảo trì"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {!showDeviceForm ? (
                      <Button
                        type="button"
                        onClick={() => setShowDeviceForm(true)}
                        className="w-full h-10 rounded-dash-sm bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-dash-sm transition-all"
                      >
                        Thêm thiết bị mới
                      </Button>
                    ) : (
                      <div className="bg-white p-3 rounded-dash-sm border border-amber-200 space-y-3">
                        <label className="space-y-1 block">
                          <span className="text-xs font-semibold text-zinc-700">Số Serial</span>
                          <input
                            type="text"
                            value={deviceSerial}
                            onChange={(e) => setDeviceSerial(e.target.value)}
                            placeholder="Nhập serial..."
                            className="w-full h-9 px-3 rounded-md border border-amber-100 bg-zinc-50 text-sm font-semibold"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-semibold text-zinc-700">Tình trạng (Tùy chọn)</span>
                          <input
                            type="text"
                            value={deviceCondition}
                            onChange={(e) => setDeviceCondition(e.target.value)}
                            placeholder="Ví dụ: Mới 99%, có trầy nhẹ..."
                            className="w-full h-9 px-3 rounded-md border border-amber-100 bg-zinc-50 text-sm"
                          />
                        </label>
                        <div className="flex gap-2">
                          <Button type="button" onClick={() => setShowDeviceForm(false)} variant="outline" className="flex-1 h-9 rounded-md text-xs font-semibold border-amber-200 text-amber-700">Hủy</Button>
                          <Button type="button" onClick={handleCreateDevice} disabled={createDeviceMutation.isPending} className="flex-1 h-9 rounded-md bg-amber-600 text-white text-xs font-semibold">Lưu</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-black/5">
              <div className="flex items-center justify-between group/price">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover/price:scale-110 transition-transform border border-amber-100">
                    <Truck className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900">
                      Giá thuê mỗi ngày
                    </span>
                    <button
                      onClick={() => setIsPriceDialogOpen(true)}
                      className="text-xs font-medium text-amber-600 hover:underline text-left"
                    >
                      Điều chỉnh
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-zinc-950 leading-none mb-1">
                    {product.rentPricePerDay?.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-xs font-medium text-zinc-400">
                    VND / ngày
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/5 group/price2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover/price2:scale-110 transition-transform border border-blue-100">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900">
                      Giá bán thanh lý
                    </span>
                    <button
                      onClick={() => setIsPriceDialogOpen(true)}
                      className="text-xs font-medium text-blue-600 hover:underline text-left"
                    >
                      Điều chỉnh
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-zinc-950 leading-none mb-1">
                    {product.salePrice?.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-xs font-medium text-zinc-400">
                    Thanh toán 1 lần
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-black/5 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-semibold text-zinc-950">
                  Thông số kỹ thuật
                </h3>
              </div>
              <Badge
                variant="outline"
                className="bg-red-50 border-red-100 text-red-600 font-semibold text-xs rounded-lg"
              >
                Chi tiết
              </Badge>
            </div>

            <div className="space-y-4">
              {product.specifications?.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-700 transition-colors">
                    {spec.specKey}
                  </span>
                  <div className="flex-1 mx-4 border-b border-zinc-100 border-dashed" />
                  <span className="text-sm font-semibold text-zinc-900">
                    {spec.specValue}
                  </span>
                </div>
              ))}
              {(!product.specifications ||
                product.specifications.length === 0) && (
                <p className="text-sm font-medium text-zinc-500 text-center py-4">
                  Chưa có thông số kỹ thuật.
                </p>
              )}
            </div>
          </div>

          {/* Timeline & Audit Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-950 mb-6">
              Lịch sử hệ thống
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    Khởi tạo sản phẩm
                  </p>
                  <p className="text-xs font-medium text-zinc-500 mt-1">
                    {format(
                      new Date(product.createdAt),
                      "HH:mm, 'Ngày' dd 'tháng' MM, yyyy",
                      { locale: vi },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    Cập nhật gần nhất
                  </p>
                  <p className="text-xs font-medium text-zinc-500 mt-1">
                    {format(
                      new Date(product.updatedAt),
                      "HH:mm, 'Ngày' dd 'tháng' MM, yyyy",
                      { locale: vi },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(o) => setConfirmConfig((prev) => ({ ...prev, open: o }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
        isLoading={deleteMutation.isPending || restoreMutation.isPending}
      />
      <ProductDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={product || null}
        categories={categories}
        onSubmit={handleUpdateInfo}
        isPending={updateInfoMutation.isPending}
      />
      <StockAdjustmentDialog
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
        product={product || null}
      />
      <ProductPriceDialog
        open={isPriceDialogOpen}
        onOpenChange={setIsPriceDialogOpen}
        product={product || null}
        onSubmit={async (data) => {
          try {
            await updatePriceMutation.mutateAsync(data);
            toast.success("Cập nhật giá thành công");
            setIsPriceDialogOpen(false);
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Lỗi khi cập nhật giá");
          }
        }}
        isPending={updatePriceMutation.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-12">
        {/* Price History Section */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 sm:px-6 py-5 border-b border-zinc-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-black/5 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950">
                  Lịch sử thay đổi giá
                </h3>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Biến động giá trị
                </p>
              </div>
            </div>
            <Badge className="bg-zinc-950 text-white text-xs font-semibold px-3 py-1 rounded-lg">
              {pricePagination?.totalElements || 0}
            </Badge>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 border-b border-zinc-50">
                    Giá mới
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 border-b border-zinc-50">
                    Biến động
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 border-b border-zinc-50">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {priceHistory.map((history: PriceHistoryResponse) => (
                  <tr
                    key={history.id}
                    className="group hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-950">
                          {history.newPrice.toLocaleString()} đ
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                          {history.priceType === "RENT"
                            ? "Giá thuê"
                            : "Giá bán"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {history.changeType === "INCREASE" && (
                        <span className="text-sm font-semibold text-red-600">
                          +{history.percentChange.toFixed(1)}%
                        </span>
                      )}
                      {history.changeType === "DECREASE" && (
                        <span className="text-sm font-semibold text-emerald-600">
                          -{history.percentChange.toFixed(1)}%
                        </span>
                      )}
                      {history.changeType === "NONE" && (
                        <span className="text-xs font-medium text-zinc-400">
                          Khởi tạo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-medium text-zinc-500">
                        {format(new Date(history.createdAt), "dd/MM/yy", {
                          locale: vi,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
                {priceHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-sm font-medium text-zinc-400"
                    >
                      Chưa có lịch sử giá
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pricePagination && pricePagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-zinc-50/50 border-t border-black/5 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">
                Trang {priceHistoryPage + 1} / {pricePagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-950 transition-all duration-200 disabled:opacity-20"
                  disabled={priceHistoryPage === 0}
                  onClick={() => setPriceHistoryPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-950 transition-all duration-200 disabled:opacity-20"
                  disabled={priceHistoryPage >= pricePagination.totalPages - 1}
                  onClick={() => setPriceHistoryPage((p) => p + 1)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Inventory History Section */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 sm:px-6 py-5 border-b border-zinc-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-black/5 flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950">
                  Lịch sử kho
                </h3>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Nhập xuất thiết bị
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-lg">
              {inventoryPagination?.totalElements || 0}
            </Badge>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 border-b border-zinc-50">
                    Thay đổi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 border-b border-zinc-50">
                    Lý do
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 border-b border-zinc-50">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {inventoryLogs.map((log: InventoryAuditResponse) => {
                  const diff = log.newStock - log.oldStock;
                  return (
                    <tr
                      key={log.id}
                      className="group hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              diff > 0 ? "text-emerald-600" : "text-red-600",
                            )}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                          <span className="text-xs font-medium text-zinc-500">
                            Tồn: {log.newStock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="text-sm font-medium text-zinc-600 truncate max-w-[160px]"
                          title={log.reason}
                        >
                          {log.reason || "Không có lý do"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-medium text-zinc-500">
                          {format(new Date(log.changedAt), "dd/MM/yy", {
                            locale: vi,
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {inventoryLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-sm font-medium text-zinc-400"
                    >
                      Chưa có lịch sử kho
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {inventoryPagination && inventoryPagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-zinc-50/50 border-t border-black/5 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">
                Trang {inventoryPage + 1} / {inventoryPagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-950 transition-all duration-200 disabled:opacity-20"
                  disabled={inventoryPage === 0}
                  onClick={() => setInventoryPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-950 transition-all duration-200 disabled:opacity-20"
                  disabled={inventoryPage >= inventoryPagination.totalPages - 1}
                  onClick={() => setInventoryPage((p) => p + 1)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
