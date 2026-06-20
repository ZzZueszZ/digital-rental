import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { SupportStatus, SupportSubject } from "@/types/support";

export const SUPPORT_STATUS_CONFIG = {
  [SupportStatus.PENDING]: {
    color: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Chờ xử lý",
    icon: Clock,
  },
  [SupportStatus.IN_PROGRESS]: {
    color: "border-blue-200 bg-blue-50 text-blue-700",
    label: "Đang xử lý",
    icon: Loader2,
  },
  [SupportStatus.RESOLVED]: {
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: "Đã giải quyết",
    icon: CheckCircle2,
  },
  [SupportStatus.CLOSED]: {
    color: "border-zinc-200 bg-zinc-50 text-zinc-600",
    label: "Đã đóng",
    icon: AlertCircle,
  },
};

export const SUPPORT_SUBJECT_LABELS = {
  [SupportSubject.PRODUCT_INQUIRY]: "Sản phẩm",
  [SupportSubject.ORDER_ISSUE]: "Đơn hàng",
  [SupportSubject.PAYMENT_ISSUE]: "Thanh toán",
  [SupportSubject.TECHNICAL_SUPPORT]: "Kỹ thuật",
  [SupportSubject.OTHER]: "Khác",
};
