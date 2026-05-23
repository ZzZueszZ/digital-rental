"use client";

import { useState } from "react";
import {
  Package,
  MapPin,
  CreditCard,
  CheckCircle2,
  X,
  Loader2,
  Calendar,
  FileText,
  FilePenLine,
  User,
  ShieldCheck
} from "lucide-react";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, formatVND, formatDate } from "@/lib/utils";
import {
  RentalOrderStatus,
  useRentalDetail,
  useSignContract,
  usePayDeposit
} from "@/services/rental";

interface RentalDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: number;
}

export function RentalDetailDialog({
  isOpen,
  onClose,
  rentalId
}: RentalDetailDialogProps) {
  const { data: rentalRes, isLoading } = useRentalDetail(rentalId);
  const { mutateAsync: signContract, isPending: isSigning } = useSignContract();
  const { mutateAsync: payDeposit, isPending: isPaying } = usePayDeposit();

  const [signatureText, setSignatureText] = useState("");
  const [showSignForm, setShowSignForm] = useState(false);

  const rental = rentalRes?.data;

  const handlePayDeposit = async () => {
    try {
      await payDeposit(rentalId);
      toast.success("Thanh toán tiền đặt cọc thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi thanh toán");
    }
  };

  const handleSignContract = async () => {
    if (!signatureText.trim()) {
      toast.error("Vui lòng nhập tên của bạn để ký hợp đồng");
      return;
    }
    try {
      await signContract({ id: rentalId, signature: signatureText });
      toast.success("Đã ký hợp đồng điện tử thành công!");
      setShowSignForm(false);
      setSignatureText("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi ký hợp đồng");
    }
  };

  const getStatusColor = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_APPROVAL:
        return "bg-amber-50 text-amber-600 border-amber-100";
      case RentalOrderStatus.REJECTED:
        return "bg-red-50 text-red-600 border-red-100";
      case RentalOrderStatus.PENDING_PAYMENT:
        return "bg-amber-100 text-amber-700 border-amber-200";
      case RentalOrderStatus.PAID_DEPOSIT:
        return "bg-blue-50 text-blue-600 border-blue-100";
      case RentalOrderStatus.CONTRACT_SIGNED:
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case RentalOrderStatus.DEVICE_HANDED_OVER:
        return "bg-purple-50 text-purple-600 border-purple-100";
      case RentalOrderStatus.RETURNED:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case RentalOrderStatus.COMPLETED:
        return "bg-emerald-600 text-white border-emerald-600";
      case RentalOrderStatus.CANCELED:
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-500 border-zinc-100";
    }
  };

  const getStatusLabel = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_APPROVAL:
        return "Chờ duyệt thuê";
      case RentalOrderStatus.REJECTED:
        return "Từ chối thuê";
      case RentalOrderStatus.PENDING_PAYMENT:
        return "Chờ thanh toán cọc";
      case RentalOrderStatus.PAID_DEPOSIT:
        return "Đã cọc - Chờ ký HĐ";
      case RentalOrderStatus.CONTRACT_SIGNED:
        return "Đã ký HĐ - Chờ nhận máy";
      case RentalOrderStatus.DEVICE_HANDED_OVER:
        return "Đang thuê";
      case RentalOrderStatus.RETURNED:
        return "Đã trả máy - Quyết toán";
      case RentalOrderStatus.COMPLETED:
        return "Hoàn tất";
      case RentalOrderStatus.CANCELED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <AdminFormDialog
      open={isOpen}
      onOpenChange={onClose}
      title={rental ? `Chi tiết đơn thuê #${rental.code}` : "Đang tải..."}
      description="Xem thông tin chi tiết về hợp đồng, tình trạng thiết bị bàn giao và hoàn cọc"
      icon={Package}
      onSubmit={(e) => e.preventDefault()}
      isPending={isLoading}
      submitText="Đóng"
      submitIcon={X}
      maxWidth="max-w-2xl"
      hideFooter={true}
    >
      {isLoading ? (
        <div className="py-20 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
          <p className="text-xs font-semibold text-zinc-400">
            Đang truy xuất dữ liệu...
          </p>
        </div>
      ) : rental ? (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
          {/* Header Status Bar */}
          <div className="flex items-center justify-between p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "px-3 py-1 rounded-xl text-[13px] font-bold border",
                  getStatusColor(rental.status)
                )}
              >
                {getStatusLabel(rental.status)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 leading-none mb-1">
                  Phương thức cọc
                </span>
                <span className="text-xs font-bold text-zinc-600">
                  {rental.paymentMethod === "ONLINE" ? "VNPay Online" : "Tiền mặt / COD"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 block mb-1">
                Thời gian thuê
              </span>
              <span className="text-xs font-bold text-zinc-950 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {rental.startDate.split("T")[0]} &rarr; {rental.endDate.split("T")[0]}
              </span>
            </div>
          </div>

          {/* Items & Physical Device info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-900">
                Sản phẩm đăng ký thuê
              </h3>
            </div>
            <div className="space-y-3">
              {rental.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white border border-zinc-100 rounded-xl space-y-3"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 p-1 flex items-center justify-center border border-zinc-100 overflow-hidden shrink-0">
                      <img
                        src={item.productMainImageUrl || "/placeholder-camera.jpg"}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-950 truncate leading-tight">
                        {item.productName}
                      </h4>
                      <p className="text-xs font-medium text-zinc-500 mt-1">
                        Giá thuê: {formatVND(item.pricePerDay)}/ngày
                      </p>
                    </div>
                  </div>

                  {/* Physical Device detail if assigned */}
                  {item.deviceSerialNumber && (
                    <div className="p-3 bg-zinc-50 rounded-lg space-y-2 text-xs border border-black/5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-500">Số Serial gán máy:</span>
                        <span className="font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-black/5">{item.deviceSerialNumber}</span>
                      </div>
                      {item.conditionBeforeHandover && (
                        <div className="flex justify-between items-start pt-1">
                          <span className="font-semibold text-zinc-500">Tình trạng bàn giao:</span>
                          <span className="font-semibold text-amber-700 text-right">{item.conditionBeforeHandover}</span>
                        </div>
                      )}
                      {item.conditionAfterReturn && (
                        <div className="flex justify-between items-start pt-1 border-t border-dashed border-zinc-200">
                          <span className="font-semibold text-zinc-500">Tình trạng lúc trả:</span>
                          <span className="font-semibold text-zinc-800 text-right">{item.conditionAfterReturn}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Billing Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Địa chỉ nhận máy
                </h3>
              </div>
              <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400">
                    Người nhận máy
                  </p>
                  <p className="text-xs font-bold text-zinc-900">
                    {rental.shippingName} • {rental.shippingPhone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400">Địa chỉ</p>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                    {rental.shippingAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Deposit Status Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Tình trạng đặt cọc
                </h3>
              </div>
              <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400">Trạng thái cọc</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase border",
                      rental.paymentStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    )}
                  >
                    {rental.paymentStatus === "PAID" ? "Đã đặt cọc" : "Chưa cọc"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50">
                  <span className="text-[10px] font-bold text-zinc-400">Hoàn tiền cọc</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase border",
                      rental.refundStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-zinc-50 text-zinc-500 border-zinc-100"
                    )}
                  >
                    {rental.refundStatus === "PAID" ? "Đã hoàn trả" : "Chưa hoàn"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="p-5 bg-white border border-zinc-100 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
            <div className="space-y-2.5 relative z-10">
              <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <span>Phí thuê cơ bản:</span>
                <span className="text-zinc-950 font-bold">
                  {formatVND(rental.rentalFee)}
                </span>
              </div>
              {rental.additionalFee > 0 && (
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>Phụ phí phát sinh (trễ/hỏng):</span>
                  <span className="text-red-500 font-bold">
                    +{formatVND(rental.additionalFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <span>Tiền cọc thiết bị (đã đóng):</span>
                <span className="text-amber-600 font-bold">
                  {formatVND(rental.depositAmount)}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 mb-0.5">
                  Tổng chi phí thuê thiết bị
                </p>
                <p className="text-[22px] font-bold text-red-600 tracking-tight leading-none">
                  {formatVND(rental.rentalFee + rental.additionalFee)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600">
                  Giao dịch an toàn
                </span>
              </div>
            </div>
          </div>

          {/* Electronic Rental Contract Section */}
          {rental.contract && (
            <div className="p-5 bg-zinc-50 rounded-2xl border border-black/5 space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-800">Hợp đồng điện tử: {rental.contract.contractNumber}</span>
                </div>
                {rental.contract.isLocked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                    <ShieldCheck className="w-3 h-3" /> Đã ký điện tử
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">
                    Chờ ký
                  </span>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg border border-black/5 text-[11px] font-medium text-zinc-500 whitespace-pre-line max-h-40 overflow-y-auto no-scrollbar font-mono leading-relaxed">
                {rental.contract.termsAndConditions}
              </div>

              {rental.contract.isLocked ? (
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 pt-2">
                  <span>Chữ ký bên thuê:</span>
                  <span className="font-bold text-zinc-950 font-mono italic underline">{rental.contract.customerSignature}</span>
                </div>
              ) : (
                !showSignForm && (
                  <Button
                    onClick={() => setShowSignForm(true)}
                    className="w-full h-11 bg-red-600 hover:bg-zinc-950 text-white font-bold text-xs rounded-xl transition-all border-none"
                  >
                    <FilePenLine className="w-4 h-4 mr-2" /> Tiến hành ký hợp đồng online
                  </Button>
                )
              )}

              {showSignForm && (
                <div className="space-y-3 pt-2 border-t border-black/5 animate-in slide-in-from-bottom-2 duration-300">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    Ký xác nhận (Nhập Họ tên đầy đủ của bạn)
                  </label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thành Đạt"
                    className="w-full h-10 px-3 rounded-xl border border-black/5 bg-white text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-950"
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowSignForm(false)}
                      className="flex-1 h-10 rounded-xl text-xs font-bold"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={handleSignContract}
                      disabled={isSigning}
                      className="flex-1 h-10 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-red-600"
                    >
                      {isSigning ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Xác nhận ký"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {rental.status === RentalOrderStatus.PENDING_PAYMENT && (
            <div className="pt-2">
              <Button
                onClick={handlePayDeposit}
                disabled={isPaying}
                className="w-full h-12 rounded-2xl bg-amber-600 hover:bg-zinc-950 text-white font-black text-xs uppercase transition-all shadow-lg border-none"
              >
                {isPaying ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Thanh toán tiền đặt cọc ({formatVND(rental.depositAmount)})
              </Button>
              <p className="text-[10px] text-center text-zinc-400 font-bold mt-3 uppercase tracking-widest leading-relaxed">
                * Đây là môi trường thử nghiệm. Tiền cọc sẽ được chuyển trạng thái PAID ngay lập tức.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </AdminFormDialog>
  );
}
