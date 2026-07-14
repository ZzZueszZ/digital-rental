import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ScanFace,
} from "lucide-react";

export const WIZARD_STEPS = [
  "Mặt trước CCCD",
  "Mặt sau CCCD",
  "Ảnh chân dung",
  "Video khuôn mặt",
  "Kiểm tra & gửi",
] as const;

export const LIVENESS_PROMPTS = [
  {
    title: "Nhìn thẳng",
    helper: "Đặt khuôn mặt trong khung và nhìn vào camera.",
    icon: ScanFace,
  },
  {
    title: "Quay mặt sang trái",
    helper: "Xoay đầu nhẹ sang trái, giữ điện thoại đứng yên.",
    icon: ArrowLeft,
  },
  {
    title: "Quay mặt sang phải",
    helper: "Xoay đầu nhẹ sang phải và vẫn giữ mặt trong khung.",
    icon: ArrowRight,
  },
  {
    title: "Nhìn thẳng lại",
    helper: "Quay về giữa và giữ yên đến khi hoàn tất.",
    icon: CheckCircle2,
  },
] as const;

export const LIVENESS_TOTAL_MS = 6_000;
export const LIVENESS_PHASE_MS = 1_500;
export const MIN_LIVENESS_SECONDS = 4.5;
export const MAX_LIVENESS_SECONDS = 7;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
