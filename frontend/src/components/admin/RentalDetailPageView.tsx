"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Package,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn, formatDate, formatVND, getImageUrl } from "@/lib/utils";
import {
  DepositStatus,
  RentalOrderStatus,
  useStaffRentalDetail,
} from "@/services/rental";

type PortalType = "admin" | "staff" | "super-admin";

const statusLabel: Record<RentalOrderStatus, string> = {
  [RentalOrderStatus.PENDING_PAYMENT]: "Chờ thanh toán phí",
  [RentalOrderStatus.PAID_RENTAL_FEE]: "Đã thanh toán phí",
  [RentalOrderStatus.WAITING_PICKUP]: "Chờ nhận máy",
  [RentalOrderStatus.RENTING]: "Đang thuê",
  [RentalOrderStatus.RETURNED]: "Đã trả máy",
  [RentalOrderStatus.COMPLETED]: "Hoàn tất",
  [RentalOrderStatus.CANCELLED]: "Đã hủy",
};

const statusClass: Record<RentalOrderStatus, string> = {
  [RentalOrderStatus.PENDING_PAYMENT]: "border-amber-200 bg-amber-50 text-amber-700",
  [RentalOrderStatus.PAID_RENTAL_FEE]: "border-blue-200 bg-blue-50 text-blue-700",
  [RentalOrderStatus.WAITING_PICKUP]: "border-indigo-200 bg-indigo-50 text-indigo-700",
  [RentalOrderStatus.RENTING]: "border-violet-200 bg-violet-50 text-violet-700",
  [RentalOrderStatus.RETURNED]: "border-sky-200 bg-sky-50 text-sky-700",
  [RentalOrderStatus.COMPLETED]: "border-emerald-200 bg-emerald-50 text-emerald-700",
  [RentalOrderStatus.CANCELLED]: "border-red-200 bg-red-50 text-red-700",
};

const downloadButtonClass =
  "h-9 rounded-xl border border-zinc-200 !bg-white !text-zinc-900 shadow-sm hover:!bg-zinc-50 hover:!text-zinc-950";

const depositLabel = (status?: DepositStatus) => {
  switch (status) {
    case DepositStatus.PAID:
      return "Đã đặt cọc";
    case DepositStatus.REFUNDED:
      return "Đã hoàn cọc";
    case DepositStatus.PARTIALLY_DEDUCTED:
      return "Đã khấu trừ một phần";
    case DepositStatus.FULLY_DEDUCTED:
      return "Đã khấu trừ toàn bộ";
    default:
      return "Chưa thu cọc";
  }
};

const parseDateOnly = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const calculateRentalDays = (startDate?: string | null, endDate?: string | null) => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) return 1;
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1,
  );
};

export function RentalDetailPageView({ portalType }: { portalType: PortalType }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const rentalId = Number(params.id);
  const { data, isLoading } = useStaffRentalDetail(rentalId);
  const rental = data?.data;
  const backHref = `/${portalType}/rentals`;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-red-600" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => router.push(backHref)}
          className="h-10 rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center">
          <p className="text-sm font-medium text-zinc-500">
            Không tìm thấy đơn thuê.
          </p>
        </div>
      </div>
    );
  }

  const rentalDays = calculateRentalDays(rental.startDate, rental.endDate);
  const depositAmount =
    rental.finalDepositAmount ?? rental.estimatedDepositAmount ?? 0;
  const itemRentalTotal = rental.items.reduce(
    (total, item) => total + (item.pricePerDay || 0) * rentalDays,
    0,
  );
  const totalPayment = itemRentalTotal + depositAmount + (rental.additionalFee || 0);
  const signed = !!(rental.contract?.isLocked || rental.contract?.locked);
  const escapeHtml = (value?: string | number | null) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const printDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa ghi nhận";

  const openPrintDocument = (title: string, body: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Vui lòng cho phép mở popup để tải tài liệu.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          <style>
            body { font-family: "Times New Roman", serif; color: #111; padding: 36px; font-size: 14px; line-height: 1.6; }
            .national { text-align: center; font-weight: 700; margin-bottom: 28px; }
            h1 { text-align: center; font-size: 20px; margin: 0 0 18px; text-transform: uppercase; }
            h2 { font-size: 15px; margin: 22px 0 8px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; }
            th, td { border: 1px solid #111; padding: 7px 8px; vertical-align: top; }
            th { background: #f3f4f6; text-align: center; }
            .meta td { border: 0; padding: 3px 8px 3px 0; }
            .label { width: 24%; font-weight: 700; }
            .right { text-align: right; }
            .center { text-align: center; }
            .muted { color: #555; font-size: 12px; }
            .summary { width: 42%; margin-left: auto; }
            .summary-row { display: flex; justify-content: space-between; padding: 3px 0; }
            .summary-total { border-top: 1px solid #111; margin-top: 4px; padding-top: 6px; font-weight: 700; }
            .signature { margin-top: 42px; display: flex; justify-content: space-between; gap: 28px; page-break-inside: avoid; }
            .signature > div { width: 48%; text-align: center; }
            .signature-box { margin-top: 14px; border: 1px dashed #999; min-height: 72px; padding: 12px; }
            pre { white-space: pre-wrap; font-family: "Times New Roman", serif; line-height: 1.6; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="national">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
            Độc lập - Tự do - Hạnh phúc<br/>
            --------------------------
          </div>
          ${body}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadContract = () => {
    if (!rental.contract) return;

    const rows = rental.items
      .map(
        (item, index) => `
          <tr>
            <td class="center">${index + 1}</td>
            <td>
              <strong>${escapeHtml(item.productName)}</strong>
              <div class="muted">Tình trạng: ${escapeHtml(item.deviceConditionDetails || "Chưa ghi nhận")}</div>
            </td>
            <td class="center">${escapeHtml(item.deviceSerialNumber || "Chưa gán")}</td>
            <td class="right">${formatVND(item.assetValue || 0)}</td>
            <td class="right">${formatVND(item.pricePerDay)}</td>
            <td class="right">${formatVND(item.pricePerDay * rentalDays)}</td>
          </tr>
        `,
      )
      .join("");

    openPrintDocument(
      `Hop_Dong_Thue_${rental.code}`,
      `
        <h1>Hợp đồng thuê thiết bị điện tử</h1>
        <p class="center"><em>Số: ${escapeHtml(rental.contract.contractNumber)}</em></p>
        <h2>I. Thông tin các bên</h2>
        <table class="meta">
          <tr><td class="label">Bên cho thuê:</td><td>Digital Rental</td></tr>
          <tr><td class="label">Bên thuê:</td><td>${escapeHtml(rental.shippingName || rental.userFullName || rental.userEmail)}</td></tr>
          <tr><td class="label">Email:</td><td>${escapeHtml(rental.userEmail)}</td></tr>
          <tr><td class="label">Số điện thoại:</td><td>${escapeHtml(rental.shippingPhone || rental.userPhone || "Chưa cập nhật")}</td></tr>
          <tr><td class="label">CCCD:</td><td>${escapeHtml(rental.identityNumber || "Chưa cập nhật")}</td></tr>
          <tr><td class="label">Mức xác thực:</td><td>${escapeHtml(rental.verificationLevel || "Chưa cập nhật")}</td></tr>
          <tr><td class="label">Địa điểm nhận:</td><td>${escapeHtml(rental.shippingAddress || "Nhận tại cửa hàng")}</td></tr>
        </table>
        <h2>II. Thông tin thuê</h2>
        <table class="meta">
          <tr><td class="label">Mã đơn thuê:</td><td>#${escapeHtml(rental.code)}</td></tr>
          <tr><td class="label">Thời hạn thuê:</td><td>${printDate(rental.startDate)} đến ${printDate(rental.endDate)} (${rentalDays} ngày)</td></tr>
          <tr><td class="label">Thanh toán:</td><td>${escapeHtml(rental.paymentMethod === "ONLINE" ? "VNPay Online" : rental.paymentMethod)}</td></tr>
        </table>
        <h2>III. Danh sách thiết bị thuê</h2>
        <table>
          <thead>
            <tr><th>STT</th><th>Thiết bị</th><th>Serial</th><th>Giá trị tài sản</th><th>Đơn giá/ngày</th><th>Thành tiền</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="summary">
          <div class="summary-row"><span>Phí thuê:</span><strong>${formatVND(itemRentalTotal)}</strong></div>
          <div class="summary-row"><span>Tiền cọc dự kiến:</span><strong>${formatVND(depositAmount)}</strong></div>
          <div class="summary-row summary-total"><span>Tổng thanh toán:</span><span>${formatVND(totalPayment)}</span></div>
        </div>
        <h2>IV. Điều khoản hợp đồng</h2>
        <pre>${escapeHtml(rental.contract.termsAndConditions)}</pre>
        <h2>V. Xác thực chữ ký điện tử</h2>
        <table class="meta">
          <tr><td class="label">Hash SHA-256:</td><td>${escapeHtml(rental.contract.documentHash || "Chưa ghi nhận")}</td></tr>
          <tr><td class="label">IP ký:</td><td>${escapeHtml(rental.contract.signerIp || "Chưa ghi nhận")}</td></tr>
          <tr><td class="label">Thiết bị ký:</td><td>${escapeHtml(rental.contract.signerUserAgent || "Chưa ghi nhận")}</td></tr>
          <tr><td class="label">Thời gian ký:</td><td>${rental.contract.signedAt ? formatDate(rental.contract.signedAt) : "Chưa ghi nhận"}</td></tr>
        </table>
        <div class="signature">
          <div><strong>Bên cho thuê</strong><div class="signature-box">Đã ký điện tử<br/>Digital Rental</div></div>
          <div><strong>Bên thuê</strong><div class="signature-box">${signed ? `Đã ký điện tử<br/>${escapeHtml(rental.shippingName || rental.userFullName || rental.userEmail)}` : "Chưa ký"}</div></div>
        </div>
      `,
    );
  };

  const handleDownloadHandover = () => {
    if (!rental.handoverReport) return;
    openPrintDocument(
      `Bien_Ban_Ban_Giao_${rental.code}`,
      `
        <h1>Biên bản bàn giao thiết bị</h1>
        <table class="meta">
          <tr><td class="label">Mã đơn thuê:</td><td>#${escapeHtml(rental.code)}</td></tr>
          <tr><td class="label">Người nhận:</td><td>${escapeHtml(rental.shippingName || rental.userEmail)} - ${escapeHtml(rental.shippingPhone || rental.userPhone || "Chưa cập nhật")}</td></tr>
          <tr><td class="label">Nhân viên bàn giao:</td><td>${escapeHtml(rental.handoverReport.staffName || "Chưa cập nhật")}</td></tr>
          <tr><td class="label">Ngày lập:</td><td>${formatDate(rental.handoverReport.createdAt)}</td></tr>
          <tr><td class="label">Mức rủi ro:</td><td>${escapeHtml(rental.handoverReport.riskLevel)}</td></tr>
          <tr><td class="label">Tiền cọc chốt:</td><td>${formatVND(rental.handoverReport.finalDepositAmount)}</td></tr>
        </table>
        <h2>Tình trạng bàn giao</h2>
        <table>
          <tr><th>Hạng mục</th><th>Tình trạng</th></tr>
          <tr><td>Thân máy</td><td>${escapeHtml(rental.handoverReport.bodyCondition)}</td></tr>
          <tr><td>Ống kính</td><td>${escapeHtml(rental.handoverReport.lensCondition)}</td></tr>
          <tr><td>Pin</td><td>${escapeHtml(rental.handoverReport.batteryCondition)}</td></tr>
          <tr><td>Phụ kiện</td><td>${escapeHtml(rental.handoverReport.accessoryCondition)}</td></tr>
          <tr><td>Ghi chú</td><td>${escapeHtml(rental.handoverReport.note || "Không có")}</td></tr>
        </table>
        <div class="signature">
          <div><strong>Nhân viên bàn giao</strong><div class="signature-box">${escapeHtml(rental.handoverReport.staffName || "")}</div></div>
          <div><strong>Người nhận thiết bị</strong><div class="signature-box">${escapeHtml(rental.shippingName || rental.userEmail)}</div></div>
        </div>
      `,
    );
  };

  const handleDownloadReturn = () => {
    if (!rental.returnReport) return;
    openPrintDocument(
      `Bien_Ban_Nhan_Tra_${rental.code}`,
      `
        <h1>Biên bản nhận trả thiết bị</h1>
        <table class="meta">
          <tr><td class="label">Mã đơn thuê:</td><td>#${escapeHtml(rental.code)}</td></tr>
          <tr><td class="label">Người thuê:</td><td>${escapeHtml(rental.shippingName || rental.userEmail)}</td></tr>
          <tr><td class="label">Nhân viên kiểm tra:</td><td>${escapeHtml(rental.returnReport.staffName || "Chưa cập nhật")}</td></tr>
          <tr><td class="label">Ngày trả:</td><td>${formatDate(rental.returnReport.returnDate)}</td></tr>
          <tr><td class="label">Ngày lập:</td><td>${formatDate(rental.returnReport.createdAt)}</td></tr>
        </table>
        <h2>Tình trạng sau khi trả</h2>
        <table>
          <tr><th>Hạng mục</th><th>Tình trạng</th></tr>
          <tr><td>Thân máy</td><td>${escapeHtml(rental.returnReport.bodyConditionAfter)}</td></tr>
          <tr><td>Ống kính</td><td>${escapeHtml(rental.returnReport.lensConditionAfter)}</td></tr>
          <tr><td>Pin</td><td>${escapeHtml(rental.returnReport.batteryConditionAfter)}</td></tr>
          <tr><td>Phụ kiện</td><td>${escapeHtml(rental.returnReport.accessoryConditionAfter)}</td></tr>
        </table>
        <h2>Đối soát phí</h2>
        <table>
          <tr><td>Số ngày trả sớm</td><td class="right">${rental.returnReport.earlyReturnDays} ngày</td></tr>
          <tr><td>Hoàn phí trả sớm</td><td class="right">${formatVND(rental.returnReport.earlyReturnRefundAmount)}</td></tr>
          <tr><td>Số ngày trả trễ</td><td class="right">${rental.returnReport.lateDays} ngày</td></tr>
          <tr><td>Phí trả trễ</td><td class="right">${formatVND(rental.returnReport.lateFee)}</td></tr>
          <tr><td>Phí hư hại</td><td class="right">${formatVND(rental.returnReport.damageFee)}</td></tr>
          <tr><td>Phí thiếu phụ kiện</td><td class="right">${formatVND(rental.returnReport.missingAccessoryFee)}</td></tr>
          <tr><td><strong>Tổng phạt</strong></td><td class="right"><strong>${formatVND(rental.returnReport.totalPenalty)}</strong></td></tr>
          <tr><td><strong>Hoàn khách</strong></td><td class="right"><strong>${formatVND(rental.returnReport.refundAmount)}</strong></td></tr>
          <tr><td><strong>Thu thêm</strong></td><td class="right"><strong>${formatVND(rental.returnReport.extraPaymentAmount)}</strong></td></tr>
        </table>
        <p><strong>Ghi chú:</strong> ${escapeHtml(rental.returnReport.note || "Không có")}</p>
        <div class="signature">
          <div><strong>Nhân viên kiểm tra</strong><div class="signature-box">${escapeHtml(rental.returnReport.staffName || "")}</div></div>
          <div><strong>Người trả thiết bị</strong><div class="signature-box">${escapeHtml(rental.shippingName || rental.userEmail)}</div></div>
        </div>
      `,
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Link
              href={backHref}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-400">
                Chi tiết đơn thuê
              </p>
              <h1 className="mt-1 break-all text-2xl font-semibold tracking-tight text-zinc-950">
                #{rental.code}
              </h1>
              <p className="mt-1 text-sm font-normal text-zinc-500">
                Hợp đồng, thiết bị, thanh toán và trạng thái bàn giao.
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-xl border px-3 py-1.5 text-xs font-medium",
              statusClass[rental.status],
            )}
          >
            {statusLabel[rental.status]}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={Calendar}
          label="Thời gian thuê"
          value={`${rental.startDate.split("T")[0]} - ${rental.endDate.split("T")[0]}`}
          hint={`${rentalDays} ngày`}
        />
        <InfoCard
          icon={CreditCard}
          label="Phí thuê"
          value={formatVND(itemRentalTotal)}
          hint={rental.paymentMethod === "ONLINE" ? "VNPay Online" : rental.paymentMethod}
        />
        <InfoCard
          icon={ShieldCheck}
          label="Tiền cọc"
          value={formatVND(depositAmount)}
          hint={depositLabel(rental.depositStatus)}
        />
        <InfoCard
          icon={FileText}
          label="Tổng thanh toán"
          value={formatVND(totalPayment)}
          hint="Phí thuê + cọc"
        />
      </div>

      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        <Card title="Thông tin khách thuê" icon={User} className="h-full">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Người nhận" value={rental.shippingName || rental.userFullName || rental.userEmail} />
            <Field label="Email" value={rental.userEmail} />
            <Field label="Số điện thoại" value={rental.shippingPhone || rental.userPhone || "Chưa cập nhật"} />
            <Field label="Địa điểm nhận" value={rental.shippingAddress || "Nhận tại cửa hàng"} />
            <Field label="CCCD" value={rental.identityNumber || "Chưa cập nhật"} />
            <Field label="Mức xác thực" value={rental.verificationLevel || "Chưa cập nhật"} />
          </div>
        </Card>

        <Card title="Thanh toán" icon={CreditCard} className="h-full">
          <div className="space-y-3 text-sm">
            <MoneyRow label="Phí thuê" value={itemRentalTotal} />
            <MoneyRow label="Tiền cọc dự kiến/đã chốt" value={depositAmount} />
            <MoneyRow label="Phí phát sinh" value={rental.additionalFee || 0} />
            <div className="border-t border-zinc-100 pt-3">
              <MoneyRow label="Tổng thanh toán" value={totalPayment} strong />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Danh sách thiết bị thuê" icon={Package}>
        <div className="space-y-3 lg:hidden">
          {rental.items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <ProductThumb
                  imageUrl={item.productMainImageUrl}
                  name={item.productName}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-950">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {item.deviceConditionDetails || "Chưa ghi nhận tình trạng"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-3">
                <MobileSpec label="Serial" value={item.deviceSerialNumber || "Chưa gán"} />
                <MobileSpec
                  label="Giá trị tài sản"
                  value={formatVND(item.assetValue || 0)}
                  alignRight
                />
                <MobileSpec label="Đơn giá/ngày" value={formatVND(item.pricePerDay)} />
                <MobileSpec
                  label="Thành tiền"
                  value={formatVND(item.pricePerDay * rentalDays)}
                  alignRight
                  highlight
                />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-zinc-100 lg:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-medium text-zinc-500">
              <tr>
                <th className="px-4 py-3">Thiết bị</th>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3 text-right">Giá trị tài sản</th>
                <th className="px-4 py-3 text-right">Đơn giá/ngày</th>
                <th className="px-4 py-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rental.items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <ProductThumb
                        imageUrl={item.productMainImageUrl}
                        name={item.productName}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-950">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {item.deviceConditionDetails || "Chưa ghi nhận tình trạng"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {item.deviceSerialNumber || "Chưa gán"}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-zinc-950">
                    {formatVND(item.assetValue || 0)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-zinc-950">
                    {formatVND(item.pricePerDay)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-red-600">
                    {formatVND(item.pricePerDay * rentalDays)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title="Hợp đồng điện tử"
        icon={FileText}
        action={
          rental.contract ? (
            <Button
              type="button"
              variant="outline"
              className={downloadButtonClass}
              onClick={handleDownloadContract}
            >
              <Download className="mr-2 h-4 w-4" />
              Tải hợp đồng
            </Button>
          ) : null
        }
      >
        {rental.contract ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-950">
                  {rental.contract.contractNumber}
                </p>
                <p className="text-xs text-zinc-500">
                  {signed ? "Đã ký điện tử" : "Chờ khách ký"}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-xl border px-2.5 py-1 text-xs font-medium",
                  signed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                )}
              >
                {signed ? "Đã ký" : "Chờ ký"}
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-zinc-700">
                {rental.contract.termsAndConditions}
              </pre>
            </div>

            {signed && (
              <div className="rounded-2xl border border-zinc-100 bg-white p-5 text-xs text-zinc-600">
                <p className="mb-4 font-medium text-zinc-950">
                  Thông tin xác thực chữ ký
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Hash SHA-256" value={rental.contract.documentHash || "Chưa ghi nhận"} />
                  <Field label="IP ký" value={rental.contract.signerIp || "Chưa ghi nhận"} />
                  <Field label="Thiết bị ký" value={rental.contract.signerUserAgent || "Chưa ghi nhận"} />
                  <Field label="Thời gian ký" value={rental.contract.signedAt ? formatDate(rental.contract.signedAt) : "Chưa ghi nhận"} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Chưa tạo hợp đồng.</p>
        )}
      </Card>

      {(rental.handoverReport || rental.returnReport) && (
        <div className="grid gap-6 xl:grid-cols-2">
          {rental.handoverReport && (
            <Card
              title="Biên bản bàn giao"
              icon={CheckCircle2}
              action={
                <Button
                  type="button"
                  variant="outline"
                  className={downloadButtonClass}
                  onClick={handleDownloadHandover}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Tải biên bản
                </Button>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nhân viên" value={rental.handoverReport.staffName || "Chưa cập nhật"} />
                <Field label="Ngày lập" value={formatDate(rental.handoverReport.createdAt)} />
                <Field label="Tình trạng thân máy" value={rental.handoverReport.bodyCondition} />
                <Field label="Tình trạng phụ kiện" value={rental.handoverReport.accessoryCondition} />
              </div>
            </Card>
          )}

          {rental.returnReport && (
            <Card
              title="Biên bản nhận trả máy"
              icon={CheckCircle2}
              action={
                <Button
                  type="button"
                  variant="outline"
                  className={downloadButtonClass}
                  onClick={handleDownloadReturn}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Tải biên bản
                </Button>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Ngày trả" value={formatDate(rental.returnReport.returnDate)} />
                <Field label="Tổng phạt" value={formatVND(rental.returnReport.totalPenalty)} />
                <Field label="Hoàn khách" value={formatVND(rental.returnReport.refundAmount)} />
                <Field label="Thu thêm" value={formatVND(rental.returnReport.extraPaymentAmount)} />
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
  className,
  action,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProductThumb({
  imageUrl,
  name,
}: {
  imageUrl?: string | null;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);
  const src = getImageUrl(imageUrl);

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
      {src && !hasError ? (
        <Image
          src={src}
          alt={name}
          fill
          unoptimized
          sizes="56px"
          className="object-contain p-1.5"
          onError={() => setHasError(true)}
        />
      ) : (
        <Package className="h-5 w-5 text-zinc-300" />
      )}
    </div>
  );
}

function MobileSpec({
  label,
  value,
  alignRight,
  highlight,
}: {
  label: string;
  value: ReactNode;
  alignRight?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={cn("min-w-0", alignRight && "text-right")}>
      <p className="text-[10px] font-medium text-zinc-400">{label}</p>
      <p
        className={cn(
          "mt-1 break-words text-xs font-semibold text-zinc-950",
          highlight && "text-red-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-lg font-semibold text-zinc-950">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <div className="mt-1 break-words text-sm font-medium text-zinc-900">
        {value}
      </div>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={cn("text-zinc-500", strong && "font-semibold text-zinc-950")}>
        {label}
      </span>
      <span className={cn("font-medium text-zinc-950", strong && "text-lg text-red-600")}>
        {formatVND(value)}
      </span>
    </div>
  );
}
