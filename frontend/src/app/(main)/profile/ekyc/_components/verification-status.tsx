import { Fingerprint, Loader2, RefreshCw, RotateCcw, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KycSessionResponse } from "@/services/identity";
import { formatScore } from "../ekyc-utils";

interface Props {
  session: KycSessionResponse;
  busy: boolean;
  onRefresh: () => void;
  onRetry: () => void;
}

export function VerificationStatus({ session, busy, onRefresh, onRetry }: Props) {
  if (session.status === "APPROVED") {
    return (
      <StatusFrame icon={<ShieldCheck className="size-9" />} tone="success" title="Định danh đã xác thực" description="Hồ sơ của bạn đã được phê duyệt và đủ điều kiện thuê thiết bị.">
        <div className="grid gap-4 rounded-xl border border-zinc-100 bg-zinc-50/70 p-5 sm:grid-cols-2">
          <Field label="Họ và tên" value={session.fullName} />
          <Field label="Số CCCD" value={session.identityNumber} />
          <Field label="Khớp khuôn mặt" value={formatScore(session.faceMatchScore)} />
          <Field label="Độ tin cậy OCR" value={formatScore(session.ocrConfidence)} />
        </div>
      </StatusFrame>
    );
  }

  if (session.status === "PENDING_REVIEW" || session.status === "PROCESSING") {
    const processing = session.status === "PROCESSING";
    return (
      <StatusFrame icon={processing ? <Loader2 className="size-9 animate-spin" /> : <Fingerprint className="size-9" />} tone="warning" title={processing ? "AI đang kiểm tra hồ sơ" : "Hồ sơ đang chờ phê duyệt"} description={processing ? "Hệ thống đang chạy OCR, khớp mặt và kiểm tra liveness." : "Quản trị viên đang đối chiếu kết quả AI và tài liệu của bạn."}>
        <Button onClick={onRefresh} disabled={busy} className="h-10 w-full rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400 sm:w-auto">
          <RefreshCw className="mr-2 size-4" /> Làm mới trạng thái
        </Button>
      </StatusFrame>
    );
  }

  const cancelled = session.status === "CANCELLED";
  return (
    <StatusFrame icon={<ShieldAlert className="size-9" />} tone="danger" title={cancelled ? "Phiên xác thực đã hủy" : "Hồ sơ chưa được chấp nhận"} description={session.failureReason || session.reviewNote || "Vui lòng chuẩn bị lại ảnh rõ nét và thực hiện xác thực lại."}>
      <Button onClick={onRetry} disabled={busy} className="h-10 w-full rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400 sm:w-auto">
        {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RotateCcw className="mr-2 size-4" />}
        Thử xác thực lại
      </Button>
    </StatusFrame>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return <div><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-sm font-medium text-zinc-900">{value || "Chưa có"}</p></div>;
}

function StatusFrame({ icon, tone, title, description, children }: { icon: React.ReactNode; tone: "success" | "warning" | "danger"; title: string; description: string; children: React.ReactNode }) {
  const toneClass = tone === "success" ? "bg-emerald-50 text-emerald-600" : tone === "warning" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600";
  return (
    <div className="animate-in rounded-xl border border-zinc-100 bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)] duration-500 fade-in slide-in-from-right-4 sm:p-8 md:p-10">
      <div className="flex flex-col gap-5 border-b border-zinc-100 pb-7 sm:flex-row sm:items-center">
        <span className={`flex size-16 items-center justify-center rounded-xl ${toneClass}`}>{icon}</span>
        <div><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p></div>
      </div>
      <div className="mt-7">{children}</div>
    </div>
  );
}
