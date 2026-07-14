"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { identityService, type KycOcrPreviewResponse, type KycSessionResponse } from "@/services/identity";
import { useMyProfile } from "@/services/profile";
import type { CaptureTarget, EkycAsset, EkycMedia, ImageTarget, WizardStep } from "../ekyc-types";
import { EMPTY_MEDIA } from "../ekyc-types";
import { getApiErrorMessage, revokePreviewUrl, validateImageFile } from "../ekyc-utils";
import { useEkycCamera } from "./use-ekyc-camera";
import { useLivenessRecorder } from "./use-liveness-recorder";

const PURPOSES = {
  front: "KYC_ID_FRONT",
  back: "KYC_ID_BACK",
  selfie: "KYC_SELFIE",
  liveness: "KYC_LIVENESS_VIDEO",
} as const;

type BusyAction = keyof typeof PURPOSES | "ocr" | "submit" | "initiate" | null;

export function useEkycFlow() {
  const { refetch: refetchProfile } = useMyProfile();
  const camera = useEkycCamera();
  const [session, setSession] = useState<KycSessionResponse | null>(null);
  const [step, setStep] = useState<WizardStep>(1);
  const [media, setMedia] = useState<EkycMedia>(EMPTY_MEDIA);
  const [ocrPreview, setOcrPreview] = useState<KycOcrPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyAction>(null);
  const mediaRef = useRef(media);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  const updateAsset = useCallback((target: keyof EkycMedia, asset: EkycAsset | null) => {
    setMedia((current) => {
      revokePreviewUrl(current[target]?.previewUrl);
      return { ...current, [target]: asset };
    });
    if (target === "front" || target === "back") setOcrPreview(null);
  }, []);

  const clearWizard = useCallback(() => {
    setMedia((current) => {
      Object.values(current).forEach((asset) => revokePreviewUrl(asset?.previewUrl));
      return EMPTY_MEDIA;
    });
    setOcrPreview(null);
    setStep(1);
    camera.stop();
  }, [camera]);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      setSession(await identityService.getKycStatus());
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải trạng thái eKYC."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(
    () => () => {
      Object.values(mediaRef.current).forEach((asset) =>
        revokePreviewUrl(asset?.previewUrl),
      );
    },
    [],
  );

  const initiate = useCallback(async () => {
    setBusy("initiate");
    try {
      const nextSession = await identityService.initiateKyc();
      clearWizard();
      setSession(nextSession);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể khởi tạo phiên xác thực."));
    } finally {
      setBusy(null);
    }
  }, [clearWizard]);

  const uploadImage = useCallback(async (file: File, target: ImageTarget) => {
    try {
      validateImageFile(file);
      setBusy(target);
      const asset = await identityService.uploadKycAsset(file, PURPOSES[target]);
      updateAsset(target, { assetId: asset.id, previewUrl: URL.createObjectURL(file) });
      toast.success("Ảnh đã được tải lên an toàn.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải ảnh. Vui lòng thử lại."));
    } finally {
      setBusy(null);
    }
  }, [updateAsset]);

  const openCamera = useCallback(async (target: CaptureTarget) => {
    try {
      await camera.start(target);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể mở camera. Hãy kiểm tra quyền camera của trình duyệt.",
        ),
      );
    }
  }, [camera]);

  const captureImage = useCallback(async (target: ImageTarget) => {
    try {
      const file = camera.capture(target);
      camera.stop();
      await uploadImage(file, target);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể chụp ảnh."));
    }
  }, [camera, uploadImage]);

  const runOcr = useCallback(async () => {
    if (!media.front || !media.back) return null;
    setBusy("ocr");
    try {
      const preview = await identityService.previewOcr({
        frontImageAssetId: media.front.assetId,
        backImageAssetId: media.back.assetId,
      });
      setOcrPreview(preview);
      toast[preview.warnings?.length ? "warning" : "success"](
        preview.warnings?.length
          ? "Thông tin OCR cần được kiểm tra lại."
          : "Đã trích xuất thông tin CCCD.",
      );
      return preview;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "OCR thất bại. Vui lòng chụp lại CCCD rõ hơn."));
      return null;
    } finally {
      setBusy(null);
    }
  }, [media.back, media.front]);

  const next = useCallback(async () => {
    if (step === 1 && !media.front) return toast.error("Vui lòng thêm ảnh mặt trước CCCD.");
    if (step === 2) {
      if (!media.back) return toast.error("Vui lòng thêm ảnh mặt sau CCCD.");
      if (!ocrPreview && !(await runOcr())) return;
    }
    if (step === 3 && !media.selfie) return toast.error("Vui lòng chụp ảnh chân dung.");
    if (step === 4 && !media.liveness) return toast.error("Vui lòng hoàn tất video khuôn mặt.");
    setStep((current) => Math.min(5, current + 1) as WizardStep);
  }, [media, ocrPreview, runOcr, step]);

  const uploadLiveness = useCallback(async (file: File) => {
    setBusy("liveness");
    try {
      const asset = await identityService.uploadKycAsset(file, PURPOSES.liveness);
      updateAsset("liveness", { assetId: asset.id, previewUrl: URL.createObjectURL(file) });
      toast.success("Video khuôn mặt đã sẵn sàng.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải video xác thực."));
    } finally {
      setBusy(null);
      camera.stop();
    }
  }, [camera, updateAsset]);

  const recorder = useLivenessRecorder(uploadLiveness, (error) => {
    toast.error(getApiErrorMessage(error, "Không thể xử lý video xác thực."));
    camera.stop();
  });

  const submit = useCallback(async () => {
    const assets = [media.front, media.back, media.selfie, media.liveness];
    if (assets.some((asset) => !asset)) return toast.error("Hồ sơ chưa đủ 4 tệp xác thực.");
    setBusy("submit");
    try {
      const result = await identityService.submitKyc({
        frontImageAssetId: media.front!.assetId,
        backImageAssetId: media.back!.assetId,
        selfieImageAssetId: media.selfie!.assetId,
        livenessVideoAssetId: media.liveness!.assetId,
      });
      setSession(result);
      await refetchProfile();
      toast.success("Hồ sơ đã được gửi để kiểm duyệt.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gửi hồ sơ xác thực thất bại."));
    } finally {
      setBusy(null);
    }
  }, [media, refetchProfile]);

  return {
    session, step, setStep, media, ocrPreview, loading, busy,
    camera, recorder, initiate, loadStatus, openCamera, uploadImage, captureImage,
    updateAsset, runOcr, next, submit,
  };
}
