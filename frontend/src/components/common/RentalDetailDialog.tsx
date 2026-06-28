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
  ShieldCheck,
  Download,
} from "lucide-react";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, formatVND, formatDate, getImageUrl } from "@/lib/utils";
import {
  RentalOrderStatus,
  useRentalDetail,
  rentalService,
  useSignContract,
  useStaffRentalDetail,
  useSendSigningOtp,
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
  portalType = "customer",
}: RentalDetailDialogProps) {
  const isStaffPortal =
    portalType === "admin" ||
    portalType === "staff" ||
    portalType === "super-admin";

  const customerDetailQuery = useRentalDetail(!isStaffPortal ? rentalId : 0);
  const staffDetailQuery = useStaffRentalDetail(isStaffPortal ? rentalId : 0);

  const rentalRes = isStaffPortal
    ? staffDetailQuery.data
    : customerDetailQuery.data;
  const isLoading = isStaffPortal
    ? staffDetailQuery.isLoading
    : customerDetailQuery.isLoading;

  const { mutateAsync: signContract, isPending: isSigning } = useSignContract();
  const { mutateAsync: sendSigningOtp, isPending: isSendingOtp } =
    useSendSigningOtp();
  const rental = rentalRes?.data;
  const [showSignForm, setShowSignForm] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const canSignOnline =
    !!rental &&
    rental.status === RentalOrderStatus.WAITING_PICKUP &&
    rental.items.every((item) => !!item.deviceId);
  const isWaitingForPreparation =
    !!rental &&
    rental.status === RentalOrderStatus.PAID_RENTAL_FEE &&
    !(rental.contract?.isLocked || rental.contract?.locked);

  const escapeHtml = (value?: string | null) =>
    (value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const parseDateOnly = (value?: string | null) => {
    if (!value) return null;
    const [year, month, day] = value.split("T")[0].split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const calculateInclusiveRentalDays = (
    startDate?: string | null,
    endDate?: string | null,
  ) => {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (!start || !end) return 1;

    const dayMs = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((end.getTime() - start.getTime()) / dayMs) + 1;
    return Math.max(1, diffDays);
  };

  const handleRetryPayment = async () => {
    try {
      setIsRetryingPayment(true);
      const response = await rentalService.createVnPayUrl(rentalId);
      window.location.assign(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo lại phiên thanh toán phí thuê. Vui lòng thử lại.",
      );
      setIsRetryingPayment(false);
    }
  };

  const handleOpenSignForm = async () => {
    if (!canSignOnline) {
      toast.error(
        "Đơn thuê cần được nhân viên chuẩn bị và gán thiết bị trước khi ký hợp đồng.",
      );
      return;
    }
    try {
      await sendSigningOtp(rentalId);
      toast.success("Mã OTP đã được gửi về email của bạn!");
      setShowSignForm(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Lỗi gửi mã OTP. Vui lòng thử lại.",
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendSigningOtp(rentalId);
      toast.success("Đã gửi lại mã OTP mới về email của bạn!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Lỗi gửi mã OTP. Vui lòng thử lại.",
      );
    }
  };

  const handleDownloadPDF = () => {
    if (!rental || !rental.contract) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Vui lòng cho phép mở popup để tải hợp đồng");
      return;
    }

    const signature = rental.contract.contractHash || "";
    const signedAtStr = rental.contract.signedAt
      ? formatDate(rental.contract.signedAt)
      : "";
    const formatContractDate = (date: string) =>
      new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    const renterName =
      rental.userFullName ||
      signature ||
      rental.shippingName ||
      rental.userEmail;
    const rentalDays = calculateInclusiveRentalDays(
      rental.startDate,
      rental.endDate,
    );
    const contractRentalFee = rental.items.reduce(
      (total, item) => total + item.pricePerDay * rentalDays,
      0,
    );
    const contractDepositAmount =
      rental.finalDepositAmount ?? rental.estimatedDepositAmount ?? 0;
    const contractAdditionalFee = rental.additionalFee || 0;
    const contractTotalPayment =
      contractRentalFee + contractDepositAmount + contractAdditionalFee;
    const isContractSigned = !!(
      rental.contract.isLocked || rental.contract.locked
    );
    const signatureDateCode = rental.contract.signedAt
      ? rental.contract.signedAt.slice(0, 10).replace(/-/g, "")
      : new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const signatureCode = isContractSigned
      ? `SIG-${signatureDateCode}-${String(rental.contract.id).padStart(6, "0")}`
      : "Chưa ký";
    const otpStatus =
      isContractSigned &&
      rental.contract.contractHash !== "OFFLINE_PHYSICAL_SIGNATURE"
        ? "Thành công"
        : "Không áp dụng";
    const signerDevice = rental.contract.signerUserAgent || "Chưa ghi nhận";
    const productRows = rental.items
      .map(
        (item, index) => `
 <tr>
 <td>${index + 1}</td>
 <td class="text-left">
 <strong>${item.productName}</strong>
 ${item.deviceConditionDetails ? `<div class="sub-text">Tình trạng: ${escapeHtml(item.deviceConditionDetails)}</div>` : ""}
 </td>
 <td>${item.deviceSerialNumber || "Chưa gán"}</td>
 <td class="text-right">${formatVND(item.assetValue || 0)}</td>
 <td class="text-right">${formatVND(item.pricePerDay)}</td>
 <td class="text-right">${formatVND(item.pricePerDay * rentalDays)}</td>
 </tr>
 `,
      )
      .join("");
    const expandedContractTerms = `
 <p><strong>4.1. QUY TRÌNH BÀN GIAO THIẾT BỊ</strong><br>Digital Rental kiểm tra thiết bị, serial, phụ kiện và tình trạng trước khi bàn giao. Người thuê cần kiểm tra lại khi nhận; nếu tiếp nhận thiết bị thì được xem là đồng ý với tình trạng ghi nhận trong biên bản bàn giao.</p>
 <p><strong>4.2. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</strong><br>Bên A cung cấp thiết bị đúng mô tả, hỗ trợ kỹ thuật cơ bản, ghi nhận biên bản giao nhận và hoàn tiền cọc/hoàn phí hợp lệ sau khi đối soát. Bên A có quyền từ chối bàn giao nếu bên B chưa hoàn tất eKYC, chưa ký hợp đồng hoặc chưa thanh toán theo quy định.</p>
 <p><strong>4.3. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</strong><br>Bên B sử dụng thiết bị đúng mục đích, bảo quản cẩn thận, không tự ý tháo lắp, sửa chữa hoặc giao thiết bị cho người khác khi chưa được chấp thuận. Bên B phải trả thiết bị đúng hạn, đúng tình trạng và phối hợp xác minh khi có tranh chấp.</p>
 <p><strong>4.4. QUY ĐỊNH VỀ HƯ HỎNG, MẤT MÁT VÀ BỒI THƯỜNG</strong><br>Mất thiết bị: bồi thường 100% giá trị thị trường hoặc giá trị tài sản ghi trong hợp đồng. Hư hỏng sửa được: thanh toán toàn bộ chi phí sửa chữa, kiểm tra, vận chuyển và thời gian thiết bị ngừng khai thác nếu có. Hư hỏng không sửa được: bồi thường giá trị còn lại hoặc giá trị thay thế theo kết quả thẩm định.</p>
 <p><strong>4.5. ĐIỀU KHOẢN MẤT CẮP</strong><br>Nếu thiết bị bị mất cắp, bên B phải thông báo cho bên A trong vòng 02 giờ, trình báo cơ quan công an có thẩm quyền và cung cấp biên bản tiếp nhận/trình báo. Biên bản công an không miễn trừ nghĩa vụ bồi thường hoặc thanh toán các khoản phát sinh.</p>
 <p><strong>4.6. QUY ĐỊNH VỀ TRẢ TRỄ, TRẢ SỚM VÀ GIA HẠN</strong><br>Trả trễ bị tính phụ thu 150% phí thuê mỗi ngày cho mỗi ngày quá hạn. Trả sớm được hoàn 80% phí thuê của số ngày chưa sử dụng, sau khi trừ các khoản phát sinh nếu có. Mọi yêu cầu gia hạn cần được bên A xác nhận trước khi hết hạn thuê.</p>
 <p><strong>4.7. CẤM CHO THUÊ LẠI VÀ CHUYỂN GIAO THIẾT BỊ</strong><br>Bên B không được cho người khác mượn, cho thuê lại, cầm cố, thế chấp, chuyển giao quyền sử dụng hoặc giao thiết bị cho bên thứ ba khi chưa có chấp thuận bằng văn bản của bên A.</p>
 <p><strong>4.8. XỬ LÝ VI PHẠM VÀ CHẤM DỨT HỢP ĐỒNG</strong><br>Hợp đồng có thể bị chấm dứt nếu bên B cung cấp thông tin sai, không thanh toán, không trả thiết bị hoặc vi phạm nghiêm trọng nghĩa vụ bảo quản. Nếu quá hạn 07 ngày mà bên B không liên hệ hoặc không hoàn trả thiết bị, hành vi có thể bị xem xét là chiếm giữ trái phép tài sản.</p>
 <p><strong>4.9. BẢO MẬT VÀ XÁC THỰC ĐIỆN TỬ</strong><br>Bên B đồng ý việc hệ thống sử dụng thông tin tài khoản, eKYC, OTP, chữ ký điện tử và nhật ký thao tác để xác minh giao dịch thuê. Dữ liệu nhạy cảm được bảo vệ theo cơ chế xác thực, phân quyền và E2EE-SHIELD đối với API phù hợp.</p>
 <p><strong>4.10. GIẢI QUYẾT TRANH CHẤP</strong><br>Mọi tranh chấp được ưu tiên giải quyết bằng thương lượng trên cơ sở dữ liệu đơn thuê, hợp đồng, biên bản bàn giao, biên bản hoàn trả, lịch sử thanh toán và nhật ký hệ thống.</p>
 <p><strong>4.11. CAM KẾT CỦA CÁC BÊN</strong><br>Các bên cam kết thông tin cung cấp là trung thực, đã đọc và đồng ý với toàn bộ nội dung hợp đồng trước khi ký điện tử. Hợp đồng có hiệu lực từ thời điểm được ký điện tử bởi các bên trên hệ thống Digital Rental.</p>
 <p><strong>4.12. PHỤ LỤC ĐÍNH KÈM</strong><br>Phụ lục gồm: thông tin thiết bị/serial, biên bản bàn giao, biên bản hoàn trả, bảng tính phí phát sinh, lịch sử thanh toán và nhật ký ký điện tử nếu có.</p>
 `;
    const contractTermsHtml = expandedContractTerms;

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
 text-transform: ;
 }
 .contract-info {
 margin-bottom: 20px;
 font-style: italic;
 text-align: center;
 }
 .content-box {
 text-align: justify;
 }
 .content-box p {
 margin: 5px 0;
 }
 .section-title {
 margin: 22px 0 8px;
 font-weight: bold;
 text-transform: ;
 }
 .info-table,
 .product-table {
 width: 100%;
 border-collapse: collapse;
 }
 .info-table td {
 padding: 4px 8px 4px 0;
 vertical-align: top;
 }
 .info-label {
 width: 22%;
 font-weight: bold;
 }
 .product-table th,
 .product-table td {
 border: 1px solid #000;
 padding: 7px;
 text-align: center;
 }
 .product-table th {
 background: #f3f4f6;
 }
 .text-left {
 text-align: left !important;
 }
 .text-right {
 text-align: right !important;
 }
 .sub-text {
 margin-top: 2px;
 color: #555;
 font-size: 11px;
 }
 .summary-box {
 margin-top: 10px;
 margin-left: auto;
 width: 48%;
 }
 .summary-row {
 display: flex;
 justify-content: space-between;
 padding: 3px 0;
 }
 .summary-total {
 margin-top: 5px;
 padding-top: 6px;
 border-top: 1px solid #000;
 font-weight: bold;
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
 .signature-audit {
 margin-top: 24px;
 border: 1px solid #d1d5db;
 padding: 12px;
 border-radius: 8px;
 page-break-inside: avoid;
 }
 .signature-audit-title {
 font-weight: bold;
 margin-bottom: 8px;
 }
 .signature-audit-table {
 width: 100%;
 border-collapse: collapse;
 font-size: 12px;
 }
 .signature-audit-table td {
 border-top: 1px solid #e5e7eb;
 padding: 6px 8px;
 vertical-align: top;
 }
 .signature-audit-table td:first-child {
 width: 26%;
 font-weight: bold;
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

 <div class="section-title">I. THÔNG TIN CÁC BÊN</div>
 <table class="info-table">
 <tr>
 <td class="info-label">Bên cho thuê:</td>
 <td><strong>Digital Rental</strong></td>
 </tr>
 <tr>
 <td class="info-label">Đại diện:</td>
 <td>${rental.contract.lessorSignature || "Cửa hàng Digital Rental"}</td>
 </tr>
 <tr>
 <td class="info-label">Bên thuê:</td>
 <td><strong>${renterName}</strong></td>
 </tr>
 <tr>
 <td class="info-label">Email:</td>
 <td>${rental.userEmail || "Chưa cập nhật"}</td>
 </tr>
 <tr>
 <td class="info-label">Số điện thoại:</td>
 <td>${rental.userPhone || rental.shippingPhone || "Chưa cập nhật"}</td>
 </tr>
 <tr>
 <td class="info-label">CCCD:</td>
 <td>${rental.identityNumber || "Chưa cập nhật"}</td>
 </tr>
 <tr>
 <td class="info-label">Ngày cấp:</td>
 <td>${rental.identityIssuedDate ? formatContractDate(rental.identityIssuedDate) : "Chưa cập nhật"}</td>
 </tr>
 <tr>
 <td class="info-label">Nơi cấp:</td>
 <td>${rental.identityIssuedPlace || "Chưa cập nhật"}</td>
 </tr>
 <tr>
 <td class="info-label">Địa chỉ thường trú:</td>
 <td>${rental.permanentAddress || "Chưa cập nhật"}</td>
 </tr>
 <tr>
 <td class="info-label">Địa chỉ hiện tại:</td>
 <td>${rental.currentAddress || rental.shippingAddress || "Chưa cập nhật"}</td>
 </tr>
 <tr>
 <td class="info-label">Mức xác thực:</td>
 <td>${rental.verificationLevel || "Chưa cập nhật"}</td>
 </tr>
 <tr>
 <td class="info-label">Địa điểm nhận:</td>
 <td>${rental.shippingAddress || "Nhận tại cửa hàng Digital Rental"}</td>
 </tr> </table>

 <div class="section-title">II. THÔNG TIN THUÊ THIẾT BỊ</div>
 <table class="info-table">
 <tr>
 <td class="info-label">Mã đơn thuê:</td>
 <td>#${rental.code}</td>
 </tr>
 <tr>
 <td class="info-label">Thời hạn thuê:</td>
 <td>${formatContractDate(rental.startDate)} đến ${formatContractDate(rental.endDate)} (${rentalDays} ngày)</td>
 </tr>
 <tr>
 <td class="info-label">Hình thức thanh toán:</td>
 <td>${rental.paymentMethod === "ONLINE" ? "VNPay Online" : rental.paymentMethod}</td>
 </tr>
 </table>

 <div class="section-title">III. DANH SÁCH THIẾT BỊ THUÊ</div>
 <table class="product-table">
 <thead>
 <tr>
 <th style="width: 7%">STT</th>
 <th>Thiết bị</th>
 <th style="width: 16%">Serial</th>
 <th style="width: 18%">Giá trị tài sản</th>
 <th style="width: 18%">Đơn giá/ngày</th>
 <th style="width: 18%">Thành tiền</th>
 </tr>
 </thead>
 <tbody>${productRows}</tbody>
 </table>
 <div class="summary-box">
 <div class="summary-row">
 <span>Phí thuê:</span>
 <strong>${formatVND(contractRentalFee)}</strong>
 </div>
 <div class="summary-row">
 <span>Tiền cọc dự kiến:</span>
 <strong>${formatVND(contractDepositAmount)}</strong>
 </div>
 <div class="summary-row summary-total">
 <span>Tổng thanh toán:</span>
 <span>${formatVND(contractTotalPayment)}</span>
 </div>
 </div>

 <div class="section-title">IV. ĐIỀU KHOẢN HỢP ĐỒNG</div>
 <div class="content-box">
 ${contractTermsHtml}
 </div>

 <div class="signatures-container">
 <div class="signature-col">
 <div class="signature-title">BÊN CHO THUÊ (Ký tên)</div>
 <div class="signature-box lessor">
 ĐÃ KÝ ĐIỆN TỬ<br>
 Đại diện: ${rental.contract.lessorSignature || "Digital Rental"}<br>
 Thời gian: ${rental.contract.lessorSignedAt ? formatDate(rental.contract.lessorSignedAt) : signedAtStr || formatDate(rental.contract.generatedAt || new Date().toISOString())}
 </div>
 </div>
 <div class="signature-col">
 <div class="signature-title">BÊN THUÊ (Ký tên)</div>
 ${
   isContractSigned
     ? `
 <div class="signature-box">
 ĐÃ KÝ ĐIỆN TỬ<br>
 Khách hàng: ${renterName}<br>
 Thời gian: ${signedAtStr}
 </div>
 `
     : `
 <div class="signature-box unassigned" style="display: flex; align-items: center; justify-content: center;">
 CHƯA KÝ TRỰC TUYẾN
 </div>
 `
 }
 </div>
 </div>

 <div class="signature-audit">
 <div class="signature-audit-title">Thông tin xác thực chữ ký điện tử</div>
 <table class="signature-audit-table">
 <tr>
 <td>Mã chữ ký</td>
 <td>${signatureCode}</td>
 </tr>
 <tr>
 <td>Hash SHA-256 tài liệu</td>
 <td style="word-break: break-all;">${rental.contract.documentHash || "Chưa ghi nhận"}</td>
 </tr>
 <tr>
 <td>IP ký</td>
 <td>${rental.contract.signerIp || "Chưa ghi nhận"}</td>
 </tr>
 <tr>
 <td>Thiết bị ký</td>
 <td style="word-break: break-word;">${escapeHtml(signerDevice)}</td>
 </tr>
 <tr>
 <td>OTP xác thực</td>
 <td>${otpStatus}</td>
 </tr>
 </table>
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

    const handoverItem = rental.items[0];
    const receiverName =
      rental.shippingName || rental.userFullName || rental.userEmail;
    const receiverPhone =
      rental.shippingPhone || rental.userPhone || "Chưa cập nhật";
    const receiverAddress =
      rental.shippingAddress || rental.currentAddress || "Nhận tại cửa hàng";
    const productName = handoverItem?.productName || "Thiết bị thuê";
    const serialNumber =
      handoverItem?.deviceSerialNumber ||
      rental.handoverReport.serialNumber ||
      "Chưa ghi nhận";
    const deviceCondition =
      handoverItem?.conditionBeforeHandover ||
      handoverItem?.deviceConditionDetails ||
      "Chưa ghi nhận";
    const signedAtStr = rental.handoverReport.createdAt
      ? formatDate(rental.handoverReport.createdAt)
      : "";

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
 margin-bottom: 10px;
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
 p {
 margin: 4px 0;
 }
 .notice {
 border: 1px solid #222;
 padding: 10px 12px;
 margin-top: 10px;
 page-break-inside: avoid;
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

 <div class="header-title">BIÊN BẢN BÀN GIAO THIẾT BỊ</div>
 <div class="report-info">Số: BBG-${escapeHtml(rental.code)} • Ngày lập: ${escapeHtml(signedAtStr)}</div>

 <div class="section-title">I. Thông tin các bên</div>
 <p><strong>Bên giao thiết bị:</strong> Cửa hàng Digital Rental</p>
 <p><strong>Nhân viên bàn giao:</strong> ${escapeHtml(rental.handoverReport.staffName || "Chưa cập nhật")}</p>
 <p><strong>Bên nhận thiết bị:</strong> ${escapeHtml(receiverName)}</p>
 <p><strong>Email:</strong> ${escapeHtml(rental.userEmail)}</p>
 <p><strong>Số điện thoại:</strong> ${escapeHtml(receiverPhone)}</p>
 <p><strong>CCCD:</strong> ${escapeHtml(rental.identityNumber || "Chưa cập nhật")}</p>
 <p><strong>Ngày cấp:</strong> ${escapeHtml(rental.identityIssuedDate ? formatDate(rental.identityIssuedDate) : "Chưa cập nhật")}</p>
 <p><strong>Nơi cấp:</strong> ${escapeHtml(rental.identityIssuedPlace || "Chưa cập nhật")}</p>
 <p><strong>Địa chỉ thường trú:</strong> ${escapeHtml(rental.permanentAddress || "Chưa cập nhật")}</p>
 <p><strong>Địa chỉ nhận thiết bị:</strong> ${escapeHtml(receiverAddress)}</p>
 <p><strong>Mức xác thực:</strong> ${escapeHtml(rental.verificationLevel || "Chưa cập nhật")}</p>

 <div class="section-title">II. Thông tin đơn thuê</div>
 <p><strong>Mã đơn thuê:</strong> #${escapeHtml(rental.code)}</p>
 <p><strong>Thời gian thuê:</strong> ${escapeHtml(rental.startDate.split("T")[0])} đến ${escapeHtml(rental.endDate.split("T")[0])}</p>
 <p><strong>Mức rủi ro hồ sơ:</strong> ${escapeHtml(rental.handoverReport.riskLevel)}</p>
 <p><strong>Tiền cọc chốt:</strong> ${formatVND(rental.handoverReport.finalDepositAmount)}</p>

 <div class="section-title">III. Thiết bị bàn giao</div>
 <p><strong>Tên thiết bị:</strong> ${escapeHtml(productName)}</p>
 <p><strong>Serial:</strong> ${escapeHtml(serialNumber)}</p>
 <p><strong>Giá trị tài sản:</strong> ${formatVND(handoverItem?.assetValue || 0)}</p>
 <p><strong>Đơn giá thuê/ngày:</strong> ${formatVND(handoverItem?.pricePerDay || 0)}</p>

 <div class="section-title">IV. Tình trạng thiết bị trước lúc bàn giao</div>
 <p><strong>Tình trạng tổng thể:</strong> ${escapeHtml(deviceCondition)}</p>
 <p><strong>Thân máy:</strong> ${escapeHtml(rental.handoverReport.bodyCondition || "Chưa ghi nhận")}</p>
 <p><strong>Ống kính:</strong> ${escapeHtml(rental.handoverReport.lensCondition || "Chưa ghi nhận")}</p>
 <p><strong>Pin:</strong> ${escapeHtml(rental.handoverReport.batteryCondition || "Chưa ghi nhận")}</p>
 <p><strong>Phụ kiện đi kèm:</strong> ${escapeHtml(rental.handoverReport.accessoryCondition || "Chưa ghi nhận")}</p>
 <p><strong>Ghi chú bàn giao:</strong> ${escapeHtml(rental.handoverReport.note || "Không có")}</p>

 <div class="section-title">V. Xác nhận bàn giao</div>
 <div class="notice">
 Bên nhận đã kiểm tra thiết bị, serial, phụ kiện và tình trạng thực tế trước khi nhận.
 Hai bên thống nhất sử dụng thông tin trong biên bản này làm căn cứ đối chiếu khi hoàn trả thiết bị.
 </div>

 <div class="signatures-container">
 <div class="signature-col">
 <div class="signature-title">Người nhận thiết bị</div>
 <div style="font-weight: bold; margin-top: 20px;">${escapeHtml(receiverName)}</div>
 </div>
 <div class="signature-col">
 <div class="signature-title">Nhân viên bàn giao</div>
 <div style="font-weight: bold; margin-top: 20px;">${escapeHtml(rental.handoverReport.staffName || "")}</div>
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

    const itemsHtml = rental.items
      .map(
        (item) => `
 <tr>
 <td style="border: 1px solid #000; padding: 8px;">${escapeHtml(item.productName)}</td>
 <td style="border: 1px solid #000; padding: 8px; text-align: center;">${escapeHtml(item.deviceSerialNumber || "N/A")}</td>
 <td style="border: 1px solid #000; padding: 8px;">${escapeHtml(item.conditionBeforeHandover || "Chưa ghi nhận")}</td>
 <td style="border: 1px solid #000; padding: 8px;">${escapeHtml(item.conditionAfterReturn || "Chưa ghi nhận")}</td>
 </tr>
 `,
      )
      .join("");

    const returnDateStr = rental.returnReport.returnDate
      ? formatDate(rental.returnReport.returnDate)
      : "";
    const createdAtStr = rental.returnReport.createdAt
      ? formatDate(rental.returnReport.createdAt)
      : "";

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
 text-transform: ;
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
 text-transform: ;
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
 <td style="font-weight: bold;">#${escapeHtml(rental.code)}</td>
 <td style="width: 25%;">Thời hạn thuê:</td>
 <td>Từ ${escapeHtml(rental.startDate.split("T")[0])} đến ${escapeHtml(rental.endDate.split("T")[0])}</td>
 </tr>
 <tr>
 <td>Khách hàng:</td>
 <td style="font-weight: bold;">${escapeHtml(rental.shippingName || rental.userEmail)}</td>
 <td>Số điện thoại:</td>
 <td>${escapeHtml(rental.shippingPhone || "Chưa cập nhật")}</td>
 </tr>
 <tr>
 <td>Email:</td>
 <td>${escapeHtml(rental.userEmail)}</td>
 <td>Địa chỉ nhận máy:</td>
 <td>${escapeHtml(rental.shippingAddress || "Nhận tại cửa hàng")}</td>
 </tr>
 </table>

 <div class="section-title">2. Thông tin nhận trả & Quyết toán</div>
 <table class="info-table">
 <tr>
 <td style="width: 25%;">Nhân viên nhận trả:</td>
 <td style="font-weight: bold;">${escapeHtml(rental.returnReport.staffName || "N/A")}</td>
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
 <td colspan="3">${escapeHtml(rental.returnReport.note || "Không có ghi chú")}</td>
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

 <div class="section-title">4. Tình trạng chi tiết khi nhận trả</div>
 <table class="info-table">
 <tr>
 <td style="width: 25%;">Thân máy:</td>
 <td>${escapeHtml(rental.returnReport.bodyConditionAfter || "Chưa ghi nhận")}</td>
 </tr>
 <tr>
 <td>Ống kính:</td>
 <td>${escapeHtml(rental.returnReport.lensConditionAfter || "Chưa ghi nhận")}</td>
 </tr>
 <tr>
 <td>Pin:</td>
 <td>${escapeHtml(rental.returnReport.batteryConditionAfter || "Chưa ghi nhận")}</td>
 </tr>
 <tr>
 <td>Phụ kiện đi kèm:</td>
 <td>${escapeHtml(rental.returnReport.accessoryConditionAfter || "Chưa ghi nhận")}</td>
 </tr>
 </table>

 <div class="signatures-container">
 <div class="signature-col">
 <div class="signature-title">Đại diện Khách hàng<br>(Ký & ghi rõ họ tên)</div>
 </div>
 <div class="signature-col">
 <div class="signature-title">Đại diện Nhân viên nhận trả<br>(Ký & ghi rõ họ tên)</div>
 <div style="font-weight: bold; margin-top: 20px;">${escapeHtml(rental.returnReport.staffName || "")}</div>
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
        return "bg-amber-50 text-amber-700 border-amber-200";
      case RentalOrderStatus.PAID_RENTAL_FEE:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case RentalOrderStatus.WAITING_PICKUP:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case RentalOrderStatus.RENTING:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case RentalOrderStatus.RETURNED:
        return "bg-sky-50 text-sky-700 border-sky-200";
      case RentalOrderStatus.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case RentalOrderStatus.CANCELLED:
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200";
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
                  "px-3 py-1 rounded-xl text-[13px] font-semibold border",
                  getStatusColor(rental.status),
                )}
              >
                {getStatusLabel(rental.status)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-zinc-400 leading-none mb-1">
                  Phương thức cọc
                </span>
                <span className="text-xs font-semibold text-zinc-600">
                  {rental.paymentMethod === "ONLINE"
                    ? "VNPay Online"
                    : "Tiền mặt / COD"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-zinc-400 block mb-1">
                Thời gian thuê
              </span>
              <span className="text-xs font-semibold text-zinc-950 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {rental.startDate.split("T")[0]} &rarr;{" "}
                {rental.endDate.split("T")[0]}
              </span>
            </div>
          </div>

          {/* Items & Physical Device info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-900">
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
                        src={
                          getImageUrl(item.productMainImageUrl) ||
                          "/placeholder-camera.jpg"
                        }
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-950 truncate leading-tight">
                        {item.productName}
                      </h4>
                      <p className="text-xs font-medium text-zinc-500 mt-1">
                        Giá thuê: {formatVND(item.pricePerDay)}/ngày
                      </p>
                    </div>
                  </div>

                  {/* Physical Device detail if assigned */}
                  {item.deviceSerialNumber && (
                    <div className="p-3 bg-zinc-50 rounded-xl space-y-2 text-xs border border-black/5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-500">
                          Số Serial gán máy:
                        </span>
                        <span className="font-semibold text-zinc-900 bg-white px-2 py-0.5 rounded-xl border border-black/5">
                          {item.deviceSerialNumber}
                        </span>
                      </div>
                      {item.conditionBeforeHandover && (
                        <div className="flex justify-between items-start pt-1">
                          <span className="font-semibold text-zinc-500">
                            Tình trạng bàn giao:
                          </span>
                          <span className="font-semibold text-amber-700 text-right">
                            {item.conditionBeforeHandover}
                          </span>
                        </div>
                      )}
                      {item.conditionAfterReturn && (
                        <div className="flex justify-between items-start pt-1 border-t border-dashed border-zinc-200">
                          <span className="font-semibold text-zinc-500">
                            Tình trạng lúc trả:
                          </span>
                          <span className="font-semibold text-zinc-800 text-right">
                            {item.conditionAfterReturn}
                          </span>
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
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Địa chỉ nhận máy
                </h3>
              </div>
              <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl space-y-3 flex-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-zinc-400">
                    Người nhận máy
                  </p>
                  <p className="text-xs font-semibold text-zinc-900">
                    {rental.shippingName} • {rental.shippingPhone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-zinc-400">
                    Địa chỉ
                  </p>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                    {rental.shippingAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Deposit Status Details */}
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Tình trạng đặt cọc
                </h3>
              </div>
              <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl space-y-3 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-zinc-400">
                    Trạng thái cọc
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-xl border",
                      rental.depositStatus === "PAID" ||
                        rental.depositStatus === "PARTIALLY_DEDUCTED" ||
                        rental.depositStatus === "FULLY_DEDUCTED" ||
                        rental.depositStatus === "REFUNDED"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100",
                    )}
                  >
                    {rental.depositStatus === "PAID" ||
                    rental.depositStatus === "PARTIALLY_DEDUCTED" ||
                    rental.depositStatus === "FULLY_DEDUCTED" ||
                    rental.depositStatus === "REFUNDED"
                      ? "Đã đặt cọc"
                      : "Chưa cọc"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50">
                  <span className="text-[10px] font-semibold text-zinc-400">
                    Hoàn tiền cọc
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-xl border",
                      rental.refundStatus === "SUCCESS"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-zinc-50 text-zinc-500 border-zinc-100",
                    )}
                  >
                    {rental.refundStatus === "SUCCESS"
                      ? "Đã hoàn trả"
                      : "Chưa hoàn"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="p-5 bg-white border border-zinc-100 rounded-xl space-y-4 shadow-sm relative overflow-hidden">
            <div className="space-y-2.5 relative z-10">
              <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <span>Phí thuê cơ bản:</span>
                <span className="text-zinc-950 font-semibold">
                  {formatVND(rental.rentalFee)}
                </span>
              </div>
              {rental.additionalFee > 0 && (
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>Phụ phí phát sinh (trễ/hỏng):</span>
                  <span className="text-red-500 font-semibold">
                    +{formatVND(rental.additionalFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <span>Tiền cọc thiết bị (dự kiến/đã đóng):</span>
                <span className="text-amber-600 font-semibold">
                  {formatVND(
                    rental.finalDepositAmount ??
                      rental.estimatedDepositAmount ??
                      0,
                  )}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 mb-0.5">
                  Tổng chi phí thuê thiết bị
                </p>
                <p className="text-[22px] font-semibold text-red-600 tracking-tight leading-none">
                  {formatVND(rental.rentalFee + rental.additionalFee)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-600">
                  Giao dịch an toàn
                </span>
              </div>
            </div>
          </div>

          {!isStaffPortal &&
            rental.paymentMethod === "ONLINE" &&
            rental.paymentStatus !== "SUCCESS" &&
            rental.status === RentalOrderStatus.PENDING_PAYMENT && (
              <Button
                onClick={handleRetryPayment}
                disabled={isRetryingPayment}
                className="h-11 w-full rounded-xl bg-red-600 text-sm font-medium text-white shadow-none hover:bg-red-700"
              >
                {isRetryingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Thanh toán lại phí thuê qua VNPay
              </Button>
            )}

          {/* Electronic Rental Contract Section */}
          {rental.contract && (
            <div className="p-5 bg-zinc-50 rounded-xl border border-black/5 space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-800">
                    Hợp đồng điện tử: {rental.contract.contractNumber}
                  </span>
                </div>
                {rental.contract.isLocked || rental.contract.locked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">
                    <ShieldCheck className="w-3 h-3" />{" "}
                    {rental.contract.contractHash ===
                    "OFFLINE_PHYSICAL_SIGNATURE"
                      ? "Đã ký (HĐ Giấy)"
                      : "Đã ký điện tử"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-semibold border border-amber-100">
                    Chờ ký
                  </span>
                )}
              </div>

              <div className="bg-white p-3 rounded-xl border border-black/5 text-[11px] font-medium text-zinc-500 whitespace-pre-line max-h-40 overflow-y-auto no-scrollbar font-mono leading-relaxed">
                {rental.contract.termsAndConditions}
              </div>

              {rental.contract.isLocked || rental.contract.locked ? (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                    <span>
                      {rental.contract.contractHash ===
                      "OFFLINE_PHYSICAL_SIGNATURE"
                        ? "Hình thức ký:"
                        : "Chữ ký bên thuê:"}
                    </span>
                    <span
                      className="font-semibold text-zinc-950 font-mono italic underline text-right truncate max-w-[200px]"
                      title={rental.contract.contractHash}
                    >
                      {rental.contract.contractHash ===
                      "OFFLINE_PHYSICAL_SIGNATURE"
                        ? "Ký trực tiếp tại cửa hàng (Bản giấy)"
                        : rental.contract.contractHash}
                    </span>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Tải file hợp đồng (PDF)
                  </Button>
                </div>
              ) : (
                !showSignForm &&
                !hideSignAction &&
                (canSignOnline ? (
                  <Button
                    onClick={handleOpenSignForm}
                    disabled={isSendingOtp}
                    className="w-full h-11 bg-red-600 hover:bg-zinc-950 text-white font-semibold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FilePenLine className="w-4 h-4" />
                    )}
                    Tiến hành ký hợp đồng online
                  </Button>
                ) : isWaitingForPreparation ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-amber-700">
                    Đơn thuê đã thanh toán phí thuê. Vui lòng chờ nhân viên
                    chuẩn bị và gán thiết bị trước khi ký hợp đồng online.
                  </div>
                ) : null)
              )}

              {showSignForm && !hideSignAction && (
                <div className="space-y-3 pt-2 border-t border-black/5 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-zinc-50 border border-black/5 p-3 rounded-xl space-y-1">
                    <p className="text-[10px] font-semibold text-zinc-600">
                      Mã xác thực OTP đã được gửi đến email đăng ký của bạn. Vui
                      lòng nhập mã OTP và Họ tên để hoàn tất ký hợp đồng.
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 tracking-wide block mb-1">
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
                      <label className="text-[11px] font-semibold text-zinc-500 tracking-wide block">
                        Mã OTP xác thực email
                      </label>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp}
                        className="text-[10px] font-semibold text-red-600 hover:underline disabled:text-zinc-400"
                      >
                        {isSendingOtp ? "Đang gửi..." : "Gửi lại OTP"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="Nhập mã OTP 6 chữ số"
                      className="w-full h-10 px-3 rounded-xl border border-black/5 bg-white text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-950 text-center tracking-wide"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowSignForm(false);
                        setOtpCode("");
                      }}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={handleSignContract}
                      disabled={isSigning}
                      className="flex-1 h-10 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-red-600 flex items-center justify-center border-none"
                    >
                      {isSigning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Xác nhận ký"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Handover Report Section */}
          {rental.handoverReport && (
            <div className="p-5 bg-zinc-50 rounded-xl border border-black/5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-zinc-800">
                    Biên bản bàn giao: {rental.handoverReport.serialNumber}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                  Đã bàn giao
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-600">
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5 tracking-wider">
                    Nhân viên bàn giao
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {rental.handoverReport.staffName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5 tracking-wider">
                    Tiền cọc thực tế
                  </span>
                  <span className="font-semibold text-amber-600">
                    {formatVND(rental.handoverReport.finalDepositAmount)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleDownloadHandoverPDF}
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Tải biên bản bàn giao (PDF)
              </Button>
            </div>
          )}

          {/* Return Report Section */}
          {rental.returnReport && (
            <div className="p-5 bg-zinc-50 rounded-xl border border-black/5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-zinc-800">
                    Biên bản nhận trả máy
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-100">
                  Đã nhận trả
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-600">
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5 tracking-wider">
                    Nhân viên nhận trả
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {rental.returnReport.staffName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5 tracking-wider">
                    Phí phạt & trễ hạn
                  </span>
                  <span className="font-semibold text-red-600">
                    {formatVND(rental.returnReport.totalPenalty)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleDownloadReturnPDF}
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
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
