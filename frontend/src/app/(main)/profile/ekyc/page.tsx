"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  identityService,
  KycOcrPreviewResponse,
  KycSessionResponse,
} from "@/services/identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Camera,
  UploadCloud,
  AlertCircle,
  Fingerprint,
  RefreshCw,
  Upload,
  Video,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  ScanFace,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMyProfile } from "@/services/profile";

function base64ToFile(base64String: string, filename: string): File {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const LIVENESS_PROMPTS = [
  {
    title: "Nhìn thẳng vào khung hình.",
    helper: "Đặt khuôn mặt trong vòng tròn, mắt nhìn vào camera.",
    icon: ScanFace,
  },
  {
    title: "Quay mặt sang trái.",
    helper: "Xoay đầu nhẹ sang trái, không đưa điện thoại theo mặt.",
    icon: ArrowLeft,
  },
  {
    title: "Quay mặt sang phải.",
    helper: "Xoay đầu nhẹ sang phải, giữ khuôn mặt vẫn trong khung.",
    icon: ArrowRight,
  },
  {
    title: "Nhìn thẳng lại và giữ yên.",
    helper: "Quay về giữa, giữ yên để hệ thống lấy khung hình rõ nhất.",
    icon: CheckCircle2,
  },
] as const;

const MIN_LIVENESS_STEP_MS = 1200;

export default function EkycPage() {
  const { refetch: refetchProfile } = useMyProfile();

  const [kycSession, setKycSession] = useState<KycSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Front CCCD, 2: Back CCCD, 3: Selfie, 4: Liveness, 5: Review & Submit

  // Camera settings
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeCameraFor, setActiveCameraFor] = useState<
    "front" | "back" | "selfie" | "liveness" | null
  >(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [recordingLiveness, setRecordingLiveness] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const livenessShouldUploadRef = useRef(false);

  // Upload image URLs
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [livenessVideo, setLivenessVideo] = useState<string | null>(null);
  const [livenessStepIndex, setLivenessStepIndex] = useState(0);
  const [completedLivenessSteps, setCompletedLivenessSteps] = useState<
    boolean[]
  >(() => LIVENESS_PROMPTS.map(() => false));
  const [livenessStepStartedAt, setLivenessStepStartedAt] = useState<
    number | null
  >(null);
  const [livenessElapsedMs, setLivenessElapsedMs] = useState(0);
  const [ocrPreview, setOcrPreview] = useState<KycOcrPreviewResponse | null>(
    null,
  );
  const [previewingOcr, setPreviewingOcr] = useState(false);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      const data = await identityService.getKycStatus();
      setKycSession(data);
    } catch (err) {
      console.error("Failed to load KYC status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!recordingLiveness || !livenessStepStartedAt) return;
    const timer = window.setInterval(() => {
      setLivenessElapsedMs(Date.now() - livenessStepStartedAt);
    }, 150);
    return () => window.clearInterval(timer);
  }, [recordingLiveness, livenessStepStartedAt]);

  const startCamera = async (
    target: "front" | "back" | "selfie" | "liveness",
  ) => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode:
            target === "front" || target === "back" ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: target === "liveness",
      });
      streamRef.current = stream;
      setActiveCameraFor(target);
      setIsCameraOpen(true);
      // Wait for next render cycle to let videoRef link
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast.error(
        "Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera của trình duyệt.",
      );
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      livenessShouldUploadRef.current = false;
      mediaRecorderRef.current.stop();
    }
    setRecordingLiveness(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setActiveCameraFor(null);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !activeCameraFor) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg");
    const target = activeCameraFor;
    stopCamera();

    try {
      setUploadingImage(true);
      const file = base64ToFile(dataUrl, `${target}.jpg`);
      let uploadedUrl = "";
      if (target === "front") {
        uploadedUrl = await identityService.uploadFront(file);
        setFrontImage(uploadedUrl);
        setOcrPreview(null);
      } else if (target === "back") {
        uploadedUrl = await identityService.uploadBack(file);
        setBackImage(uploadedUrl);
        setOcrPreview(null);
      } else {
        uploadedUrl = await identityService.uploadSelfie(file);
        setSelfieImage(uploadedUrl);
      }
      toast.success("Chụp và tải ảnh lên thành công!");
    } catch (error) {
      toast.error("Tải ảnh chụp lên thất bại. Vui lòng chụp lại.");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "front" | "back",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      let uploadedUrl = "";
      if (target === "front") {
        uploadedUrl = await identityService.uploadFront(file);
        setFrontImage(uploadedUrl);
        setOcrPreview(null);
      } else {
        uploadedUrl = await identityService.uploadBack(file);
        setBackImage(uploadedUrl);
        setOcrPreview(null);
      }
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      toast.error("Tải ảnh lên thất bại. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStartKyc = async () => {
    try {
      setLoading(true);
      const data = await identityService.initiateKyc();
      setKycSession(data);
      setStep(1);
      setFrontImage(null);
      setBackImage(null);
      setSelfieImage(null);
      setLivenessVideo(null);
      setLivenessStepIndex(0);
      setCompletedLivenessSteps(LIVENESS_PROMPTS.map(() => false));
      setLivenessStepStartedAt(null);
      setLivenessElapsedMs(0);
      setOcrPreview(null);
    } catch {
      toast.error("Không thể khởi tạo phiên xác thực");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = () => {
    if (!frontImage) {
      toast.error("Vui lòng tải lên hoặc chụp ảnh mặt trước CCCD");
      return;
    }
    setStep(2);
  };

  const runOcrPreview = async () => {
    if (!frontImage || !backImage) {
      toast.error("Vui lòng tải lên đủ hai mặt CCCD trước khi trích xuất OCR");
      return null;
    }
    try {
      setPreviewingOcr(true);
      const preview = await identityService.previewOcr({
        frontImageUrl: frontImage,
        backImageUrl: backImage,
      });
      setOcrPreview(preview);
      if (preview.warnings?.length) {
        toast.warning("Thông tin OCR cần kiểm tra lại trước khi tiếp tục.");
      } else {
        toast.success("Đã trích xuất thông tin CCCD");
      }
      return preview;
    } catch (error) {
      toast.error("Trích xuất OCR thất bại. Vui lòng chụp lại CCCD rõ hơn.");
      console.error(error);
      return null;
    } finally {
      setPreviewingOcr(false);
    }
  };

  const startLivenessRecording = () => {
    if (!streamRef.current) return;
    setLivenessVideo(null);
    setLivenessStepIndex(0);
    setCompletedLivenessSteps(LIVENESS_PROMPTS.map(() => false));
    setLivenessElapsedMs(0);
    setLivenessStepStartedAt(Date.now());
    livenessShouldUploadRef.current = false;
    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "";
    const recorder = new MediaRecorder(
      streamRef.current,
      mimeType ? { mimeType } : undefined,
    );
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: mimeType || "video/webm",
      });
      if (!livenessShouldUploadRef.current || blob.size === 0) {
        setUploadingImage(false);
        setRecordingLiveness(false);
        setLivenessStepStartedAt(null);
        setLivenessElapsedMs(0);
        livenessShouldUploadRef.current = false;
        return;
      }
      const file = new File([blob], "liveness.webm", {
        type: mimeType || "video/webm",
      });
      try {
        setUploadingImage(true);
        const uploadedUrl = await identityService.uploadLivenessVideo(file);
        setLivenessVideo(uploadedUrl);
        toast.success("Video xác thực khuôn mặt đã sẵn sàng");
      } catch (error) {
        toast.error("Tải video xác thực thất bại. Vui lòng quay lại.");
        console.error(error);
      } finally {
        setUploadingImage(false);
        setRecordingLiveness(false);
        setLivenessStepStartedAt(null);
        setLivenessElapsedMs(0);
        livenessShouldUploadRef.current = false;
        stopCamera();
      }
    };
    recorder.start(250);
    setRecordingLiveness(true);
  };

  const stopLivenessRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      livenessShouldUploadRef.current = true;
      mediaRecorderRef.current.stop();
    }
  };

  const cancelLivenessRecording = () => {
    livenessShouldUploadRef.current = false;
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setRecordingLiveness(false);
    setLivenessStepIndex(0);
    setCompletedLivenessSteps(LIVENESS_PROMPTS.map(() => false));
    setLivenessStepStartedAt(null);
    setLivenessElapsedMs(0);
    stopCamera();
  };

  const validateCurrentLivenessStep = () => {
    const video = videoRef.current;
    const elapsed = livenessStepStartedAt
      ? Date.now() - livenessStepStartedAt
      : 0;
    if (
      !recordingLiveness ||
      !video ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      toast.error(
        "Camera chưa sẵn sàng. Vui lòng giữ khuôn mặt trong khung hình.",
      );
      return;
    }
    if (elapsed < MIN_LIVENESS_STEP_MS) {
      toast.error("Giữ tư thế thêm một chút để video rõ hơn.");
      return;
    }

    const nextCompleted = completedLivenessSteps.map((done, index) =>
      index === livenessStepIndex ? true : done,
    );
    setCompletedLivenessSteps(nextCompleted);

    const isLastStep = livenessStepIndex === LIVENESS_PROMPTS.length - 1;
    if (isLastStep) {
      toast.success("Đã đủ góc mặt. Đang tải video xác thực...");
      stopLivenessRecording();
      return;
    }

    setLivenessStepIndex((current) => current + 1);
    setLivenessStepStartedAt(Date.now());
    setLivenessElapsedMs(0);
  };

  const handleStep3Submit = async () => {
    if (!backImage) {
      toast.error("Vui lòng tải lên hoặc chụp ảnh mặt sau CCCD");
      return;
    }
    if (!ocrPreview) {
      const preview = await runOcrPreview();
      if (!preview) return;
    }
    setStep(3);
  };

  const handleStep4Submit = () => {
    if (!selfieImage) {
      toast.error("Vui lòng chụp ảnh chân dung selfie");
      return;
    }
    setStep(4);
  };

  const handleStep5Submit = () => {
    if (!livenessVideo) {
      toast.error("Vui lòng quay video xác thực khuôn mặt");
      return;
    }
    setStep(5);
  };

  const handleSubmitAll = async () => {
    try {
      setSubmitting(true);
      if (!ocrPreview) {
        const preview = await runOcrPreview();
        if (!preview) return;
      }
      if (!livenessVideo) {
        toast.error(
          "Vui lòng quay video xác thực khuôn mặt trước khi gửi hồ sơ",
        );
        return;
      }
      const data = await identityService.submitKyc({
        frontImageUrl: frontImage || "",
        backImageUrl: backImage || "",
        selfieImageUrl: selfieImage || "",
        livenessVideoUrl: livenessVideo,
      });

      if (data.status === "REJECTED") {
        toast.error(
          "AI từ chối định danh của bạn! Hãy nhấn thử lại và kiểm tra hình ảnh rõ nét hơn.",
        );
      } else {
        toast.success(
          "Hồ sơ đã được gửi thành công và đang chờ duyệt thủ công!",
        );
      }
      await refetchProfile();
      await fetchKycStatus();
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: unknown } } }).response
          ?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Gửi thông tin xác thực thất bại";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderOcrPreviewPanel = () => {
    if (!ocrPreview) return null;
    const fields = [
      ["Số CCCD", ocrPreview.identityNumber],
      ["Họ và tên", ocrPreview.fullName],
      ["Ngày sinh", ocrPreview.dateOfBirth],
      ["Giới tính", ocrPreview.gender],
      ["Quốc tịch", ocrPreview.nationality],
      ["Quê quán", ocrPreview.placeOfOrigin],
      ["Nơi thường trú", ocrPreview.placeOfResidence],
      ["Ngày cấp", ocrPreview.issuedDate],
      ["Ngày hết hạn", ocrPreview.expiryDate],
    ];

    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">
              Thông tin OCR trích xuất
            </h4>
            <p className="text-xs font-medium text-zinc-500 mt-1">
              Dữ liệu được đọc từ hai mặt CCCD. Vui lòng chụp lại nếu thông tin
              chưa chính xác.
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold tracking-wider",
              ocrPreview.previewStatus === "READY"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-amber-50 text-amber-700 border border-amber-100",
            )}
          >
            {ocrPreview.previewStatus === "READY" ? "Sẵn sàng" : "Cần kiểm tra"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-white bg-white px-3 py-2 shadow-sm min-w-0"
            >
              <div className="text-[10px] font-semibold text-zinc-400">
                {label}
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-800 break-words">
                {value || "-"}
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-white bg-white px-3 py-2 shadow-sm min-w-0">
            <div className="text-[10px] font-semibold text-zinc-400">
              Độ tin cậy OCR
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-800">
              {typeof ocrPreview.ocrConfidence === "number"
                ? `${(ocrPreview.ocrConfidence * 100).toFixed(1)}%`
                : "-"}
            </div>
          </div>
          <div className="rounded-xl border border-white bg-white px-3 py-2 shadow-sm min-w-0">
            <div className="text-[10px] font-semibold text-zinc-400">
              Loại giấy tờ
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-800 break-words">
              {ocrPreview.documentType || "-"}
            </div>
          </div>
        </div>

        {!!ocrPreview.warnings?.length && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 space-y-1">
            {ocrPreview.warnings.map((warning) => (
              <div
                key={warning}
                className="flex items-start gap-2 text-xs font-semibold text-amber-800"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] md:p-10 flex items-center justify-center min-h-[400px] animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-xs font-semibold text-zinc-400">
            Đang kiểm tra hồ sơ định danh của bạn...
          </p>
        </div>
      </div>
    );
  }

  // State 1: Verification Approved
  if (kycSession?.status === "APPROVED") {
    return (
      <div className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] md:p-10 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10 pb-8 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-zinc-950 tracking-[-0.03em] leading-tight">
                Định danh đã xác thực
              </h1>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-600 tracking-wider animate-pulse">
                Đủ điều kiện thuê
              </span>
            </div>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Hồ sơ định danh của bạn đã được hệ thống phê duyệt.
            </p>
          </div>
          <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-12">
          {/* Form grid matching info page styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">
                Số thẻ CCCD
              </label>
              <Input
                disabled
                value={kycSession.identityNumber}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">
                Họ và Tên
              </label>
              <Input
                disabled
                value={kycSession.fullName}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">
                Ngày sinh
              </label>
              <Input
                disabled
                value={
                  kycSession.dateOfBirth ? String(kycSession.dateOfBirth) : ""
                }
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">
                Giới tính
              </label>
              <Input
                disabled
                value={
                  kycSession.gender === "MALE"
                    ? "Nam"
                    : kycSession.gender === "FEMALE"
                      ? "Nữ"
                      : "Khác"
                }
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">
                Quốc tịch
              </label>
              <Input
                disabled
                value={kycSession.nationality}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">
                Nơi thường trú
              </label>
              <Input
                disabled
                value={kycSession.placeOfResidence}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* AI Metrics block */}
          <div className="bg-zinc-50/50 p-8 rounded-xl border border-zinc-100 space-y-6">
            <h3 className="text-sm font-semibold text-zinc-800 tracking-wider">
              Kết quả xác thực hệ thống
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500">
                    Độ tin cậy khớp mặt (Face ID)
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {(kycSession.faceMatchScore
                      ? kycSession.faceMatchScore * 100
                      : 95
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full animate-all duration-500"
                    style={{
                      width: `${kycSession.faceMatchScore ? kycSession.faceMatchScore * 100 : 95}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500">Độ chính xác OCR</span>
                  <span className="font-semibold text-emerald-600">
                    {(kycSession.ocrConfidence
                      ? kycSession.ocrConfidence * 100
                      : 96
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full animate-all duration-500"
                    style={{
                      width: `${kycSession.ocrConfidence ? kycSession.ocrConfidence * 100 : 96}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {kycSession.completedAt && (
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-semibold">
                <span>Thời gian hoàn thành xác thực</span>
                <span>
                  {new Date(kycSession.completedAt).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>

          {/* Verification documents */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-zinc-800 tracking-wider">
              Hình ảnh tài liệu lưu trữ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 tracking-wider block text-center md:text-left">
                  Mặt trước CCCD
                </span>
                <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-center shadow-sm p-2">
                  {kycSession.frontImageUrl && (
                    <Image
                      src={getImageUrl(kycSession.frontImageUrl)}
                      alt="Front CCCD"
                      width={1200}
                      height={750}
                      unoptimized
                      className="w-full h-full object-contain rounded-xl"
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 tracking-wider block text-center md:text-left">
                  Mặt sau CCCD
                </span>
                <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-center shadow-sm p-2">
                  {kycSession.backImageUrl && (
                    <Image
                      src={getImageUrl(kycSession.backImageUrl)}
                      alt="Back CCCD"
                      width={1200}
                      height={750}
                      unoptimized
                      className="w-full h-full object-contain rounded-xl"
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <span className="text-xs font-semibold text-zinc-400 tracking-wider block mb-2">
                  Ảnh chân dung
                </span>
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-zinc-200 bg-zinc-50/50 flex items-center justify-center shadow-md">
                  {kycSession.selfieImageUrl && (
                    <Image
                      src={getImageUrl(kycSession.selfieImageUrl)}
                      alt="Selfie"
                      width={600}
                      height={600}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Under Review / Pending Review
  if (kycSession?.status === "PENDING_REVIEW") {
    return (
      <div className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] md:p-10 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 pb-8 border-b border-zinc-100">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950 tracking-[-0.03em] leading-tight">
              Hồ sơ đang chờ phê duyệt
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Đội ngũ quản trị viên đang kiểm tra và đối chiếu hồ sơ của bạn.
            </p>
          </div>
          <div className="w-16 h-16 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm shrink-0">
            <Fingerprint className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-zinc-50/50 p-8 rounded-xl border border-zinc-100 space-y-8 shadow-sm">
            <div className="flex justify-between items-center text-xs font-semibold pb-4 border-b border-zinc-100">
              <span className="text-zinc-400 tracking-wider">
                Trạng thái hồ sơ
              </span>
              <span className="font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-100">
                Chờ phê duyệt thủ công
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500 ml-1">
                  Họ và tên
                </label>
                <Input
                  disabled
                  value={kycSession.fullName}
                  className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-sm cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500 ml-1">
                  Số CCCD
                </label>
                <Input
                  disabled
                  value={kycSession.identityNumber}
                  className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={fetchKycStatus}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" /> Làm mới trạng
              thái
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Rejected
  if (kycSession?.status === "REJECTED") {
    return (
      <div className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] md:p-10 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 pb-8 border-b border-zinc-100">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950 tracking-[-0.03em] leading-tight">
              Xác thực bị từ chối
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Thông tin xác minh của bạn không được phê duyệt. Vui lòng kiểm tra
              lý do và thực hiện lại.
            </p>
          </div>
          <div className="w-16 h-16 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm shrink-0">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        <div className="max-w-xl mx-auto space-y-8">
          {kycSession.failureReason && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-5 rounded-xl text-sm font-semibold shadow-sm">
              <p className="text-xs text-red-400 font-semibold tracking-wider mb-2">
                Lý do từ chối
              </p>
              <p className="text-zinc-800 leading-relaxed font-medium">
                {kycSession.failureReason}
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleStartKyc}
              className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95"
            >
              Thử xác thực lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Wizard Flow (NOT_STARTED, STARTED, CREATED)
  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-8 md:p-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-8 border-b border-zinc-100">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 tracking-[-0.03em] leading-tight">
            Xác thực định danh (eKYC)
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Yêu cầu bắt buộc để thuê thiết bị máy ảnh. Hệ thống sẽ tự trích xuất
            thông tin từ ảnh CCCD.
          </p>
        </div>

        {/* Steps Indicators */}
        <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-200 shrink-0 self-start md:self-auto shadow-sm">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-xs transition-all",
                step === num
                  ? "bg-red-600 text-white shadow-sm"
                  : step > num
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-white text-zinc-400 border border-black/5",
              )}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload Front of CCCD */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">
              Bước 1: Tải lên hoặc chụp ảnh mặt trước CCCD
            </h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Hình ảnh cần rõ nét, đủ ánh sáng, không bị mất góc hoặc bị lóa
              thông tin.
            </p>
          </div>

          {isCameraOpen && activeCameraFor === "front" ? (
            <div className="max-w-xl mx-auto flex flex-col items-center gap-6 bg-zinc-50/50 p-6 rounded-xl border border-zinc-200/60 shadow-sm">
              <div className="relative aspect-[1.6/1] w-full rounded-xl border border-zinc-200/80 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-4 border-2 border-dashed border-red-600/20 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] text-zinc-700 bg-white/95 border border-zinc-200/80 px-3 py-1.5 rounded-full tracking-wider font-semibold shadow-sm">
                    Đặt mặt trước CCCD vào khung này
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95"
                >
                  Chụp ảnh
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="h-10 px-5 rounded-xl border border-zinc-200 text-zinc-700 bg-white font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95"
                >
                  Đóng camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              {frontImage ? (
                <div className="relative aspect-[1.6/1] w-full rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center p-4">
                  <Image
                    src={getImageUrl(frontImage)}
                    alt="front cccd"
                    width={1200}
                    height={750}
                    unoptimized
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setFrontImage(null);
                      setOcrPreview(null);
                    }}
                    className="absolute top-3 right-3 bg-zinc-900/80 text-white rounded-lg px-2.5 py-1 text-[11px] font-semibold hover:bg-red-600 transition-colors shadow"
                  >
                    Thay đổi
                  </button>
                </div>
              ) : (
                <div className="aspect-[1.6/1] w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 bg-zinc-50/30 hover:bg-zinc-50/60 transition-all duration-300 flex flex-col items-center justify-center p-6">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <span className="text-xs font-semibold text-zinc-400">
                        Đang xử lý ảnh...
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-zinc-300 mb-4" />
                      <span className="text-xs font-semibold text-zinc-500 mb-4">
                        Kéo thả file hoặc lựa chọn phương thức
                      </span>
                      <div className="flex gap-3">
                        <label className="h-10 px-5 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-zinc-200">
                          <Upload className="w-4 h-4" /> Chọn file từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "front")}
                          />
                        </label>
                        <Button
                          onClick={() => startCamera("front")}
                          className="h-10 px-5 rounded-xl bg-white border border-zinc-200 text-zinc-800 hover:text-zinc-950 font-semibold text-[14px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                          <Camera className="w-4 h-4" /> Mở camera chụp
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-8 border-t border-zinc-100">
            <Button
              onClick={handleStep2Submit}
              disabled={!frontImage || uploadingImage}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              Tiếp tục: Mặt sau CCCD
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Back of CCCD */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">
              Bước 2: Tải lên hoặc chụp ảnh mặt sau CCCD
            </h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Hình ảnh cần rõ nét, đủ ánh sáng, không bị mất góc hoặc bị lóa
              thông tin.
            </p>
          </div>

          {isCameraOpen && activeCameraFor === "back" ? (
            <div className="max-w-xl mx-auto flex flex-col items-center gap-6 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
              <div className="relative aspect-[1.6/1] w-full rounded-2xl border border-zinc-200/80 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-4 border-2 border-dashed border-red-600/20 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] text-zinc-700 bg-white/95 border border-zinc-200/80 px-3 py-1.5 rounded-full tracking-wider font-semibold shadow-sm">
                    Đặt mặt sau CCCD vào khung này
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95"
                >
                  Chụp ảnh
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="h-10 px-5 rounded-xl border border-zinc-200 text-zinc-700 bg-white font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95"
                >
                  Đóng camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              {backImage ? (
                <div className="relative aspect-[1.6/1] w-full rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center p-4">
                  <Image
                    src={getImageUrl(backImage)}
                    alt="back cccd"
                    width={1200}
                    height={750}
                    unoptimized
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setBackImage(null);
                      setOcrPreview(null);
                    }}
                    className="absolute top-3 right-3 bg-zinc-900/80 text-white rounded-lg px-2.5 py-1 text-[11px] font-semibold hover:bg-red-600 transition-colors shadow"
                  >
                    Thay đổi
                  </button>
                </div>
              ) : (
                <div className="aspect-[1.6/1] w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 bg-zinc-50/30 hover:bg-zinc-50/60 transition-all duration-300 flex flex-col items-center justify-center p-6">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <span className="text-xs font-semibold text-zinc-400">
                        Đang xử lý ảnh...
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-zinc-300 mb-4" />
                      <span className="text-xs font-semibold text-zinc-500 mb-4">
                        Kéo thả file hoặc lựa chọn phương thức
                      </span>
                      <div className="flex gap-3">
                        <label className="h-10 px-5 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-zinc-200">
                          <Upload className="w-4 h-4" /> Chọn file từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "back")}
                          />
                        </label>
                        <Button
                          onClick={() => startCamera("back")}
                          className="h-10 px-5 rounded-xl bg-white border border-zinc-200 text-zinc-800 hover:text-zinc-950 font-semibold text-[14px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                          <Camera className="w-4 h-4" /> Mở camera chụp
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {ocrPreview && renderOcrPreviewPanel()}

          <div className="flex justify-between pt-8 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="h-10 px-5 rounded-xl border border-zinc-100 bg-white text-zinc-500 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
            >
              Quay lại bước 1
            </Button>
            <Button
              onClick={handleStep3Submit}
              disabled={!backImage || uploadingImage || previewingOcr}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {previewingOcr ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang trích
                  xuất OCR...
                </>
              ) : (
                "Trích xuất thông tin & tiếp tục"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Capture Selfie (ONLY Live Camera allowed) */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">
              Bước 3: Chụp ảnh chân dung selfie
            </h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Ảnh chân dung của bạn bắt buộc phải chụp trực tiếp từ camera. Đảm
              bảo nhìn thẳng, không đội mũ, đeo kính mát hoặc khẩu trang.
            </p>
          </div>

          {isCameraOpen && activeCameraFor === "selfie" ? (
            <div className="max-w-md mx-auto flex flex-col items-center gap-6 bg-zinc-50/50 p-6 rounded-xl border border-zinc-200/60 shadow-sm">
              <div className="relative aspect-square w-full rounded-xl border border-zinc-200/80 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-8 border-4 border-dashed border-red-600/10 rounded-full pointer-events-none flex items-center justify-center">
                  <span className="text-xs text-zinc-700 bg-white/70 border border-zinc-200/50 px-5 py-2 rounded-full font-semibold whitespace-nowrap">
                    Đặt khuôn mặt vào vòng tròn
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95"
                >
                  Chụp ngay
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="h-10 px-5 rounded-xl border border-zinc-200 text-zinc-700 bg-white font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95"
                >
                  Đóng camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {selfieImage ? (
                <div className="relative aspect-square w-full rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                  <Image
                    src={getImageUrl(selfieImage)}
                    alt="selfie selfie"
                    width={800}
                    height={800}
                    unoptimized
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setSelfieImage(null)}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/80 text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-red-600 transition-colors shadow-md"
                  >
                    Chụp lại ảnh khác
                  </button>
                </div>
              ) : (
                <div className="aspect-square w-full rounded-xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 bg-zinc-50/30 hover:bg-zinc-50/60 transition-all duration-300 flex flex-col items-center justify-center p-10 text-center">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <span className="text-xs font-semibold text-zinc-400">
                        Đang lưu ảnh chụp...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-14 h-14 text-zinc-300 mb-6" />
                      <span className="text-xs font-semibold text-zinc-500 mb-6 max-w-xs leading-relaxed">
                        Để đảm bảo tính xác thực, hệ thống chỉ chấp nhận hình
                        ảnh chụp trực tiếp từ camera thiết bị của bạn.
                      </span>
                      <Button
                        onClick={() => startCamera("selfie")}
                        className="h-10 px-5 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4" /> Mở camera chụp
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="h-10 px-5 rounded-xl border border-zinc-100 bg-white text-zinc-500 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
            >
              Quay lại bước 2
            </Button>
            <Button
              onClick={handleStep4Submit}
              disabled={!selfieImage || uploadingImage}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              Tiếp tục: Video khuôn mặt
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Liveness Video */}
      {step === 4 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">
              Bước 4: Quay video xác thực khuôn mặt
            </h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Làm theo từng hướng dẫn để video có đủ góc mặt. Giữ ánh sáng tốt,
              không đeo kính râm hoặc khẩu trang.
            </p>
          </div>

          {isCameraOpen && activeCameraFor === "liveness" ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="flex flex-col items-center gap-5 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
                <div className="relative aspect-square w-full max-w-md rounded-2xl border border-zinc-200/80 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-8 border-4 border-dashed border-red-600/20 rounded-full pointer-events-none flex items-center justify-center">
                    <span className="text-xs text-zinc-700 bg-white/90 border border-zinc-200/70 px-4 py-2 rounded-full font-semibold whitespace-nowrap shadow-sm">
                      Giữ khuôn mặt trong vòng tròn
                    </span>
                  </div>
                  {recordingLiveness && (
                    <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
                      Đang ghi
                    </div>
                  )}
                </div>

                <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
                  {(() => {
                    const currentPrompt = LIVENESS_PROMPTS[livenessStepIndex];
                    const CurrentIcon = currentPrompt.icon;
                    const progress = Math.min(
                      100,
                      Math.round(
                        (livenessElapsedMs / MIN_LIVENESS_STEP_MS) * 100,
                      ),
                    );
                    return (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <CurrentIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-950">
                              {currentPrompt.title}
                            </p>
                            <p className="text-xs font-medium text-zinc-500 leading-relaxed mt-1">
                              {currentPrompt.helper}
                            </p>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-600 transition-all duration-150"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-zinc-400">
                          Bước {livenessStepIndex + 1}/{LIVENESS_PROMPTS.length}{" "}
                          - Giữ tư thế đến khi thanh tiến trình đầy.
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {recordingLiveness ? (
                    <Button
                      onClick={validateCurrentLivenessStep}
                      className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Xác nhận góc này
                    </Button>
                  ) : (
                    <Button
                      onClick={startLivenessRecording}
                      className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95"
                    >
                      <Video className="w-4 h-4 mr-2" /> Bắt đầu ghi
                    </Button>
                  )}
                  <Button
                    onClick={cancelLivenessRecording}
                    variant="outline"
                    className="h-10 px-5 rounded-xl border border-zinc-200 text-zinc-700 bg-white font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95"
                  >
                    Hủy quay
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm h-fit space-y-3">
                <p className="text-xs font-semibold tracking-wider text-zinc-400">
                  Các góc cần hoàn tất
                </p>
                {LIVENESS_PROMPTS.map((prompt, index) => {
                  const PromptIcon = prompt.icon;
                  const isDone = completedLivenessSteps[index];
                  const isCurrent =
                    index === livenessStepIndex && recordingLiveness;
                  return (
                    <div
                      key={prompt.title}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                        isDone
                          ? "border-emerald-100 bg-emerald-50"
                          : isCurrent
                            ? "border-red-100 bg-red-50"
                            : "border-zinc-100 bg-zinc-50/60",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                          isDone
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                              ? "bg-red-600 text-white"
                              : "bg-white text-zinc-400",
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCurrent ? (
                          <PromptIcon className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {prompt.title}
                        </p>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">
                          {isDone
                            ? "Đã xác nhận"
                            : isCurrent
                              ? "Đang thực hiện"
                              : "Chưa thực hiện"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {livenessVideo ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 space-y-4 text-center">
                  <Video className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Video xác thực đã sẵn sàng
                    </p>
                    <p className="text-xs font-medium text-zinc-500 mt-1">
                      Video này sẽ được kiểm tra khi gửi hồ sơ.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLivenessVideo(null);
                      setLivenessStepIndex(0);
                      setCompletedLivenessSteps(
                        LIVENESS_PROMPTS.map(() => false),
                      );
                      startCamera("liveness");
                    }}
                    className="h-10 px-5 rounded-xl border border-zinc-200 text-zinc-700 bg-white font-semibold text-[14px]"
                  >
                    Quay lại
                  </Button>
                </div>
              ) : (
                <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 bg-zinc-50/30 hover:bg-zinc-50/60 transition-all duration-300 flex flex-col items-center justify-center p-10 text-center">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <span className="text-xs font-semibold text-zinc-400">
                        Đang tải video xác thực...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Video className="w-14 h-14 text-zinc-300 mb-6" />
                      <span className="text-xs font-semibold text-zinc-500 mb-6 max-w-xs leading-relaxed">
                        Mở camera và quay đủ 4 góc mặt theo hướng dẫn để tăng
                        chất lượng kiểm tra chống giả mạo.
                      </span>
                      <Button
                        onClick={() => startCamera("liveness")}
                        className="h-10 px-5 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 transition-all active:scale-95"
                      >
                        <Video className="w-4 h-4" /> Mở camera
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setStep(4)}
              className="h-10 px-5 rounded-xl border border-zinc-100 bg-white text-zinc-500 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
            >
              Quay lại selfie
            </Button>
            <Button
              onClick={handleStep5Submit}
              disabled={!livenessVideo || uploadingImage || recordingLiveness}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              Tiếp tục: Kiểm tra & Gửi
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Final Submit */}
      {step === 5 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">
              Bước 5: Kiểm tra và gửi hồ sơ xác thực
            </h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Kiểm tra kỹ hình ảnh trước khi gửi. Hệ thống sẽ trích xuất thông
              tin CCCD và chuyển hồ sơ sang hàng chờ duyệt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-zinc-400">
                Trích xuất tự động
              </h4>
              {ocrPreview && renderOcrPreviewPanel()}
              {!ocrPreview && (
                <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Không cần nhập thông tin cá nhân
                    </p>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">
                      Sau khi gửi, backend sẽ gọi OCR để đọc số CCCD, họ tên,
                      ngày sinh, địa chỉ và ngày hiệu lực từ ảnh. Admin sẽ kiểm
                      tra dữ liệu trích xuất trước khi duyệt.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-zinc-400">
                Hình ảnh tài liệu
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-400 block text-center">
                    Mặt trước CCCD
                  </span>
                  <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50/50 flex items-center justify-center shadow-sm p-1">
                    {frontImage && (
                      <Image
                        src={getImageUrl(frontImage)}
                        alt="front preview"
                        width={1200}
                        height={750}
                        unoptimized
                        className="w-full h-full object-contain rounded-xl"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-400 block text-center">
                    Mặt sau CCCD
                  </span>
                  <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50/50 flex items-center justify-center shadow-sm p-1">
                    {backImage && (
                      <Image
                        src={getImageUrl(backImage)}
                        alt="back preview"
                        width={1200}
                        height={750}
                        unoptimized
                        className="w-full h-full object-contain rounded-xl"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2 col-span-2 flex flex-col items-center">
                  <span className="text-[10px] font-semibold text-zinc-400 block mb-1">
                    Ảnh chụp selfie
                  </span>
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-zinc-100 bg-zinc-50/50 flex items-center justify-center shadow-sm">
                    {selfieImage && (
                      <Image
                        src={getImageUrl(selfieImage)}
                        alt="selfie preview"
                        width={400}
                        height={400}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Video className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-700 truncate">
                        Video xác thực khuôn mặt
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold rounded-lg px-2 py-1 border",
                        livenessVideo
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-red-50 text-red-700 border-red-100",
                      )}
                    >
                      {livenessVideo ? "Đã có" : "Thiếu"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-8 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setStep(4)}
              className="h-10 px-5 rounded-xl border border-zinc-100 bg-white text-zinc-500 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
            >
              Quay lại bước 3
            </Button>
            <Button
              onClick={handleSubmitAll}
              disabled={submitting}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang chạy
                  chấm điểm AI...
                </>
              ) : (
                "Xác thực và gửi hồ sơ"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function getImageUrl(url: string | null | undefined) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  const baseUrl = apiBaseUrl.replace(/\/api$/, "");
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
}
