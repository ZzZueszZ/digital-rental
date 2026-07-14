import Image from "next/image";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EkycAsset } from "../ekyc-types";

interface Props {
  asset: EkycAsset | null;
  cameraOpen: boolean;
  busy: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onOpenCamera: () => void;
  onCapture: () => void;
  onCloseCamera: () => void;
  onRemove: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function SelfieStep({
  asset,
  cameraOpen,
  busy,
  videoRef,
  onOpenCamera,
  onCapture,
  onCloseCamera,
  onRemove,
  onBack,
  onNext,
}: Props) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          Bước 3/5: Ảnh chân dung
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Ảnh phải được chụp trực tiếp. Nhìn thẳng, bỏ kính râm, mũ và khẩu trang.
        </p>
      </header>

      <div className="mx-auto max-w-xl">
        <div className="relative mx-auto flex aspect-square max-w-md items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          {cameraOpen ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="size-full -scale-x-100 object-cover" />
              <div className="pointer-events-none absolute inset-[12%] rounded-[46%] border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.18)]" />
              <span className="absolute bottom-5 rounded-lg bg-zinc-950/80 px-3 py-1.5 text-xs text-white">
                Giữ khuôn mặt trong khung
              </span>
            </>
          ) : asset ? (
            <Image
              src={asset.previewUrl}
              alt="Ảnh chân dung"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="px-8 text-center">
              <Camera className="mx-auto size-14 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-800">Chụp ảnh trực tiếp</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Giữ thiết bị ngang tầm mắt, khuôn mặt đủ sáng và nằm giữa khung.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          {cameraOpen ? (
            <>
              <Button onClick={onCapture} disabled={busy} className="h-10 w-full rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400 sm:w-auto">
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Camera className="mr-2 size-4" />}
                Chụp ngay
              </Button>
              <Button variant="outline" onClick={onCloseCamera} className="h-10 w-full rounded-xl border-zinc-200 bg-white px-5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 sm:w-auto">Đóng camera</Button>
            </>
          ) : (
            <Button
              variant={asset ? "outline" : "default"}
              onClick={() => {
                if (asset) onRemove();
                onOpenCamera();
              }}
              disabled={busy}
              className={
                asset
                  ? "h-10 w-full rounded-xl border-zinc-200 bg-white px-5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 sm:w-auto"
                  : "h-10 w-full rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400 sm:w-auto"
              }
            >
              {asset ? <RefreshCw className="mr-2 size-4" /> : <Camera className="mr-2 size-4" />}
              {asset ? "Chụp lại" : "Mở camera"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} className="h-10 w-full rounded-xl border-zinc-200 bg-white px-5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 sm:w-auto">Quay lại</Button>
        <Button onClick={onNext} disabled={!asset || busy} className="h-10 w-full rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400 sm:w-auto">
          Tiếp tục
        </Button>
      </div>
    </section>
  );
}
