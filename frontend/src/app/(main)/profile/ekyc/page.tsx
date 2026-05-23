"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { identityService, KycSessionResponse } from "@/services/identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileText,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Award,
  Fingerprint
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMyProfile } from "@/services/profile";

export default function EkycPage() {
  const router = useRouter();
  const { refetch: refetchProfile } = useMyProfile();

  const [kycSession, setKycSession] = useState<KycSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Documents, 2: Selfie, 3: OCR Review & Submit

  // Mock upload images/state
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  // Form Fields extracted by OCR (Mocked or manual)
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
      if (data.status === "APPROVED" || data.status === "REJECTED" || data.status === "SUBMITTED") {
        // Stop wizard, just show status
      }
    } catch (err) {
      console.error("Failed to load KYC status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const handleStartKyc = async () => {
    try {
      setLoading(true);
      const data = await identityService.initiateKyc();
      setKycSession(data);
      setStep(1);
      setFrontImage(null);
      setBackImage(null);
      setSelfieImage(null);
    } catch (err) {
      toast.error("Không thể khởi tạo phiên xác thực");
    } finally {
      setLoading(false);
    }
  };

  // Simulate OCR extraction when uploading documents
  const simulateOcr = (isFailureCase = false) => {
    toast.success("Trích xuất thông tin từ CCCD thành công!");
    if (isFailureCase) {
      setFormData({
        identityNumber: "999123456789",
        fullName: "NGUYỄN VĂN THẤT BẠI",
        dateOfBirth: "1995-10-10",
        gender: "MALE",
        nationality: "Việt Nam",
        placeOfOrigin: "Quận 1, TP. Hồ Chí Minh",
        placeOfResidence: "Quận Bình Thạnh, TP. Hồ Chí Minh",
        issuedDate: "2021-05-05",
        expiryDate: "2035-10-10",
      });
    } else {
      setFormData({
        identityNumber: "079096123456",
        fullName: "NGUYỄN THÀNH ĐẠT",
        dateOfBirth: "1998-08-15",
        gender: "MALE",
        nationality: "Việt Nam",
        placeOfOrigin: "Quận 3, TP. Hồ Chí Minh",
        placeOfResidence: "Quận Phú Nhuận, TP. Hồ Chí Minh",
        issuedDate: "2020-12-12",
        expiryDate: "2038-08-15",
      });
    }
  };

  const handleDocumentSubmit = () => {
    if (!frontImage || !backImage) {
      toast.error("Vui lòng tải lên cả 2 mặt của CCCD");
      return;
    }
    setStep(2);
  };

  const handleSelfieSubmit = () => {
    if (!selfieImage) {
      toast.error("Vui lòng chụp ảnh chân dung");
      return;
    }
    // Automatically trigger mock OCR extraction when stepping into review step
    const isFail = selfieImage.includes("fail") || frontImage?.includes("fail");
    simulateOcr(isFail);
    setStep(3);
  };

  const handleSubmitAll = async () => {
    try {
      setSubmitting(true);
      await identityService.submitKyc({
        identityNumber: formData.identityNumber,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        placeOfOrigin: formData.placeOfOrigin,
        placeOfResidence: formData.placeOfResidence,
        issuedDate: formData.issuedDate,
        expiryDate: formData.expiryDate,
        frontImageUrl: frontImage || "/api/uploads/default-front.jpg",
        backImageUrl: backImage || "/api/uploads/default-back.jpg",
        selfieImageUrl: selfieImage || "/api/uploads/default-selfie.jpg",
      });

      toast.success("Hồ sơ đã được gửi để phân tích");
      await refetchProfile();
      await fetchKycStatus();
    } catch (err) {
      toast.error("Gửi thông tin xác thực thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <p className="text-xs font-bold text-zinc-400">Đang kiểm tra hồ sơ định danh của bạn...</p>
        </div>
      </div>
    );
  }

  // State 1: Verification Approved
  if (kycSession?.status === "APPROVED") {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-card max-w-3xl animate-in fade-in duration-500">
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-zinc-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-950">Định danh đã xác thực</h1>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Đủ điều kiện thuê
              </span>
            </div>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Hồ sơ định danh của bạn đã được kiểm duyệt bởi AI & Nhân viên hệ thống.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Thông tin cá nhân trích xuất</h3>
            <div className="space-y-4">
              <InfoRow label="Số CCCD" value={kycSession.identityNumber} />
              <InfoRow label="Họ và tên" value={kycSession.fullName} />
              <InfoRow label="Ngày sinh" value={kycSession.dateOfBirth} />
              <InfoRow label="Giới tính" value={kycSession.gender === "MALE" ? "Nam" : kycSession.gender === "FEMALE" ? "Nữ" : "Khác"} />
              <InfoRow label="Quốc tịch" value={kycSession.nationality} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Chi tiết chấm điểm AI</h3>
            <div className="space-y-4 bg-zinc-50 p-6 rounded-2xl border border-black/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">Độ tin cậy khớp mặt (Face ID)</span>
                <span className="text-xs font-bold text-emerald-600">{(kycSession.faceMatchScore ? kycSession.faceMatchScore * 100 : 95).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(kycSession.faceMatchScore ? kycSession.faceMatchScore * 100 : 95)}%` }} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-zinc-500">Độ chính xác OCR</span>
                <span className="text-xs font-bold text-emerald-600">{(kycSession.ocrConfidence ? kycSession.ocrConfidence * 100 : 96).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(kycSession.ocrConfidence ? kycSession.ocrConfidence * 100 : 96)}%` }} />
              </div>

              {kycSession.completedAt && (
                <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-[11px] font-bold text-zinc-400">
                  <span>Ngày hoàn thành</span>
                  <span>{new Date(kycSession.completedAt).toLocaleString("vi-VN")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Under Review / Pending Review
  if (kycSession?.status === "SUBMITTED") {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-card max-w-2xl text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Fingerprint className="w-10 h-10 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-950 tracking-tight mb-3">Hồ sơ đang chờ phê duyệt</h1>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-md mx-auto mb-8">
          Điểm đối khớp AI nằm dưới ngưỡng tự động (cần xem xét thêm). Đội ngũ Staff đang kiểm tra thủ công hồ sơ của bạn. Quá trình này thường mất 5 - 15 phút.
        </p>

        <div className="bg-zinc-50 p-6 rounded-2xl border border-black/5 text-left max-w-md mx-auto mb-8 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-500">Trạng thái hồ sơ:</span>
            <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">Chờ phê duyệt thủ công</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-500">Tỷ lệ trùng khớp khuôn mặt:</span>
            <span className="font-bold text-zinc-900">{kycSession.faceMatchScore ? (kycSession.faceMatchScore * 100).toFixed(1) : "65.0"}%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-500">Độ tin cậy OCR:</span>
            <span className="font-bold text-zinc-900">{kycSession.ocrConfidence ? (kycSession.ocrConfidence * 100).toFixed(1) : "60.0"}%</span>
          </div>
        </div>

        <Button
          onClick={fetchKycStatus}
          className="h-12 px-8 rounded-xl bg-zinc-950 text-white font-bold text-sm shadow-md hover:bg-red-600 transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Làm mới trạng thái
        </Button>
      </div>
    );
  }

  // State 3: Rejected
  if (kycSession?.status === "REJECTED") {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-card max-w-2xl text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-8 shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-950 tracking-tight mb-3">Xác thực bị từ chối</h1>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-md mx-auto mb-6">
          Rất tiếc, thông tin xác minh của bạn không được phê duyệt.
        </p>

        {kycSession.failureReason && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-5 rounded-2xl text-sm font-semibold max-w-md mx-auto mb-8 text-left">
            <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-2">Lý do từ chối:</p>
            {kycSession.failureReason}
          </div>
        )}

        <Button
          onClick={handleStartKyc}
          className="h-12 px-8 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-zinc-950 transition-all"
        >
          Thử xác thực lại
        </Button>
      </div>
    );
  }

  // Wizard Flow (NOT_STARTED or STARTED)
  return (
    <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-dash-card max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Quy trình xác thực định danh (eKYC)</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Yêu cầu bắt buộc để thuê thiết bị máy ảnh cao cấp. Hoàn thành trong 3 bước nhanh chóng.
          </p>
        </div>

        {/* Steps Indicators */}
        <div className="flex items-center gap-3 bg-zinc-50 p-1.5 rounded-xl border border-black/5 shrink-0 self-start md:self-auto">
          {[1, 2, 3].map((num) => (
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

      {/* Step 1: Upload CCCD Documents */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-bold text-zinc-950">Bước 1: Tải ảnh Thẻ Căn cước công dân (CCCD)</h3>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Đảm bảo ảnh rõ nét, không bị lóa sáng, không mất góc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Front Card */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-700">Mặt trước CCCD</label>
              {frontImage ? (
                <div className="relative aspect-[1.6/1] w-full rounded-2xl border border-black/5 overflow-hidden bg-zinc-50 flex items-center justify-center p-4">
                  <img src={frontImage} className="w-full h-full object-contain rounded-lg" alt="front" />
                  <button
                    onClick={() => setFrontImage(null)}
                    className="absolute top-3 right-3 bg-zinc-900/80 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold hover:bg-red-600 transition-colors"
                  >
                    Thay đổi
                  </button>
                </div>
              ) : (
                <div className="aspect-[1.6/1] w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 transition-all flex flex-col items-center justify-center bg-zinc-50/50 p-6">
                  <UploadCloud className="w-10 h-10 text-zinc-300 mb-4" />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setFrontImage("/api/uploads/f061177b-0ca5-48cd-ab4c-3576d7197c14_Canon_EOS_R6_Mark_II.avif")} // mock success CCCD
                      className="h-9 px-3 rounded-lg bg-zinc-950 hover:bg-red-600 text-white font-bold text-[11px]"
                    >
                      Dán mẫu Thành Công
                    </Button>
                    <Button
                      onClick={() => setFrontImage("fail_image_url")} // mock fail CCCD
                      className="h-9 px-3 rounded-lg bg-white border border-black/5 text-zinc-950 font-bold text-[11px]"
                    >
                      Dán mẫu Thất Bại
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Back Card */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-700">Mặt sau CCCD</label>
              {backImage ? (
                <div className="relative aspect-[1.6/1] w-full rounded-2xl border border-black/5 overflow-hidden bg-zinc-50 flex items-center justify-center p-4">
                  <img src={backImage} className="w-full h-full object-contain rounded-lg" alt="back" />
                  <button
                    onClick={() => setBackImage(null)}
                    className="absolute top-3 right-3 bg-zinc-900/80 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold hover:bg-red-600 transition-colors"
                  >
                    Thay đổi
                  </button>
                </div>
              ) : (
                <div className="aspect-[1.6/1] w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 transition-all flex flex-col items-center justify-center bg-zinc-50/50 p-6">
                  <UploadCloud className="w-10 h-10 text-zinc-300 mb-4" />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setBackImage("/api/uploads/f061177b-0ca5-48cd-ab4c-3576d7197c14_Canon_EOS_R6_Mark_II.avif")}
                      className="h-9 px-3 rounded-lg bg-zinc-950 hover:bg-red-600 text-white font-bold text-[11px]"
                    >
                      Dán mẫu Thành Công
                    </Button>
                    <Button
                      onClick={() => setBackImage("fail_image_url")}
                      className="h-9 px-3 rounded-lg bg-white border border-black/5 text-zinc-950 font-bold text-[11px]"
                    >
                      Dán mẫu Thất Bại
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-8 border-t border-zinc-100">
            <Button
              onClick={handleDocumentSubmit}
              disabled={!frontImage || !backImage}
              className="h-12 px-8 rounded-xl bg-zinc-950 text-white font-bold text-sm shadow-md hover:bg-red-600 transition-all"
            >
              Tiếp tục: Chụp Selfie
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Selfie Photo */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-bold text-zinc-950">Bước 2: Xác thực khuôn mặt (Liveness Detection)</h3>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Nhìn thẳng vào camera, đảm bảo ánh sáng tốt và không đeo kính mát / khẩu trang.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {selfieImage ? (
              <div className="relative aspect-square w-full rounded-2xl border border-black/5 overflow-hidden bg-zinc-50 flex items-center justify-center p-4">
                <img src={selfieImage} className="w-full h-full object-cover rounded-2xl" alt="selfie" />
                <button
                  onClick={() => setSelfieImage(null)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/80 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-red-600 transition-colors shadow-md"
                >
                  Chụp lại ảnh khác
                </button>
              </div>
            ) : (
              <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-600/30 transition-all flex flex-col items-center justify-center bg-zinc-50/50 p-10">
                <Camera className="w-12 h-12 text-zinc-300 mb-6" />
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    onClick={() => setSelfieImage("/api/uploads/f061177b-0ca5-48cd-ab4c-3576d7197c14_Canon_EOS_R6_Mark_II.avif")} // simulated camera
                    className="h-11 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-bold text-xs"
                  >
                    Simulate Camera (Xác thực khớp)
                  </Button>
                  <Button
                    onClick={() => setSelfieImage("fail_selfie")} // simulated failure camera
                    className="h-11 rounded-xl bg-white border border-black/5 text-zinc-950 font-bold text-xs"
                  >
                    Simulate Camera (Xác thực không khớp)
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-8 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="h-12 px-6 rounded-xl border-black/5 text-zinc-700 font-bold text-sm bg-white"
            >
              Quay lại bước 1
            </Button>
            <Button
              onClick={handleSelfieSubmit}
              disabled={!selfieImage}
              className="h-12 px-8 rounded-xl bg-zinc-950 text-white font-bold text-sm shadow-md hover:bg-red-600 transition-all"
            >
              Tiếp tục: Kiểm tra OCR & Gửi hồ sơ
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: OCR Review & Final Submit */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-lg font-bold text-zinc-950">Bước 3: Kiểm tra thông tin & Hoàn tất</h3>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Hệ thống AI đã trích xuất dữ liệu từ CCCD của bạn. Hãy chỉnh sửa nếu phát hiện sai sót.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-2xl border border-black/5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Số thẻ CCCD</label>
              <Input
                value={formData.identityNumber}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                className="h-11 bg-white border border-black/5 rounded-xl px-4 font-semibold text-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Họ và Tên</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="h-11 bg-white border border-black/5 rounded-xl px-4 font-semibold text-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Ngày sinh (YYYY-MM-DD)</label>
              <Input
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="h-11 bg-white border border-black/5 rounded-xl px-4 font-semibold text-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Giới tính</label>
              <Input
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="h-11 bg-white border border-black/5 rounded-xl px-4 font-semibold text-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Quốc tịch</label>
              <Input
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="h-11 bg-white border border-black/5 rounded-xl px-4 font-semibold text-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Quê quán</label>
              <Input
                value={formData.placeOfOrigin}
                onChange={(e) => setFormData({ ...formData, placeOfOrigin: e.target.value })}
                className="h-11 bg-white border border-black/5 rounded-xl px-4 font-semibold text-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Nơi thường trú</label>
              <Input
                value={formData.placeOfResidence}
                onChange={(e) => setFormData({ ...formData, placeOfResidence: e.target.value })}
                className="h-11 bg-white border border-black/5 rounded-xl px-4 font-semibold text-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Ngày cấp (YYYY-MM-DD)</label>
              <Input
                value={formData.issuedDate}
                onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                className="h-11 bg-white border border-black/5 rounded-xl px-4 font-semibold text-zinc-800"
              />
            </div>
          </div>

          {formData.identityNumber.startsWith("999") && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Mô phỏng trường hợp Review thủ công</p>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  Số CCCD bắt đầu bằng &quot;999&quot; sẽ được AI hạ điểm trùng khớp khuôn mặt xuống còn 65%. Hồ sơ sẽ chuyển sang trạng thái chờ Staff duyệt thủ công.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-zinc-100">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="h-12 px-6 rounded-xl border-black/5 text-zinc-700 font-bold text-sm bg-white"
            >
              Quay lại bước 2
            </Button>
            <Button
              onClick={handleSubmitAll}
              disabled={submitting}
              className="h-12 px-8 rounded-xl bg-zinc-950 text-white font-bold text-sm shadow-md hover:bg-red-600 transition-all"
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

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-50">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <span className="text-xs font-bold text-zinc-950">{value || "---"}</span>
    </div>
  );
}
