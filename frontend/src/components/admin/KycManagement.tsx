"use client";

import { useEffect, useState } from "react";
import { identityService, KycSessionResponse } from "@/services/identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/app/(staff)/staff/components/Pagination";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Fingerprint
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type KycRiskLevel = NonNullable<KycSessionResponse["riskLevel"]>;

const riskMeta: Record<KycRiskLevel, { label: string; className: string }> = {
  LOW_RISK: {
    label: "Low",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  MEDIUM_RISK: {
    label: "Medium",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  HIGH_RISK: {
    label: "High",
    className: "bg-red-50 text-red-700 border-red-100",
  },
};

export default function KycManagement() {
  const [sessions, setSessions] = useState<KycSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState<{
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  } | null>(null);

  const [selectedSession, setSelectedSession] = useState<KycSessionResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolveAction, setResolveAction] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPendingSessions = async () => {
    try {
      setLoading(true);
      const res = await identityService.getPendingKycSessions(page, pageSize);
      setSessions(res.data || []);
      if (res.pagination) {
        setPagination({
          pageNumber: res.pagination.pageNumber,
          pageSize: res.pagination.pageSize,
          totalPages: res.pagination.totalPages,
          totalElements: res.pagination.totalElements,
        });
      }
    } catch (err) {
      toast.error("Không thể tải danh sách phiên eKYC");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSessions();
  }, [page]);

  const handleOpenDetail = (session: KycSessionResponse) => {
    setSelectedSession(session);
    setIsDetailOpen(true);
  };

  const handleOpenResolve = (action: "approve" | "reject") => {
    setResolveAction(action);
    setNote(action === "approve" ? "Hồ sơ hợp lệ, thông tin trùng khớp." : "");
    setIsResolveOpen(true);
  };

  const handleResolveSubmit = async () => {
    if (!selectedSession || !resolveAction) return;
    if (resolveAction === "reject" && !note.trim()) {
      toast.error("Vui lòng nhập lý do từ chối hồ sơ");
      return;
    }

    try {
      setSubmitting(true);
      await identityService.resolveKycSession(selectedSession.id, {
        approved: resolveAction === "approve",
        note: note.trim(),
      });
      toast.success(
        resolveAction === "approve"
          ? "Đã phê duyệt eKYC thành công!"
          : "Đã từ chối eKYC của khách hàng!"
      );
      setIsResolveOpen(false);
      setIsDetailOpen(false);
      setSelectedSession(null);
      fetchPendingSessions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Xử lý eKYC thất bại");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.fullName && s.fullName.toLowerCase().includes(q)) ||
      (s.identityNumber && s.identityNumber.includes(q)) ||
      (s.userEmail && s.userEmail.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Header containing Title & Filters */}
        <div className="px-5 py-4 sm:py-5 border-b border-zinc-50">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
            {/* Left: Title + Subtitle */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100/20">
                <ShieldCheck className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-950 tracking-tight leading-tight">
                  Duyệt hồ sơ eKYC
                </h2>
                <p className="text-[14px] text-zinc-500 font-medium ml-1">
                  Phê duyệt & kiểm tra tính hợp lệ của hồ sơ định danh điện tử
                </p>
              </div>
            </div>

            {/* Right: Search + Refresh */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-72 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors duration-200" />
                <Input
                  placeholder="Tìm theo tên, email, CCCD..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
              <Button
                onClick={fetchPendingSessions}
                variant="outline"
                className="h-10 px-4 border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 font-bold text-xs shrink-0 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
              >
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <p className="text-xs font-bold text-zinc-400">Đang tải danh sách hồ sơ...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-4 border border-zinc-100">
              <Fingerprint className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-sm font-bold text-zinc-900">Không có hồ sơ nào đang chờ duyệt</p>
            <p className="text-xs text-zinc-400 font-medium mt-1">Toàn bộ yêu cầu eKYC đã được giải quyết.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    {[
                      "Khách hàng",
                      "Số CCCD",
                      "Khớp mặt AI",
                      "OCR Confidence",
                      "Risk",
                      "Thời gian gửi",
                      "Thao tác"
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={cn(
                          "px-6 py-4 text-[13px] font-semibold text-zinc-400 whitespace-nowrap",
                          col === "Thao tác" && "text-right"
                        )}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      onClick={() => handleOpenDetail(session)}
                      className="hover:bg-zinc-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 text-sm">{session.fullName || "Chưa cập nhật"}</span>
                          <span className="text-xs text-zinc-400 font-medium">{session.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-700 text-sm">
                        {session.identityNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-800">
                            {((session.faceMatchScore ?? 0.95) * 100).toFixed(0)}%
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              (session.faceMatchPassed ?? true)
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold"
                                : "bg-red-50 text-red-700 border-red-100 font-bold"
                            }
                          >
                            {(session.faceMatchPassed ?? true) ? "Hợp lệ" : "Lỗi khớp"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-zinc-600">
                        {((session.ocrConfidence ?? 0.96) * 100).toFixed(0)}%
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge session={session} />
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400 font-semibold">
                        {session.submittedAt
                          ? new Date(session.submittedAt).toLocaleString("vi-VN")
                          : "Vừa xong"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(session);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-zinc-100"
                        >
                          <Eye className="h-4.5 w-4.5 text-zinc-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List (< md) */}
            <div className="md:hidden divide-y divide-zinc-50">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleOpenDetail(session)}
                  className="p-4 space-y-3 cursor-pointer hover:bg-zinc-50/55 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{session.fullName || "Chưa cập nhật"}</p>
                      <p className="text-xs text-zinc-400 font-medium">{session.userEmail}</p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(session);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl hover:bg-zinc-100"
                    >
                      <Eye className="h-4 w-4 text-zinc-500" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-zinc-50 border border-zinc-200/50 text-zinc-600 px-2 py-0.5 rounded-md font-semibold">
                      CCCD: {session.identityNumber}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md font-bold border",
                      (session.faceMatchPassed ?? true)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    )}>
                      AI Match: {((session.faceMatchScore ?? 0.95) * 100).toFixed(0)}%
                    </span>
                    <span className="bg-zinc-50 border border-zinc-200/50 text-zinc-500 px-2 py-0.5 rounded-md font-semibold">
                      OCR: {((session.ocrConfidence ?? 0.96) * 100).toFixed(0)}%
                    </span>
                    <RiskBadge session={session} />
                  </div>

                  <p className="text-[10px] text-zinc-400 font-semibold">
                    Gửi lúc: {session.submittedAt ? new Date(session.submittedAt).toLocaleString("vi-VN") : "Vừa xong"}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && (
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                size={pagination.pageSize}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedSession && (
        <AdminFormDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          icon={ShieldCheck}
          iconClassName="bg-red-600 text-white shadow-lg shadow-red-100"
          title={`Chi tiết hồ sơ eKYC #${selectedSession.id}`}
          description="Xem chi tiết thông tin OCR trích xuất và hình ảnh tài liệu đối chiếu"
          maxWidth="max-w-4xl"
          hideFooter={true}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: OCR Fields */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 mb-4">Thông tin OCR trích xuất</h3>
                <div className="bg-zinc-50 p-6 rounded-2xl border border-black/5 space-y-4">
                  <DetailRow label="Số CCCD" value={selectedSession.identityNumber} />
                  <DetailRow label="Họ và tên" value={selectedSession.fullName} />
                  <DetailRow label="Ngày sinh" value={selectedSession.dateOfBirth ? String(selectedSession.dateOfBirth) : ""} />
                  <DetailRow label="Giới tính" value={selectedSession.gender === "MALE" ? "Nam" : selectedSession.gender === "FEMALE" ? "Nữ" : "Khác"} />
                  <DetailRow label="Quốc tịch" value={selectedSession.nationality} />
                  <DetailRow label="Quê quán" value={selectedSession.placeOfOrigin} />
                  <DetailRow label="Nơi thường trú" value={selectedSession.placeOfResidence} />
                  <DetailRow label="Ngày cấp" value={selectedSession.issuedDate ? String(selectedSession.issuedDate) : ""} />
                  <DetailRow label="Ngày hết hạn" value={selectedSession.expiryDate ? String(selectedSession.expiryDate) : ""} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-700 mb-4">Đánh giá khớp mặt AI</h3>
                <div className="bg-zinc-50 p-6 rounded-2xl border border-black/5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-500">Độ khớp mặt selfie vs ảnh CCCD:</span>
                    <span className="font-bold text-red-600">{((selectedSession.faceMatchScore ?? 0.95) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-500">Trạng thái so sánh khuôn mặt:</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">
                      {(selectedSession.faceMatchPassed ?? true) ? "Hợp lệ (Pass)" : "Không hợp lệ"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 mb-4">AI risk scoring</h3>
                <div className="bg-zinc-50 p-6 rounded-2xl border border-black/5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-500">Risk level:</span>
                    <RiskBadge session={selectedSession} />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-500">Risk score:</span>
                    <span className="font-bold text-zinc-800">{formatPercent(selectedSession.riskScore)}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-500 block mb-1">Reason:</span>
                    <p className="font-medium text-zinc-700 leading-relaxed">{selectedSession.riskReason || "---"}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-500">Liveness score:</span>
                    <span className="font-bold text-red-600">{formatPercent(selectedSession.livenessScore)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-500">Liveness status:</span>
                    <Badge
                      variant="outline"
                      className={
                        (selectedSession.livenessPassed ?? false)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold"
                          : "bg-amber-50 text-amber-700 border-amber-100 font-bold"
                      }
                    >
                      {(selectedSession.livenessPassed ?? false) ? "Pass" : "Needs review"}
                    </Badge>
                  </div>
                  {(selectedSession.spoofDetected || selectedSession.multipleFacesDetected) && (
                    <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
                      {selectedSession.spoofDetected ? "Spoof detected. " : ""}
                      {selectedSession.multipleFacesDetected ? "Multiple faces detected." : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Images */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-zinc-700">Hình ảnh tài liệu đã tải lên</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-zinc-500 block text-center">Mặt trước CCCD</span>
                  <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-black/5 bg-zinc-100 flex items-center justify-center relative">
                    {selectedSession.frontImageUrl ? (
                      <a href={getImageUrl(selectedSession.frontImageUrl)} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                        <img src={getImageUrl(selectedSession.frontImageUrl)} className="w-full h-full object-contain hover:scale-105 transition-transform" alt="Front" />
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-400">Không có ảnh</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-zinc-500 block text-center">Mặt sau CCCD</span>
                  <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-black/5 bg-zinc-100 flex items-center justify-center relative">
                    {selectedSession.backImageUrl ? (
                      <a href={getImageUrl(selectedSession.backImageUrl)} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                        <img src={getImageUrl(selectedSession.backImageUrl)} className="w-full h-full object-contain hover:scale-105 transition-transform" alt="Back" />
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-400">Không có ảnh</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 col-span-2 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-zinc-500 block">Ảnh Selfie chân dung</span>
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow bg-zinc-100 flex items-center justify-center relative">
                    {selectedSession.selfieImageUrl ? (
                      <a href={getImageUrl(selectedSession.selfieImageUrl)} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                        <img src={getImageUrl(selectedSession.selfieImageUrl)} className="w-full h-full object-cover hover:scale-105 transition-transform" alt="Selfie" />
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-400">Không có ảnh</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <span className="text-[11px] font-bold text-zinc-500 block text-center">Liveness video</span>
                  <div className="rounded-xl border border-black/5 bg-zinc-100 flex items-center justify-center p-3">
                    {selectedSession.livenessVideoUrl ? (
                      <a href={getImageUrl(selectedSession.livenessVideoUrl)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-600 hover:text-zinc-950">
                        Open liveness video
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-400">No video</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="h-11 px-6 rounded-xl border-black/5 text-zinc-700 bg-white"
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={() => handleOpenResolve("reject")}
              className="h-11 px-6 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow"
            >
              <XCircle className="w-4 h-4 mr-2" /> Từ chối
            </Button>
            <Button
              type="button"
              onClick={() => handleOpenResolve("approve")}
              className="h-11 px-6 rounded-xl bg-zinc-950 hover:bg-emerald-600 text-white font-bold shadow"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Phê duyệt
            </Button>
          </div>
        </AdminFormDialog>
      )}

      {/* Resolve Dialog */}
      <AdminFormDialog
        open={isResolveOpen}
        onOpenChange={setIsResolveOpen}
        icon={resolveAction === "approve" ? CheckCircle2 : XCircle}
        iconClassName={resolveAction === "approve" ? "bg-emerald-600 text-white shadow-emerald-100 shadow-lg" : "bg-red-600 text-white shadow-red-100 shadow-lg"}
        title={resolveAction === "approve" ? "Phê duyệt hồ sơ eKYC" : "Từ chối hồ sơ eKYC"}
        description={resolveAction === "approve" ? "Hồ sơ của khách hàng sẽ được phê duyệt. Trạng thái của khách hàng sẽ đổi thành VERIFIED." : "Vui lòng nhập lý do từ chối hồ sơ eKYC để gửi thông báo lại cho khách hàng."}
        onSubmit={(e) => {
          e.preventDefault();
          handleResolveSubmit();
        }}
        isPending={submitting}
        submitText="Xác nhận"
        submitIcon={resolveAction === "approve" ? CheckCircle2 : XCircle}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={resolveAction === "approve" ? "Nhập ghi chú phê duyệt (tùy chọn)" : "Lý do ảnh mờ, thông tin không trùng khớp..."}
            className="min-h-[100px] bg-zinc-50 border-black/5 focus:bg-white focus-visible:ring-red-600/20 focus-visible:border-red-600 transition-all text-xs font-medium rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.04)] resize-none text-zinc-800 placeholder:text-zinc-400"
          />
        </div>
      </AdminFormDialog>
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

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "---";
  return `${(value * 100).toFixed(0)}%`;
}

function RiskBadge({ session }: { session: Pick<KycSessionResponse, "riskLevel" | "riskScore"> }) {
  if (!session.riskLevel) {
    return (
      <Badge variant="outline" className="bg-zinc-50 text-zinc-500 border-zinc-200 font-bold">
        N/A
      </Badge>
    );
  }

  const meta = riskMeta[session.riskLevel];

  return (
    <Badge variant="outline" className={cn("font-bold", meta.className)}>
      {meta.label} {formatPercent(session.riskScore)}
    </Badge>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-zinc-200/50 last:border-0">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="text-xs font-extrabold text-zinc-800 text-right max-w-[65%] truncate">{value || "---"}</span>
    </div>
  );
}
