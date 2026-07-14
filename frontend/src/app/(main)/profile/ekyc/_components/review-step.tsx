import Image from "next/image";
import { CheckCircle2, Loader2, LockKeyhole, UserCheck, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KycOcrPreviewResponse } from "@/services/identity";
import type { EkycMedia } from "../ekyc-types";
import { OcrSummary } from "./ocr-summary";

interface Props {
  media: EkycMedia;
  preview: KycOcrPreviewResponse | null;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function ReviewStep({ media, preview, submitting, onBack, onSubmit }: Props) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          Bước 5/5: Kiểm tra & gửi
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Kiểm tra ảnh và thông tin CCCD. Sau khi gửi, hồ sơ sẽ chờ kiểm duyệt.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {preview ? <OcrSummary preview={preview} /> : <div />}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(["front", "back"] as const).map((target) => (
              <div key={target}>
                <p className="mb-1.5 text-[11px] text-zinc-500">
                  {target === "front" ? "Mặt trước CCCD" : "Mặt sau CCCD"}
                </p>
                <div className="relative aspect-[1.6/1] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                  {media[target] ? (
                    <Image src={media[target]!.previewUrl} alt={target} fill unoptimized className="object-contain p-1" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3">
            <div className="relative size-14 overflow-hidden rounded-full bg-zinc-100">
              {media.selfie ? <Image src={media.selfie.previewUrl} alt="Ảnh chân dung" fill unoptimized className="object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">Ảnh chân dung</p>
              <p className="text-xs text-emerald-600">Đã sẵn sàng</p>
            </div>
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3">
            <Video className="size-5 text-zinc-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900">Video khuôn mặt</p>
              <p className="text-xs text-emerald-600">Đã sẵn sàng</p>
            </div>
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 sm:grid-cols-2">
        <div className="flex gap-3">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div><p className="text-sm font-medium">Lưu trữ riêng tư</p><p className="text-xs leading-5 text-zinc-500">Tệp được lưu trong kho riêng và truy cập có thời hạn.</p></div>
        </div>
        <div className="flex gap-3">
          <UserCheck className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div><p className="text-sm font-medium">Kiểm duyệt thủ công</p><p className="text-xs leading-5 text-zinc-500">Quản trị viên đưa ra quyết định cuối cùng.</p></div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} className="h-10 w-full rounded-xl border-zinc-200 bg-white px-5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 sm:w-auto">Quay lại</Button>
        <Button onClick={onSubmit} disabled={submitting} className="h-10 w-full rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400 sm:w-auto">
          {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {submitting ? "Đang chấm điểm AI" : "Xác thực & gửi hồ sơ"}
        </Button>
      </div>
    </section>
  );
}
