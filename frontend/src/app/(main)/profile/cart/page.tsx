"use client";

import { useState } from "react";
import {
  useMyCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "@/services/cart";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Trash2,
  Check,
  Plus,
  Minus,
  ArrowRight,
  Loader2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, formatVND } from "@/lib/utils";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function CartPage() {
  const { data: cartRes, isLoading } = useMyCart();
  const { mutateAsync: updateItem } = useUpdateCartItem();
  const { mutateAsync: removeItem } = useRemoveCartItem();
  const { mutateAsync: clearCart, isPending: isClearing } = useClearCart();
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);

  const items = cartRes?.data || [];

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((acc, item) => {
    const price = item.salePrice || item.rentPricePerDay || 0;
    return acc + price * item.quantity;
  }, 0);

  const handleUpdateQuantity = async (id: number, newQty: number) => {
    if (newQty < 1) {
      setItemToRemove(id);
      setRemoveConfirmOpen(true);
      return;
    }
    try {
      await updateItem({ id, data: { quantity: newQty } });
    } catch (error) {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setClearConfirmOpen(false);
      toast.success("Đã xóa sạch giỏ hàng");
    } catch (error) {
      toast.error("Lỗi khi xóa giỏ hàng");
    }
  };

  const handleRemoveItem = async () => {
    if (!itemToRemove) return;
    try {
      await removeItem(itemToRemove);
      setRemoveConfirmOpen(false);
      setItemToRemove(null);
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-zinc-400">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-16 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6 border border-zinc-100">
          <ShoppingCart className="w-8 h-8 text-zinc-200" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-950 tracking-tight mb-2">
          Giỏ hàng đang trống
        </h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed font-medium">
          Có vẻ như bạn chưa chọn sản phẩm nào. Hãy khám phá kho thiết bị nhiếp
          ảnh của chúng tôi ngay!
        </p>
        <Button
          onClick={() => router.push("/#product-section")}
          className="h-10 px-8 rounded-xl bg-red-600 text-white font-bold hover:bg-zinc-900 transition-all shadow-md shadow-red-100 border-none"
        >
          Khám phá thiết bị
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-all",
              selectedIds.length === items.length && items.length > 0
                ? "bg-red-600 border-red-600 text-white"
                : "border-zinc-300 hover:border-red-600 bg-white",
            )}
          >
            {selectedIds.length === items.length && items.length > 0 && (
              <Check className="w-3.5 h-3.5" />
            )}
          </button>
          <h2 className="text-2xl font-semibold text-zinc-950 tracking-tight">
            Giỏ hàng của bạn ({items.length})
          </h2>
        </div>
        <button
          onClick={() => setClearConfirmOpen(true)}
          disabled={isClearing}
          className="text-[13px] font-medium text-zinc-400 hover:text-red-600 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa toàn bộ
        </button>
      </div>

      <ConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Xóa giỏ hàng"
        description="Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng? Thao tác này không thể hoàn tác."
        onConfirm={handleClearCart}
        isLoading={isClearing}
        variant="danger"
      />

      <ConfirmDialog
        open={removeConfirmOpen}
        onOpenChange={setRemoveConfirmOpen}
        title="Xóa sản phẩm"
        description="Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không?"
        onConfirm={handleRemoveItem}
        variant="danger"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "bg-white border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 group transition-all shadow-sm",
                selectedIds.includes(item.id)
                  ? "border-red-600/40 ring-1 ring-red-600/5"
                  : "border-zinc-100",
              )}
            >
              <button
                onClick={() => toggleSelect(item.id)}
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
                  selectedIds.includes(item.id)
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-zinc-300 hover:border-red-600 bg-white",
                )}
              >
                {selectedIds.includes(item.id) && (
                  <Check className="w-3.5 h-3.5" />
                )}
              </button>

              <div className="w-24 h-24 shrink-0 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 p-2 flex items-center justify-center group-hover:bg-white transition-colors">
                {item.productImage ? (
                  <img
                    src={`http://localhost:8080${item.productImage}`}
                    alt={item.productName}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-zinc-200" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h4 className="text-[18px] font-semibold text-zinc-950 tracking-tight mb-1 truncate leading-tight">
                  {item.productName}
                </h4>
                <p className="text-sm font-normal text-zinc-500 mb-4 leading-relaxed">
                  Đơn giá:{" "}
                  {formatVND(
                    Number(item.salePrice || item.rentPricePerDay || 0),
                  )}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:bg-white hover:text-red-600 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-zinc-950">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:bg-white hover:text-red-600 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setItemToRemove(item.id);
                      setRemoveConfirmOpen(true);
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-medium text-zinc-400 mb-1">
                  Thành tiền
                </p>
                <p className="text-[20px] font-bold text-zinc-950 tracking-tight">
                  {formatVND(
                    Number(item.salePrice || item.rentPricePerDay || 0) *
                      item.quantity,
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="xl:col-span-4">
          <div className="bg-white border border-zinc-100 rounded-xl p-6 sticky top-20 shadow-sm overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[20px] font-semibold tracking-tight text-zinc-950 mb-6">
                Tổng đơn hàng
              </h3>

              <div className="space-y-4 mb-8 pb-6 border-b border-zinc-100">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-normal text-sm">
                    Tạm tính
                  </span>
                  <span className="font-medium text-zinc-950 text-[15px]">
                    {formatVND(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-normal text-sm">
                    Phí vận chuyển
                  </span>
                  <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-md">
                    Miễn phí
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-normal text-sm">
                    Bảo hiểm thiết bị
                  </span>
                  <span className="font-medium text-zinc-950 text-[15px]">
                    Đã bao gồm
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-zinc-400 text-[11px] font-semibold mb-1.5">
                    Tổng thanh toán
                  </p>
                  <p className="text-[28px] font-bold tracking-tight text-red-600 leading-none">
                    {formatVND(subtotal)}
                  </p>
                </div>
              </div>

              <Button
                disabled={selectedIds.length === 0}
                onClick={() =>
                  router.push(`/checkout?cartItemIds=${selectedIds.join(",")}`)
                }
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-zinc-950 text-white font-black text-sm transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 border-none group/btn disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Tiếp tục thanh toán ({selectedIds.length})
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>

              <p className="mt-6 text-center text-[11px] text-zinc-500 font-medium leading-relaxed">
                Bằng cách tiếp tục, bạn đồng ý với các <br />
                <span className="text-zinc-400 underline cursor-pointer hover:text-zinc-950 transition-colors">
                  Điều khoản dịch vụ
                </span>{" "}
                của LensHub.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
