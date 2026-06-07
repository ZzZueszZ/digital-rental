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
  ShieldCheck,
  Download
} from "lucide-react";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, formatVND, formatDate, getImageUrl } from "@/lib/utils";
import {
  RentalOrderStatus,
  useRentalDetail,
  useSignContract,
  useStaffRentalDetail,
  useSendSigningOtp
} from "@/services/rental";

interface RentalDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: number;
  hideSignAction?: boolean;
  portalType?: "customer" | "admin" | "staff" | "super-admin";
}

export function RentalDetailDialog({
  isOpen,
  onClose,
  rentalId,
  hideSignAction = false,
  portalType = "customer"
}: RentalDetailDialogProps) {
  const isStaffPortal = portalType === "admin" || portalType === "staff" || portalType === "super-admin";

  const customerDetailQuery = useRentalDetail(!isStaffPortal ? rentalId : 0);
  const staffDetailQuery = useStaffRentalDetail(isStaffPortal ? rentalId : 0);

  const rentalRes = isStaffPortal ? staffDetailQuery.data : customerDetailQuery.data;
  const isLoading = isStaffPortal ? staffDetailQuery.isLoading : customerDetailQuery.isLoading;

  const { mutateAsync: signContract, isPending: isSigning } = useSignContract();
  const { mutateAsync: sendSigningOtp, isPending: isSendingOtp } = useSendSigningOtp();
  const rental = rentalRes?.data;
  const [showSignForm, setShowSignForm] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const handleOpenSignForm = async () => {
    try {
      await sendSigningOtp(rentalId);
      toast.success("Mã OTP đã được gửi về email của bạn!");
      setShowSignForm(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi gửi mã OTP. Vui lòng thử lại.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendSigningOtp(rentalId);
      toast.success("Đã gửi lại mã OTP mới về email của bạn!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi gửi mã OTP. Vui lòng thử lại.");
    }
  };

  const handleDownloadPDF = () => {
    if (!rental || !rental.contract) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Vui lòng cho phép mở popup để tải hợp đồng");
      return;
    }
    
    const terms = rental.contract.termsAndConditions || "";
    const signature = rental.contract.contractHash || "";
    const signedAtStr = rental.contract.signedAt ? formatDate(rental.contract.signedAt) : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Hop_Dong_Thue_${rental.code}</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              padding: 40px;
              color: #000;
              line-height: 1.6;
              font-size: 14px;
            }
            .header-national {
              text-align: center;
              font-weight: bold;
              margin-bottom: 30px;
            }
            .header-title {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              text-transform: uppercase;
            }
            .contract-info {
              margin-bottom: 20px;
              font-style: italic;
              text-align: center;
            }
            .content-box {
              white-space: pre-wrap;
              margin-bottom: 40px;
              text-align: justify;
            }
            .signatures-container {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature-col {
              width: 45%;
              text-align: center;
            }
            .signature-title {
              font-weight: bold;
              margin-bottom: 15px;
            }
            .signature-box {
              border: 2px dashed #059669;
              background-color: #ecfdf5;
              color: #047857;
              padding: 15px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: bold;
              min-height: 70px;
            }
            .signature-box.lessor {
              border-color: #dc2626;
              background-color: #fef2f2;
              color: #b91c1c;
            }
            .signature-box.unassigned {
              border-color: #d1d5db;
              background-color: #f9fafb;
              color: #6b7280;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-national">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
            Độc lập - Tự do - Hạnh phúc<br>
            --------------------------
          </div>
          
          <div class="header-title">HỢP ĐỒNG THUÊ THIẾT BỊ ĐIỆN TỬ</div>
          <div class="contract-info">Số: ${rental.contract.contractNumber}</div>

          <div class="content-box">
            ${terms}
          </div>

          <div class="signatures-container">
            <div class="signature-col">
              <div class="signature-title">BÊN CHO THUÊ (Ký tên)</div>
              <div class="signature-box lessor">
                ĐÃ KÝ ĐIỆN TỬ<br>
                Đại diện: ${rental.contract.lessorSignature || "Digital Rental"}<br>
                Thời gian: ${rental.contract.lessorSignedAt ? formatDate(rental.contract.lessorSignedAt) : (signedAtStr || formatDate(rental.contract.generatedAt || new Date().toISOString()))}
              </div>
            </div>
            <div class="signature-col">
              <div class="signature-title">BÊN THUÊ (Ký tên)</div>
              ${(rental.contract.isLocked || rental.contract.locked) ? `
                <div class="signature-box">
                  ĐÃ KÝ ĐIỆN TỬ<br>
                  Khách hàng: ${signature}<br>
                  Thời gian: ${signedAtStr}
                </div>
              ` : `
                <div class="signature-box unassigned" style="display: flex; align-items: center; justify-content: center;">
                  CHƯA KÝ TRỰC TUYẾN
                </div>
              `}
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadHandoverPDF = () => {
    if (!rental || !rental.handoverReport) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Vui lòng cho phép mở popup để tải biên bản bàn giao");
      return;
    }

    const itemsHtml = rental.items.map(item => `
      <tr>
        <td style="border: 1px solid #000; padding: 8px;">${item.productName}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.deviceSerialNumber || "N/A"}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatVND(item.pricePerDay)}/ngày</td>
        <td style="border: 1px solid #000; padding: 8px;">${item.conditionBeforeHandover || "Bình thường"}</td>
      </tr>
    `).join("");

    const signedAtStr = rental.handoverReport.createdAt ? formatDate(rental.handoverReport.createdAt) : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Bien_Ban_Ban_Giao_${rental.code}</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              padding: 40px;
              color: #000;
              line-height: 1.6;
              font-size: 14px;
            }
            .header-national {
              text-align: center;
              font-weight: bold;
              margin-bottom: 30px;
            }
            .header-title {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              text-transform: uppercase;
            }
            .report-info {
              margin-bottom: 20px;
              font-style: italic;
              text-align: center;
            }
            .section-title {
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .info-table td {
              padding: 8px;
              vertical-align: top;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th {
              background-color: #f3f4f6;
              font-weight: bold;
              border: 1px solid #000;
            }
            .signatures-container {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature-col {
              width: 45%;
              text-align: center;
            }
            .signature-title {
              font-weight: bold;
              margin-bottom: 60px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-national">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
            Độc lập - Tự do - Hạnh phúc<br>
            --------------------------
          </div>
          
          <div class="header-title">BIÊN BẢN BÀN GIAO THIẾT BỊ VẬT LÝ</div>
          <div class="report-info">Mã biên bản: ${rental.handoverReport.serialNumber} • Ngày lập: ${signedAtStr}</div>

          <div class="section-title">1. Thông tin đơn thuê</div>
          <table class="info-table">
            <tr>
              <td style="width: 25%;">Mã đơn thuê:</td>
              <td style="font-weight: bold;">#${rental.code}</td>
              <td style="width: 25%;">Thời hạn thuê:</td>
              <td>Từ ${rental.startDate.split("T")[0]} đến ${rental.endDate.split("T")[0]}</td>
            </tr>
            <tr>
              <td>Khách hàng:</td>
              <td style="font-weight: bold;">${rental.shippingName}</td>
              <td>Số điện thoại:</td>
              <td>${rental.shippingPhone}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>${rental.userEmail}</td>
              <td>Địa chỉ nhận máy:</td>
              <td>${rental.shippingAddress}</td>
            </tr>
          </table>

          <div class="section-title">2. Thông tin bàn giao thiết bị</div>
          <table class="info-table">
            <tr>
              <td style="width: 25%;">Nhân viên bàn giao:</td>
              <td style="font-weight: bold;">${rental.handoverReport.staffName || "N/A"}</td>
              <td style="width: 25%;">Đánh giá rủi ro (CIC):</td>
              <td style="font-weight: bold;">${rental.handoverReport.riskLevel}</td>
            </tr>
            <tr>
              <td>Tiền cọc thiết bị:</td>
              <td style="font-weight: bold; color: #b45309;">${formatVND(rental.handoverReport.finalDepositAmount)}</td>
              <td>Ghi chú:</td>
              <td>${rental.handoverReport.note || "Không có ghi chú"}</td>
            </tr>
          </table>

          <div class="section-title">3. Danh sách thiết bị bàn giao</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="border: 1px solid #000; padding: 8px;">Tên sản phẩm</th>
                <th style="border: 1px solid #000; padding: 8px; width: 20%;">Số Serial</th>
                <th style="border: 1px solid #000; padding: 8px; width: 20%;">Đơn giá thuê</th>
                <th style="border: 1px solid #000; padding: 8px; width: 30%;">Tình trạng bàn giao</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="signatures-container">
            <div class="signature-col">
              <div class="signature-title">Đại diện Khách hàng<br>(Ký & ghi rõ họ tên)</div>
              <div style="font-style: italic; color: #555;">(Đã ký trực tuyến qua Hợp đồng số ${rental.contract?.contractNumber || "N/A"})</div>
            </div>
            <div class="signature-col">
              <div class="signature-title">Đại diện Nhân viên bàn giao<br>(Ký & ghi rõ họ tên)</div>
              <div style="font-weight: bold; margin-top: 20px;">${rental.handoverReport.staffName || ""}</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadReturnPDF = () => {
    if (!rental || !rental.returnReport) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Vui lòng cho phép mở popup để tải biên bản trả máy");
      return;
    }

    const itemsHtml = rental.items.map(item => `
      <tr>
        <td style="border: 1px solid #000; padding: 8px;">${item.productName}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.deviceSerialNumber || "N/A"}</td>
        <td style="border: 1px solid #000; padding: 8px;">${item.conditionBeforeHandover || "Bình thường"}</td>
        <td style="border: 1px solid #000; padding: 8px;">${item.conditionAfterReturn || "Bình thường"}</td>
      </tr>
    `).join("");

    const returnDateStr = rental.returnReport.returnDate ? formatDate(rental.returnReport.returnDate) : "";
    const createdAtStr = rental.returnReport.createdAt ? formatDate(rental.returnReport.createdAt) : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Bien_Ban_Nhan_Tra_${rental.code}</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              padding: 40px;
              color: #000;
              line-height: 1.6;
              font-size: 14px;
            }
            .header-national {
              text-align: center;
              font-weight: bold;
              margin-bottom: 30px;
            }
            .header-title {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              text-transform: uppercase;
            }
            .report-info {
              margin-bottom: 20px;
              font-style: italic;
              text-align: center;
            }
            .section-title {
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .info-table td {
              padding: 8px;
              vertical-align: top;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th {
              background-color: #f3f4f6;
              font-weight: bold;
              border: 1px solid #000;
            }
            .signatures-container {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature-col {
              width: 45%;
              text-align: center;
            }
            .signature-title {
              font-weight: bold;
              margin-bottom: 60px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-national">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
            Độc lập - Tự do - Hạnh phúc<br>
            --------------------------
          </div>
          
          <div class="header-title">BIÊN BẢN NHẬN TRẢ THIẾT BỊ VẬT LÝ</div>
          <div class="report-info">Ngày lập: ${createdAtStr}</div>

          <div class="section-title">1. Thông tin đơn thuê</div>
          <table class="info-table">
            <tr>
              <td style="width: 25%;">Mã đơn thuê:</td>
              <td style="font-weight: bold;">#${rental.code}</td>
              <td style="width: 25%;">Thời hạn thuê:</td>
              <td>Từ ${rental.startDate.split("T")[0]} đến ${rental.endDate.split("T")[0]}</td>
            </tr>
            <tr>
              <td>Khách hàng:</td>
              <td style="font-weight: bold;">${rental.shippingName}</td>
              <td>Số điện thoại:</td>
              <td>${rental.shippingPhone}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>${rental.userEmail}</td>
              <td>Địa chỉ nhận máy:</td>
              <td>${rental.shippingAddress}</td>
            </tr>
          </table>

          <div class="section-title">2. Thông tin nhận trả & Quyết toán</div>
          <table class="info-table">
            <tr>
              <td style="width: 25%;">Nhân viên nhận trả:</td>
              <td style="font-weight: bold;">${rental.returnReport.staffName || "N/A"}</td>
              <td style="width: 25%;">Ngày trả thực tế:</td>
              <td>${returnDateStr}</td>
            </tr>
            <tr>
              <td>Số ngày quá hạn:</td>
              <td style="font-weight: bold;">${rental.returnReport.lateDays} ngày</td>
              <td>Tiền cọc ban đầu:</td>
              <td style="font-weight: bold;">${formatVND(rental.finalDepositAmount ?? 0)}</td>
            </tr>
            <tr>
              <td>Phí trễ hạn:</td>
              <td style="color: #dc2626; font-weight: bold;">${formatVND(rental.returnReport.lateFee)}</td>
              <td>Phí hỏng hóc phát sinh:</td>
              <td style="color: #dc2626; font-weight: bold;">${formatVND(rental.returnReport.damageFee)}</td>
            </tr>
            <tr>
              <td>Phí thiếu phụ kiện:</td>
              <td style="color: #dc2626; font-weight: bold;">${formatVND(rental.returnReport.missingAccessoryFee)}</td>
              <td>Tổng phí phạt phát sinh:</td>
              <td style="color: #dc2626; font-weight: bold;">${formatVND(rental.returnReport.totalPenalty)}</td>
            </tr>
            <tr>
              <td>Số tiền hoàn trả khách:</td>
              <td style="color: #16a34a; font-weight: bold; font-size: 16px;">${formatVND(rental.returnReport.refundAmount)}</td>
              <td>Khách phải đóng thêm:</td>
              <td style="color: #dc2626; font-weight: bold; font-size: 16px;">${formatVND(rental.returnReport.extraPaymentAmount)}</td>
            </tr>
            <tr>
              <td>Ghi chú:</td>
              <td colspan="3">${rental.returnReport.note || "Không có ghi chú"}</td>
            </tr>
          </table>

          <div class="section-title">3. Tình trạng thiết bị khi nhận trả</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="border: 1px solid #000; padding: 8px;">Tên sản phẩm</th>
                <th style="border: 1px solid #000; padding: 8px; width: 20%;">Số Serial</th>
                <th style="border: 1px solid #000; padding: 8px; width: 30%;">Tình trạng lúc bàn giao</th>
                <th style="border: 1px solid #000; padding: 8px; width: 30%;">Tình trạng lúc trả</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="signatures-container">
            <div class="signature-col">
              <div class="signature-title">Đại diện Khách hàng<br>(Ký & ghi rõ họ tên)</div>
            </div>
            <div class="signature-col">
              <div class="signature-title">Đại diện Nhân viên nhận trả<br>(Ký & ghi rõ họ tên)</div>
              <div style="font-weight: bold; margin-top: 20px;">${rental.returnReport.staffName || ""}</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSignContract = async () => {
    if (!signatureText.trim()) {
      toast.error("Vui lòng nhập tên của bạn để ký hợp đồng");
      return;
    }
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số hợp lệ");
      return;
    }
    try {
      await signContract({ id: rentalId, signature: signatureText, otpCode });
      toast.success("Đã ký hợp đồng điện tử thành công!");
      setShowSignForm(false);
      setSignatureText("");
      setOtpCode("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi ký hợp đồng");
    }
  };

  const getStatusColor = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_PAYMENT:
        return "bg-amber-100 text-amber-700 border-amber-200";
      case RentalOrderStatus.PAID_RENTAL_FEE:
        return "bg-blue-50 text-blue-600 border-blue-100";
      case RentalOrderStatus.WAITING_PICKUP:
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case RentalOrderStatus.RENTING:
        return "bg-purple-50 text-purple-600 border-purple-100";
      case RentalOrderStatus.RETURNED:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case RentalOrderStatus.COMPLETED:
        return "bg-emerald-600 text-white border-emerald-600";
      case RentalOrderStatus.CANCELLED:
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-500 border-zinc-100";
    }
  };

  const getStatusLabel = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_PAYMENT:
        return "Chờ thanh toán phí thuê";
      case RentalOrderStatus.PAID_RENTAL_FEE:
        return "Đã TT phí thuê";
      case RentalOrderStatus.WAITING_PICKUP:
        return "Chờ nhận máy (ký HĐ/cọc)";
      case RentalOrderStatus.RENTING:
        return "Đang thuê";
      case RentalOrderStatus.RETURNED:
        return "Đã trả máy - Quyết toán";
      case RentalOrderStatus.COMPLETED:
        return "Hoàn tất";
      case RentalOrderStatus.CANCELLED:
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
                        src={getImageUrl(item.productMainImageUrl) || "/placeholder-camera.jpg"}
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
                    rental.depositStatus === "PAID" || rental.depositStatus === "PARTIALLY_DEDUCTED" || rental.depositStatus === "FULLY_DEDUCTED" || rental.depositStatus === "REFUNDED"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    )}
                  >
                    {rental.depositStatus === "PAID" || rental.depositStatus === "PARTIALLY_DEDUCTED" || rental.depositStatus === "FULLY_DEDUCTED" || rental.depositStatus === "REFUNDED"
                      ? "Đã đặt cọc"
                      : "Chưa cọc"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50">
                  <span className="text-[10px] font-bold text-zinc-400">Hoàn tiền cọc</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase border",
                      rental.refundStatus === "SUCCESS"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-zinc-50 text-zinc-500 border-zinc-100"
                    )}
                  >
                    {rental.refundStatus === "SUCCESS" ? "Đã hoàn trả" : "Chưa hoàn"}
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
                <span>Tiền cọc thiết bị (dự kiến/đã đóng):</span>
                <span className="text-amber-600 font-bold">
                  {formatVND(rental.finalDepositAmount ?? rental.estimatedDepositAmount ?? 0)}
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
                {(rental.contract.isLocked || rental.contract.locked) ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                    <ShieldCheck className="w-3 h-3" /> {rental.contract.contractHash === "OFFLINE_PHYSICAL_SIGNATURE" ? "Đã ký (HĐ Giấy)" : "Đã ký điện tử"}
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

              {(rental.contract.isLocked || rental.contract.locked) ? (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                    <span>{rental.contract.contractHash === "OFFLINE_PHYSICAL_SIGNATURE" ? "Hình thức ký:" : "Chữ ký bên thuê:"}</span>
                    <span className="font-bold text-zinc-950 font-mono italic underline text-right truncate max-w-[200px]" title={rental.contract.contractHash}>
                      {rental.contract.contractHash === "OFFLINE_PHYSICAL_SIGNATURE" ? "Ký trực tiếp tại cửa hàng (Bản giấy)" : rental.contract.contractHash}
                    </span>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Tải file hợp đồng (PDF)
                  </Button>
                </div>
              ) : (
                !showSignForm && !hideSignAction && (
                  <Button
                    onClick={handleOpenSignForm}
                    disabled={isSendingOtp}
                    className="w-full h-11 bg-red-600 hover:bg-zinc-950 text-white font-bold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FilePenLine className="w-4 h-4" />
                    )}
                    Tiến hành ký hợp đồng online
                  </Button>
                )
              )}

              {showSignForm && !hideSignAction && (
                <div className="space-y-3 pt-2 border-t border-black/5 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-zinc-50 border border-black/5 p-3 rounded-xl space-y-1">
                    <p className="text-[10px] font-semibold text-zinc-600">
                      Mã xác thực OTP đã được gửi đến email đăng ký của bạn. Vui lòng nhập mã OTP và Họ tên để hoàn tất ký hợp đồng.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                      Ký xác nhận (Nhập Họ tên đầy đủ của bạn)
                    </label>
                    <input
                      type="text"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Thành Đạt"
                      className="w-full h-10 px-3 rounded-xl border border-black/5 bg-white text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                        Mã OTP xác thực email
                      </label>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp}
                        className="text-[10px] font-bold text-red-600 hover:underline disabled:text-zinc-400"
                      >
                        {isSendingOtp ? "Đang gửi..." : "Gửi lại OTP"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Nhập mã OTP 6 chữ số"
                      className="w-full h-10 px-3 rounded-xl border border-black/5 bg-white text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-950 text-center tracking-[0.25em]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSignForm(false);
                        setOtpCode("");
                      }}
                      className="flex-1 h-10 rounded-xl text-xs font-bold"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={handleSignContract}
                      disabled={isSigning}
                      className="flex-1 h-10 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-red-600 flex items-center justify-center"
                    >
                      {isSigning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận ký"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Handover Report Section */}
          {rental.handoverReport && (
            <div className="p-5 bg-zinc-50 rounded-2xl border border-black/5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-zinc-800">Biên bản bàn giao: {rental.handoverReport.serialNumber}</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                  Đã bàn giao
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-600">
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wider">Nhân viên bàn giao</span>
                  <span className="font-bold text-zinc-900">{rental.handoverReport.staffName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wider">Tiền cọc thực tế</span>
                  <span className="font-bold text-amber-600">{formatVND(rental.handoverReport.finalDepositAmount)}</span>
                </div>
              </div>
              <Button
                onClick={handleDownloadHandoverPDF}
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Tải biên bản bàn giao (PDF)
              </Button>
            </div>
          )}

          {/* Return Report Section */}
          {rental.returnReport && (
            <div className="p-5 bg-zinc-50 rounded-2xl border border-black/5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-zinc-800">Biên bản nhận trả máy</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                  Đã nhận trả
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-600">
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wider">Nhân viên nhận trả</span>
                  <span className="font-bold text-zinc-900">{rental.returnReport.staffName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wider">Phí phạt & trễ hạn</span>
                  <span className="font-bold text-red-600">{formatVND(rental.returnReport.totalPenalty)}</span>
                </div>
              </div>
              <Button
                onClick={handleDownloadReturnPDF}
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Tải biên bản trả máy (PDF)
              </Button>
            </div>
          )}

          {/* Action buttons removed */}
        </div>
      ) : null}
    </AdminFormDialog>
  );
}
