import { AlertTriangle } from "lucide-react";
import type { KycOcrPreviewResponse } from "@/services/identity";

const FIELDS: Array<[string, keyof KycOcrPreviewResponse]> = [
  ["Số CCCD", "identityNumber"],
  ["Họ và tên", "fullName"],
  ["Ngày sinh", "dateOfBirth"],
  ["Giới tính", "gender"],
  ["Quốc tịch", "nationality"],
  ["Quê quán", "placeOfOrigin"],
  ["Nơi thường trú", "placeOfResidence"],
  ["Ngày cấp", "issuedDate"],
  ["Ngày hết hạn", "expiryDate"],
];

export function OcrSummary({ preview }: { preview: KycOcrPreviewResponse }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-950">Thông tin trích xuất</h3>
          <p className="mt-1 text-xs text-zinc-500">Kiểm tra dữ liệu trước khi gửi hồ sơ.</p>
        </div>
        <span className="text-xs font-medium text-zinc-600">
          OCR {typeof preview.ocrConfidence === "number" ? `${(preview.ocrConfidence * 100).toFixed(1)}%` : "—"}
        </span>
      </div>
      <dl className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {FIELDS.map(([label, key]) => (
          <div key={key}>
            <dt className="text-[11px] text-zinc-500">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-zinc-900">
              {String(preview[key] || "—")}
            </dd>
          </div>
        ))}
      </dl>
      {preview.warnings?.length ? (
        <div className="mt-5 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          {preview.warnings.map((warning) => (
            <p key={warning} className="flex gap-2 text-xs leading-5 text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {warning}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
