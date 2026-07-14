import { Check, Circle, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LIVENESS_PROMPTS } from "../ekyc-constants";
import type { EkycAsset } from "../ekyc-types";

interface Props {
  asset: EkycAsset | null;
  cameraOpen: boolean;
  recording: boolean;
  uploading: boolean;
  stepIndex: number;
  progress: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onOpenCamera: () => void;
  onStart: () => void;
  onCancel: () => void;
  onRetake: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function LivenessStep({
  asset,
  cameraOpen,
  recording,
  uploading,
  stepIndex,
  progress,
  videoRef,
  onOpenCamera,
  onStart,
  onCancel,
  onRetake,
  onBack,
  onNext,
}: Props) {
  const prompt = LIVENESS_PROMPTS[stepIndex];
  const PromptIcon = prompt.icon;

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          Bước 4/5: Video khuôn mặt
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Thực hiện bốn động tác trong một video liên tục 6 giây.
        </p>
      </header>

      {asset && !cameraOpen ? (
        <div className="mx-auto max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <Check className="mx-auto size-10 text-emerald-600" />
          <h3 className="mt-3 font-semibold text-zinc-950">Video đã sẵn sàng</h3>
          <p className="mt-1 text-sm text-zinc-600">Video sẽ được AI kiểm tra sau khi gửi hồ sơ.</p>
          <Button variant="outline" onClick={onRetake} className="mt-5 h-10 rounded-xl border-zinc-200 bg-white px-5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950">
            Quay lại video
          </Button>
        </div>
      ) : cameraOpen ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
              <video ref={videoRef} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" />
              <div className="pointer-events-none absolute inset-[12%] rounded-[46%] border-2 border-white/90" />
              {recording ? (
                <span className="absolute left-4 top-4 rounded-lg bg-zinc-950/80 px-3 py-1.5 text-xs text-white">
                  <span className="mr-2 inline-block size-2 rounded-full bg-red-500" />
                  Đang ghi hình tự động
                </span>
              ) : null}
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-xl bg-zinc-950/80 px-4 py-3 text-white">
                <PromptIcon className="size-5" />
                <span className="font-medium">{prompt.title}</span>
              </div>
            </div>
            <div className="space-y-2 p-4">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{prompt.helper}</span>
                <span>{Math.ceil((100 - progress) * 0.06)} giây</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full bg-red-600 transition-[width] duration-100" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <aside>
            <h3 className="text-sm font-semibold text-zinc-950">Thực hiện theo 4 bước</h3>
            <div className="mt-3 space-y-2">
              {LIVENESS_PROMPTS.map((item, index) => {
                const done = recording && index < stepIndex;
                const active = recording && index === stepIndex;
                return (
                  <div
                    key={item.title}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3",
                      done && "border-emerald-200 bg-emerald-50",
                      active && "border-red-200 bg-red-50",
                      !done && !active && "border-zinc-200",
                    )}
                  >
                    <span className={cn("flex size-8 items-center justify-center rounded-full border", done && "border-emerald-500 bg-emerald-500 text-white", active && "border-red-500 text-red-600")}>
                      {done ? <Check className="size-4" /> : <Circle className="size-3" />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                      <p className="text-[11px] text-zinc-500">{done ? "Hoàn thành" : active ? "Đang thực hiện" : "Chưa thực hiện"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={recording ? onCancel : onStart}
              disabled={uploading}
              className="mt-3 h-10 w-full rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
            >
              {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Video className="mr-2 size-4" />}
              {recording ? "Hủy quay" : uploading ? "Đang tải video" : "Bắt đầu ghi"}
            </Button>
          </aside>
        </div>
      ) : (
        <div className="mx-auto max-w-lg rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <Video className="mx-auto size-12 text-zinc-300" />
          <p className="mt-4 text-sm font-medium text-zinc-900">Sẵn sàng xác thực khuôn mặt</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">Đảm bảo đủ sáng và không che khuôn mặt.</p>
          <Button onClick={onOpenCamera} className="mt-5 h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400">Mở camera</Button>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} className="h-10 w-full rounded-xl border-zinc-200 bg-white px-5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 sm:w-auto">Quay lại</Button>
        <Button onClick={onNext} disabled={!asset || uploading} className="h-10 w-full rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400 sm:w-auto">
          Kiểm tra & gửi
        </Button>
      </div>
    </section>
  );
}
