"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { identityService, KycSessionResponse } from "@/services/identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Camera,
  UploadCloud,
  AlertCircle,
  RefreshCw,
  Fingerprint,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMyProfile } from "@/services/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

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

export default function EkycPage() {
  const { refetch: refetchProfile } = useMyProfile();

  const [kycSession, setKycSession] = useState<KycSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Front CCCD, 3: Back CCCD, 4: Selfie, 5: Review & Submit

  // Camera settings
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeCameraFor, setActiveCameraFor] = useState<"front" | "back" | "selfie" | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Upload image URLs
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  // Form Fields CCCD
  const [formData, setFormData] = useState({
    identityNumber: "",
    fullName: "",
    dateOfBirth: "",
    gender: "MALE",
    nationality: "Việt Nam",
    placeOfOrigin: "",
    placeOfResidence: "",
    issuedDate: "",
    expiryDate: "",
  });

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

  const startCamera = async (target: "front" | "back" | "selfie") => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === "selfie" ? "user" : "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
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
      toast.error("Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera của trình duyệt.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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
      } else if (target === "back") {
        uploadedUrl = await identityService.uploadBack(file);
        setBackImage(uploadedUrl);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      let uploadedUrl = "";
      if (target === "front") {
        uploadedUrl = await identityService.uploadFront(file);
        setFrontImage(uploadedUrl);
      } else {
        uploadedUrl = await identityService.uploadBack(file);
        setBackImage(uploadedUrl);
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
    } catch {
      toast.error("Không thể khởi tạo phiên xác thực");
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identityNumber || !formData.fullName || !formData.dateOfBirth || !formData.placeOfOrigin || !formData.placeOfResidence || !formData.issuedDate || !formData.expiryDate) {
      toast.error("Vui lòng điền đầy đủ thông tin cá nhân CCCD");
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (!frontImage) {
      toast.error("Vui lòng tải lên hoặc chụp ảnh mặt trước CCCD");
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = () => {
    if (!backImage) {
      toast.error("Vui lòng tải lên hoặc chụp ảnh mặt sau CCCD");
      return;
    }
    setStep(4);
  };

  const handleStep4Submit = () => {
    if (!selfieImage) {
      toast.error("Vui lòng chụp ảnh chân dung selfie");
      return;
    }
    setStep(5);
  };

  const handleSubmitAll = async () => {
    try {
      setSubmitting(true);
      const data = await identityService.submitKyc({
        identityNumber: formData.identityNumber,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        placeOfOrigin: formData.placeOfOrigin,
        placeOfResidence: formData.placeOfResidence,
        issuedDate: formData.issuedDate,
        expiryDate: formData.expiryDate,
        frontImageUrl: frontImage || "",
        backImageUrl: backImage || "",
        selfieImageUrl: selfieImage || "",
      });

      if (data.status === "REJECTED") {
        toast.error("AI từ chối định danh của bạn! Hãy nhấn thử lại và kiểm tra hình ảnh rõ nét hơn.");
      } else {
        toast.success("Hồ sơ đã được gửi thành công và đang chờ duyệt thủ công!");
      }
      await refetchProfile();
      await fetchKycStatus();
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: unknown } } }).response?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Gửi thông tin xác thực thất bại";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-sm flex items-center justify-center min-h-[400px] animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-xs font-semibold text-zinc-400">Đang kiểm tra hồ sơ định danh của bạn...</p>
        </div>
      </div>
    );
  }

  // State 1: Verification Approved
  if (kycSession?.status === "APPROVED") {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-sm animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 pb-8 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[28px] font-semibold text-zinc-950 tracking-tight leading-tight">
                Định danh đã xác thực
              </h1>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-wider animate-pulse">
                Đủ điều kiện thuê
              </span>
            </div>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Hồ sơ định danh của bạn đã được hệ thống phê duyệt.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-12">
          {/* Form grid matching info page styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Số thẻ CCCD</label>
              <Input
                disabled
                value={kycSession.identityNumber}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Họ và Tên</label>
              <Input
                disabled
                value={kycSession.fullName}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Ngày sinh</label>
              <Input
                disabled
                value={kycSession.dateOfBirth ? String(kycSession.dateOfBirth) : ""}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Giới tính</label>
              <Input
                disabled
                value={kycSession.gender === "MALE" ? "Nam" : kycSession.gender === "FEMALE" ? "Nữ" : "Khác"}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Quốc tịch</label>
              <Input
                disabled
                value={kycSession.nationality}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Nơi thường trú</label>
              <Input
                disabled
                value={kycSession.placeOfResidence}
                className="h-10 bg-zinc-50 border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-dash-card outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* AI Metrics block */}
          <div className="bg-zinc-50/50 p-8 rounded-2xl border border-zinc-100 space-y-6">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Kết quả xác thực hệ thống</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500">Độ tin cậy khớp mặt (Face ID)</span>
                  <span className="font-bold text-emerald-600">{(kycSession.faceMatchScore ? kycSession.faceMatchScore * 100 : 95).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full animate-all duration-500" style={{ width: `${(kycSession.faceMatchScore ? kycSession.faceMatchScore * 100 : 95)}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500">Độ chính xác OCR</span>
                  <span className="font-bold text-emerald-600">{(kycSession.ocrConfidence ? kycSession.ocrConfidence * 100 : 96).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full animate-all duration-500" style={{ width: `${(kycSession.ocrConfidence ? kycSession.ocrConfidence * 100 : 96)}%` }} />
                </div>
              </div>
            </div>

            {kycSession.completedAt && (
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-semibold">
                <span>Thời gian hoàn thành xác thực</span>
                <span>{new Date(kycSession.completedAt).toLocaleString("vi-VN")}</span>
              </div>
            )}
          </div>

          {/* Verification documents */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Hình ảnh tài liệu lưu trữ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block text-center md:text-left">Mặt trước CCCD</span>
                <div className="aspect-[1.6/1] rounded-2xl overflow-hidden border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-center shadow-sm p-2">
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
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block text-center md:text-left">Mặt sau CCCD</span>
                <div className="aspect-[1.6/1] rounded-2xl overflow-hidden border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-center shadow-sm p-2">
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
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Ảnh chân dung</span>
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
      <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-sm animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 pb-8 border-b border-zinc-100">
          <div>
            <h1 className="text-[28px] font-semibold text-zinc-950 tracking-tight leading-tight">
              Hồ sơ đang chờ phê duyệt
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Đội ngũ quản trị viên đang kiểm tra và đối chiếu hồ sơ của bạn.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm shrink-0">
            <Fingerprint className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-zinc-50/50 p-8 rounded-2xl border border-zinc-100 space-y-8 shadow-sm">
            <div className="flex justify-between items-center text-xs font-semibold pb-4 border-b border-zinc-100">
              <span className="text-zinc-400 uppercase tracking-wider">Trạng thái hồ sơ</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">Chờ phê duyệt thủ công</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500 ml-1">Họ và tên</label>
                <Input disabled value={kycSession.fullName} className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-sm cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500 ml-1">Số CCCD</label>
                <Input disabled value={kycSession.identityNumber} className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-500 shadow-sm cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={fetchKycStatus}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" /> Làm mới trạng thái
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Rejected
  if (kycSession?.status === "REJECTED") {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-sm animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 pb-8 border-b border-zinc-100">
          <div>
            <h1 className="text-[28px] font-semibold text-zinc-950 tracking-tight leading-tight">
              Xác thực bị từ chối
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Thông tin xác minh của bạn không được phê duyệt. Vui lòng kiểm tra lý do và thực hiện lại.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm shrink-0">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        <div className="max-w-xl mx-auto space-y-8">
          {kycSession.failureReason && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-5 rounded-2xl text-sm font-semibold shadow-sm">
              <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-2">Lý do từ chối</p>
              <p className="text-zinc-800 leading-relaxed font-medium">{kycSession.failureReason}</p>
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
    <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-sm animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 pb-8 border-b border-zinc-100">
        <div>
          <h1 className="text-[28px] font-semibold text-zinc-950 tracking-tight leading-tight">
            Xác thực định danh (eKYC)
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Yêu cầu bắt buộc để thuê thiết bị máy ảnh. Hoàn thành 5 bước nhanh chóng.
          </p>
        </div>

        {/* Steps Indicators */}
        <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-xl border border-black/5 shrink-0 self-start md:self-auto shadow-sm">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all",
                step === num
                  ? "bg-red-600 text-white shadow-sm"
                  : step > num
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-white text-zinc-400 border border-black/5"
              )}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Input CCCD Details */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Bước 1: Nhập thông tin cá nhân trên CCCD</h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Nhập chính xác các thông tin ghi trên thẻ Căn cước công dân của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Số thẻ CCCD *</label>
              <Input
                required
                value={formData.identityNumber}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                placeholder="Ví dụ: 079098123456"
                className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Họ và Tên *</label>
              <Input
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ví dụ: NGUYỄN VĂN A"
                className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Ngày sinh *</label>
              <DateInput
                required
                value={formData.dateOfBirth}
                onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                className="h-10 text-[14px] px-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Giới tính *</label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData({ ...formData, gender: v || "MALE" })}
              >
                <SelectTrigger className="w-full h-10! bg-white! border-black/5! rounded-xl px-4 font-semibold text-[14px] focus:border-red-600/30! transition-all duration-200 text-left shadow-dash-card outline-none">
                  <span className={cn(formData.gender ? "text-zinc-900" : "text-zinc-400")}>
                    {formData.gender === "MALE" ? "Nam" : formData.gender === "FEMALE" ? "Nữ" : "Khác"}
                  </span>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-dash-overlay border-black/5 p-1 bg-white z-100">
                  <SelectItem
                    value="MALE"
                    className="font-semibold py-3 text-zinc-950 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-highlighted:bg-red-600 data-highlighted:text-white data-[state=checked]:bg-red-50 data-[state=checked]:text-red-600 cursor-pointer transition-all outline-none"
                  >
                    Nam
                  </SelectItem>
                  <SelectItem
                    value="FEMALE"
                    className="font-semibold py-3 text-zinc-950 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-highlighted:bg-red-600 data-highlighted:text-white data-[state=checked]:bg-red-50 data-[state=checked]:text-red-600 cursor-pointer transition-all outline-none"
                  >
                    Nữ
                  </SelectItem>
                  <SelectItem
                    value="OTHER"
                    className="font-semibold py-3 text-zinc-950 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-highlighted:bg-red-600 data-highlighted:text-white data-[state=checked]:bg-red-50 data-[state=checked]:text-red-600 cursor-pointer transition-all outline-none"
                  >
                    Khác
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Quốc tịch *</label>
              <Input
                required
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="Việt Nam"
                className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Quê quán (Nơi ĐK khai sinh) *</label>
              <Input
                required
                value={formData.placeOfOrigin}
                onChange={(e) => setFormData({ ...formData, placeOfOrigin: e.target.value })}
                placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Nơi thường trú *</label>
              <Input
                required
                value={formData.placeOfResidence}
                onChange={(e) => setFormData({ ...formData, placeOfResidence: e.target.value })}
                placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Ngày cấp *</label>
              <DateInput
                required
                value={formData.issuedDate}
                onChange={(v) => setFormData({ ...formData, issuedDate: v })}
                className="h-10 text-[14px] px-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 ml-1">Ngày hết hạn *</label>
              <DateInput
                required
                value={formData.expiryDate}
                onChange={(v) => setFormData({ ...formData, expiryDate: v })}
                className="h-10 text-[14px] px-4"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-zinc-100">
            <Button
              type="submit"
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              Tiếp tục: Mặt trước CCCD
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Upload Front of CCCD */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Bước 2: Tải lên hoặc Chụp ảnh mặt trước CCCD</h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Hình ảnh cần rõ nét, đủ ánh sáng, không bị mất góc hoặc bị lóa thông tin.
            </p>
          </div>

          {isCameraOpen && activeCameraFor === "front" ? (
            <div className="max-w-xl mx-auto flex flex-col items-center gap-6 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
              <div className="relative aspect-[1.6/1] w-full rounded-2xl border border-zinc-200/80 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-inner">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-4 border-2 border-dashed border-red-600/20 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] text-zinc-700 bg-white/95 border border-zinc-200/80 px-3 py-1.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                    Đặt mặt trước CCCD vào khung này
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={capturePhoto} className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95">
                  Chụp ảnh
                </Button>
                <Button onClick={stopCamera} variant="outline" className="h-10 px-5 rounded-xl border border-zinc-200 text-zinc-700 bg-white font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95">
                  Đóng Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              {frontImage ? (
                <div className="relative aspect-[1.6/1] w-full rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center p-4">
                  <Image
                    src={getImageUrl(frontImage)}
                    alt="front cccd"
                    width={1200}
                    height={750}
                    unoptimized
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    onClick={() => setFrontImage(null)}
                    className="absolute top-3 right-3 bg-zinc-900/80 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold hover:bg-red-600 transition-colors shadow"
                  >
                    Thay đổi
                  </button>
                </div>
              ) : (
                <div className="aspect-[1.6/1] w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 bg-zinc-50/30 hover:bg-zinc-50/60 transition-all duration-300 flex flex-col items-center justify-center p-6">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <span className="text-xs font-bold text-zinc-400">Đang xử lý ảnh...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-zinc-300 mb-4" />
                      <span className="text-xs font-bold text-zinc-500 mb-4">Kéo thả file hoặc lựa chọn phương thức</span>
                      <div className="flex gap-3">
                        <label className="h-10 px-5 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-zinc-200">
                          <Upload className="w-4 h-4" /> Chọn file từ máy
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "front")} />
                        </label>
                        <Button
                          onClick={() => startCamera("front")}
                          className="h-10 px-5 rounded-xl bg-white border border-zinc-200 text-zinc-800 hover:text-zinc-950 font-semibold text-[14px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                          <Camera className="w-4 h-4" /> Mở Camera chụp
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="h-10 px-5 rounded-xl border border-zinc-100 bg-white text-zinc-500 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
            >
              Quay lại bước 1
            </Button>
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

      {/* Step 3: Upload Back of CCCD */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Bước 3: Tải lên hoặc Chụp ảnh mặt sau CCCD</h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Hình ảnh cần rõ nét, đủ ánh sáng, không bị mất góc hoặc bị lóa thông tin.
            </p>
          </div>

          {isCameraOpen && activeCameraFor === "back" ? (
            <div className="max-w-xl mx-auto flex flex-col items-center gap-6 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
              <div className="relative aspect-[1.6/1] w-full rounded-2xl border border-zinc-200/80 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-inner">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-4 border-2 border-dashed border-red-600/20 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] text-zinc-700 bg-white/95 border border-zinc-200/80 px-3 py-1.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                    Đặt mặt sau CCCD vào khung này
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={capturePhoto} className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95">
                  Chụp ảnh
                </Button>
                <Button onClick={stopCamera} variant="outline" className="h-10 px-5 rounded-xl border border-zinc-200 text-zinc-700 bg-white font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95">
                  Đóng Camera
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
                    onClick={() => setBackImage(null)}
                    className="absolute top-3 right-3 bg-zinc-900/80 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold hover:bg-red-600 transition-colors shadow"
                  >
                    Thay đổi
                  </button>
                </div>
              ) : (
                <div className="aspect-[1.6/1] w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 bg-zinc-50/30 hover:bg-zinc-50/60 transition-all duration-300 flex flex-col items-center justify-center p-6">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <span className="text-xs font-bold text-zinc-400">Đang xử lý ảnh...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-zinc-300 mb-4" />
                      <span className="text-xs font-bold text-zinc-500 mb-4">Kéo thả file hoặc lựa chọn phương thức</span>
                      <div className="flex gap-3">
                        <label className="h-10 px-5 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-zinc-200">
                          <Upload className="w-4 h-4" /> Chọn file từ máy
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "back")} />
                        </label>
                        <Button
                          onClick={() => startCamera("back")}
                          className="h-10 px-5 rounded-xl bg-white border border-zinc-200 text-zinc-800 hover:text-zinc-950 font-semibold text-[14px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                          <Camera className="w-4 h-4" /> Mở Camera chụp
                        </Button>
                      </div>
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
              onClick={handleStep3Submit}
              disabled={!backImage || uploadingImage}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              Tiếp tục: Chụp chân dung Selfie
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Capture Selfie (ONLY Live Camera allowed) */}
      {step === 4 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Bước 4: Chụp chân dung Selfie</h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Ảnh chân dung của bạn bắt buộc phải chụp trực tiếp từ camera. Đảm bảo nhìn thẳng, không đội mũ, đeo kính mát hoặc khẩu trang.
            </p>
          </div>

          {isCameraOpen && activeCameraFor === "selfie" ? (
            <div className="max-w-md mx-auto flex flex-col items-center gap-6 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
              <div className="relative aspect-square w-full rounded-2xl border border-zinc-200/80 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-inner">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-8 border-4 border-dashed border-red-600/10 rounded-full pointer-events-none flex items-center justify-center">
                  <span className="text-xs text-zinc-700 bg-white/70 border border-zinc-200/50 px-5 py-2 rounded-full font-semibold whitespace-nowrap">
                    Đặt khuôn mặt vào vòng tròn
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={capturePhoto} className="h-10 px-5 rounded-xl bg-red-600 text-white font-semibold text-[14px] shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all active:scale-95">
                  Chụp ngay
                </Button>
                <Button onClick={stopCamera} variant="outline" className="h-10 px-5 rounded-xl border border-zinc-200 text-zinc-700 bg-white font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95">
                  Đóng Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {selfieImage ? (
                <div className="relative aspect-square w-full rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
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
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/80 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-red-600 transition-colors shadow-md"
                  >
                    Chụp lại ảnh khác
                  </button>
                </div>
              ) : (
                <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 bg-zinc-50/30 hover:bg-zinc-50/60 transition-all duration-300 flex flex-col items-center justify-center p-10 text-center">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <span className="text-xs font-bold text-zinc-400">Đang lưu ảnh chụp...</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-14 h-14 text-zinc-300 mb-6" />
                      <span className="text-xs font-bold text-zinc-500 mb-6 max-w-xs leading-relaxed">
                        Để đảm bảo tính xác thực, hệ thống chỉ chấp nhận hình ảnh chụp trực tiếp từ camera thiết bị của bạn.
                      </span>
                      <Button
                        onClick={() => startCamera("selfie")}
                        className="h-10 px-5 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4" /> Mở Camera chụp
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
              onClick={() => setStep(3)}
              className="h-10 px-5 rounded-xl border border-zinc-100 bg-white text-zinc-500 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
            >
              Quay lại bước 3
            </Button>
            <Button
              onClick={handleStep4Submit}
              disabled={!selfieImage || uploadingImage}
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
            <h3 className="text-lg font-semibold text-zinc-950">Bước 5: Xem lại hồ sơ & Gửi xác thực</h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Kiểm tra kỹ lưỡng các thông tin bên dưới trước khi gửi. Toàn bộ hình ảnh sẽ được mã hóa và truyền bảo mật lên máy chủ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Thông tin cá nhân</h4>
              <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-sm">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Số CCCD</label>
                  <Input disabled value={formData.identityNumber} className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-xs text-zinc-500 shadow-sm cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Họ và Tên</label>
                  <Input disabled value={formData.fullName} className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-xs text-zinc-500 shadow-sm cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Ngày sinh</label>
                  <Input disabled value={formData.dateOfBirth} className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-xs text-zinc-500 shadow-sm cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Giới tính</label>
                  <Input disabled value={formData.gender === "MALE" ? "Nam" : formData.gender === "FEMALE" ? "Nữ" : "Khác"} className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-xs text-zinc-500 shadow-sm cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Quốc tịch</label>
                  <Input disabled value={formData.nationality} className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-xs text-zinc-500 shadow-sm cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Nơi thường trú</label>
                  <Input disabled value={formData.placeOfResidence} className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-xs text-zinc-500 shadow-sm cursor-not-allowed col-span-1 sm:col-span-2" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Hình ảnh tài liệu</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block text-center">Mặt trước CCCD</span>
                  <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50/50 flex items-center justify-center shadow-sm p-1">
                    {frontImage && (
                      <Image
                        src={getImageUrl(frontImage)}
                        alt="front preview"
                        width={1200}
                        height={750}
                        unoptimized
                        className="w-full h-full object-contain rounded-lg"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block text-center">Mặt sau CCCD</span>
                  <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50/50 flex items-center justify-center shadow-sm p-1">
                    {backImage && (
                      <Image
                        src={getImageUrl(backImage)}
                        alt="back preview"
                        width={1200}
                        height={750}
                        unoptimized
                        className="w-full h-full object-contain rounded-lg"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2 col-span-2 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Ảnh chụp selfie</span>
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
              </div>
            </div>
          </div>

          {formData.identityNumber.startsWith("999") && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Mô phỏng từ chối tự động (Auto-reject)</p>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  Số CCCD bắt đầu bằng &quot;999&quot; sẽ mô phỏng việc AI chấm điểm trùng khớp thấp (dưới 90%), hệ thống sẽ tự động đưa vào trạng thái từ chối (REJECTED) để bạn chụp lại.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setStep(4)}
              className="h-10 px-5 rounded-xl border border-zinc-100 bg-white text-zinc-500 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
            >
              Quay lại bước 4
            </Button>
            <Button
              onClick={handleSubmitAll}
              disabled={submitting}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang chạy chấm điểm AI...
                </>
              ) : (
                "Xác thực và Gửi hồ sơ"
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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  const baseUrl = apiBaseUrl.replace(/\/api$/, "");
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
}
