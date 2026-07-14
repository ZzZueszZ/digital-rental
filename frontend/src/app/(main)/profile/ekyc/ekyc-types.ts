import type { KycOcrPreviewResponse } from "@/services/identity";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type CaptureTarget = "front" | "back" | "selfie" | "liveness";

export type ImageTarget = Exclude<CaptureTarget, "liveness">;

export interface EkycAsset {
  assetId: string;
  previewUrl: string;
}

export interface EkycMedia {
  front: EkycAsset | null;
  back: EkycAsset | null;
  selfie: EkycAsset | null;
  liveness: EkycAsset | null;
}

export interface EkycWizardState {
  step: WizardStep;
  media: EkycMedia;
  ocrPreview: KycOcrPreviewResponse | null;
}

export const EMPTY_MEDIA: EkycMedia = {
  front: null,
  back: null,
  selfie: null,
  liveness: null,
};
