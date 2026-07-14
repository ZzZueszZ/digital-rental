import Image from "next/image";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EkycAsset, ImageTarget } from "../ekyc-types";
import { PhotoGuidance } from "./photo-guidance";

interface Props {
  target: Extract<ImageTarget, "front" | "back">;
  asset: EkycAsset | null;
  cameraOpen: boolean;
  busy: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onFile: (file: File) => void;
  onOpenCamera: () => void;
  onCapture: () => void;
  onCloseCamera: () => void;
  onRemove: () => void;
  onBack?: () => void;
  onNext: () => void;
}

export function DocumentCaptureStep({
  target,
  asset,
  cameraOpen,
  busy,
  videoRef,
  onFile,
  onOpenCamera,
  onCapture,
  onCloseCamera,
  onRemove,
  onBack,
  onNext,
}: Props) {
  const isFront = target === "front";
  const side = isFront ? "mặt trước" : "mặt sau";

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          Bước {isFront ? 1 : 2}/5: {isFront ? "Mặt trước" : "Mặt sau"} CCCD
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Chụp hoặc tải lên ảnh {side} Căn cước công dân của bạn.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-4">
          <div className="relative flex aspect-[1.6/1] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-zinc-50">
            {cameraOpen ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="size-full object-cover" />
                <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-white/80" />
                <span className="absolute bottom-4 rounded-lg bg-zinc-950/80 px-3 py-1.5 text-xs text-white">
                  Đặt {side} CCCD trong khung
                </span>
              </>
            ) : asset ? (
              <>
                <Image
                  src={asset.previewUrl}
                  alt={`Ảnh ${side} CCCD`}
                  fill
                  unoptimized
                  className="object-contain p-3"
                />
                <button
                  type="button"
                  onClick={onRemove}
                  className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-zinc-950 text-white"
                  aria-label={`Xóa ảnh ${side}`}
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <div className="px-6 text-center">
                <Camera className="mx-auto size-12 text-zinc-300" />
                <p className="mt-4 text-sm font-medium text-zinc-800">Chưa có ảnh</p>
                <p className="mt-1 text-xs text-zinc-500">Hỗ trợ JPG, PNG · Tối đa 10 MB</p>
              </div>
            )}
          </div>

          {cameraOpen ? (
            <div className="flex justify-center gap-3">
              <Button onClick={onCapture} disabled={busy}>Chụp ảnh</Button>
              <Button variant="outline" onClick={onCloseCamera}>Đóng camera</Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-50">
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                Chọn ảnh từ máy
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onFile(file);
                    event.target.value = "";
                  }}
                />
              </label>
              <Button variant="outline" onClick={onOpenCamera} disabled={busy} className="h-11 rounded-xl">
                <Camera className="mr-2 size-4" /> Mở camera
              </Button>
            </div>
          )}
        </div>
        <PhotoGuidance />
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-5">
        {onBack ? <Button variant="outline" onClick={onBack}>Quay lại</Button> : <span />}
        <Button onClick={onNext} disabled={!asset || busy} className="bg-red-600 hover:bg-red-700">
          {isFront ? "Tiếp tục" : "Trích xuất thông tin & tiếp tục"}
        </Button>
      </div>
    </section>
  );
}
