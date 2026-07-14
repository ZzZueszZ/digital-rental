"use client";

import { Loader2 } from "lucide-react";
import { EkycProgress } from "./_components/ekyc-progress";
import { DocumentCaptureStep } from "./_components/document-capture-step";
import { LivenessStep } from "./_components/liveness-step";
import { ReviewStep } from "./_components/review-step";
import { SelfieStep } from "./_components/selfie-step";
import { VerificationStatus } from "./_components/verification-status";
import { useEkycFlow } from "./_hooks/use-ekyc-flow";

const TERMINAL_STATUSES = new Set([
  "APPROVED",
  "PENDING_REVIEW",
  "PROCESSING",
  "REJECTED",
  "FAILED",
  "CANCELLED",
]);

export default function EkycPage() {
  const flow = useEkycFlow();

  if (flow.loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-zinc-100 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-red-600" />
          <p className="mt-3 text-sm text-zinc-500">Đang kiểm tra hồ sơ định danh...</p>
        </div>
      </div>
    );
  }

  if (flow.session && TERMINAL_STATUSES.has(flow.session.status)) {
    return (
      <VerificationStatus
        session={flow.session}
        busy={flow.busy !== null}
        onRefresh={() => void flow.loadStatus()}
        onRetry={() => void flow.initiate()}
      />
    );
  }

  const openDocumentCamera =
    flow.step === 1 ? flow.camera.target === "front" : flow.camera.target === "back";

  return (
    <main className="animate-in rounded-xl border border-zinc-100 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)] duration-500 fade-in slide-in-from-right-4">
      <header className="border-b border-zinc-100 p-5 sm:p-8 md:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Xác thực danh tính
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
          Hoàn tất eKYC để bảo vệ tài khoản và đủ điều kiện thuê thiết bị.
        </p>
        <div className="mt-7 overflow-x-auto pb-2">
          <EkycProgress step={flow.step} />
        </div>
      </header>

      <div className="p-5 sm:p-8 md:p-10">
        {flow.step === 1 || flow.step === 2 ? (
          <DocumentCaptureStep
            target={flow.step === 1 ? "front" : "back"}
            asset={flow.step === 1 ? flow.media.front : flow.media.back}
            cameraOpen={openDocumentCamera}
            busy={flow.busy === (flow.step === 1 ? "front" : "back") || flow.busy === "ocr"}
            videoRef={flow.camera.videoRef}
            onFile={(file) => void flow.uploadImage(file, flow.step === 1 ? "front" : "back")}
            onOpenCamera={() => void flow.openCamera(flow.step === 1 ? "front" : "back")}
            onCapture={() => void flow.captureImage(flow.step === 1 ? "front" : "back")}
            onCloseCamera={flow.camera.stop}
            onRemove={() => flow.updateAsset(flow.step === 1 ? "front" : "back", null)}
            onBack={flow.step === 2 ? () => flow.setStep(1) : undefined}
            onNext={() => void flow.next()}
          />
        ) : null}

        {flow.step === 3 ? (
          <SelfieStep
            asset={flow.media.selfie}
            cameraOpen={flow.camera.target === "selfie"}
            busy={flow.busy === "selfie"}
            videoRef={flow.camera.videoRef}
            onOpenCamera={() => void flow.openCamera("selfie")}
            onCapture={() => void flow.captureImage("selfie")}
            onCloseCamera={flow.camera.stop}
            onRemove={() => flow.updateAsset("selfie", null)}
            onBack={() => flow.setStep(2)}
            onNext={() => void flow.next()}
          />
        ) : null}

        {flow.step === 4 ? (
          <LivenessStep
            asset={flow.media.liveness}
            cameraOpen={flow.camera.target === "liveness"}
            recording={flow.recorder.recording}
            uploading={flow.busy === "liveness"}
            stepIndex={flow.recorder.stepIndex}
            progress={flow.recorder.progress}
            videoRef={flow.camera.videoRef}
            onOpenCamera={() => void flow.openCamera("liveness")}
            onStart={() => {
              if (flow.camera.streamRef.current) {
                flow.recorder.start(flow.camera.streamRef.current);
              }
            }}
            onCancel={() => {
              flow.recorder.cancel();
              flow.camera.stop();
            }}
            onRetake={() => {
              flow.updateAsset("liveness", null);
              void flow.openCamera("liveness");
            }}
            onBack={() => {
              flow.recorder.cancel();
              flow.camera.stop();
              flow.setStep(3);
            }}
            onNext={() => void flow.next()}
          />
        ) : null}

        {flow.step === 5 ? (
          <ReviewStep
            media={flow.media}
            preview={flow.ocrPreview}
            submitting={flow.busy === "submit"}
            onBack={() => flow.setStep(4)}
            onSubmit={() => void flow.submit()}
          />
        ) : null}
      </div>
    </main>
  );
}
