"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Fingerprint,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/app/(staff)/staff/components/Pagination";
import { cn } from "@/lib/utils";
import { identityService, KycSessionResponse } from "@/services/identity";

type KycRiskLevel = NonNullable<KycSessionResponse["riskLevel"]>;

const riskMeta: Record<KycRiskLevel, { label: string; className: string }> = {
  LOW_RISK: {
    label: "Thấp",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  MEDIUM_RISK: {
    label: "Trung bình",
    className: "border-amber-100 bg-amber-50 text-amber-700",
  },
  HIGH_RISK: {
    label: "Cao",
    className: "border-red-100 bg-red-50 text-red-700",
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
  const [selectedSession, setSelectedSession] =
    useState<KycSessionResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolveAction, setResolveAction] = useState<
    "approve" | "reject" | null
  >(null);
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
      } else {
        setPagination(null);
      }
    } catch (err) {
      toast.error("Không thể tải danh sách hồ sơ eKYC");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSessions();
  }, [page]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((session) =>
      [
        session.fullName,
        session.identityNumber,
        session.userEmail,
      ].some((value) => value?.toLowerCase().includes(q)),
    );
  }, [searchQuery, sessions]);

  const stats = useMemo(() => {
    const highRisk = sessions.filter((s) => s.riskLevel === "HIGH_RISK").length;
    const needsManual = sessions.filter((s) => s.manualReviewRequired).length;
    const avgFaceMatch =
      sessions.length === 0
        ? 0
        : sessions.reduce((sum, s) => sum + (s.faceMatchScore ?? 0), 0) /
          sessions.length;
    return {
      total: pagination?.totalElements ?? sessions.length,
      highRisk,
      needsManual,
      avgFaceMatch,
    };
  }, [pagination?.totalElements, sessions]);

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
          ? "Đã phê duyệt eKYC thành công"
          : "Đã từ chối hồ sơ eKYC",
      );
      setIsResolveOpen(false);
      setIsDetailOpen(false);
      setSelectedSession(null);
      await fetchPendingSessions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Xử lý eKYC thất bại");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[13px] font-medium text-red-600">
              Kiểm duyệt định danh
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Duyệt hồ sơ eKYC.
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-zinc-500">
              Kiểm tra OCR, đối chiếu khuôn mặt, liveness và mức độ rủi ro trước
              khi xác minh người thuê.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[360px]">
            <MetricCard label="Chờ duyệt" value={stats.total} />
            <MetricCard label="Rủi ro cao" value={stats.highRisk} tone="red" />
            <MetricCard label="Cần xem tay" value={stats.needsManual} />
            <MetricCard
              label="Khớp mặt TB"
              value={`${(stats.avgFaceMatch * 100).toFixed(0)}%`}
              tone="green"
            />
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-none">
        <div className="border-b border-zinc-100 px-5 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-950">
                  Danh sách hồ sơ
                </h3>
                <p className="mt-1 text-sm font-medium text-zinc-500">
                  Chỉ hiển thị hồ sơ đang chờ xét duyệt.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Tìm tên, email, CCCD..."
                  className="h-11 rounded-xl border-zinc-200 bg-white pl-10 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus-visible:border-red-200 focus-visible:ring-red-100"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={fetchPendingSessions}
                variant="outline"
                className="h-11 rounded-xl border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <p className="text-sm font-medium text-zinc-500">
              Đang tải danh sách hồ sơ...
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50">
              <Fingerprint className="h-7 w-7 text-zinc-400" />
            </div>
            <p className="text-base font-semibold text-zinc-950">
              Không có hồ sơ nào đang chờ duyệt
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Toàn bộ yêu cầu eKYC hiện tại đã được xử lý.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/70">
                    {[
                      "Khách hàng",
                      "Số CCCD",
                      "AI match",
                      "OCR",
                      "Rủi ro",
                      "Thời gian gửi",
                      "Thao tác",
                    ].map((column) => (
                      <th
                        key={column}
                        className={cn(
                          "px-6 py-4 text-sm font-medium text-zinc-500 whitespace-nowrap",
                          column === "Thao tác" && "text-right",
                        )}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      onClick={() => handleOpenDetail(session)}
                      className="cursor-pointer transition-colors hover:bg-zinc-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-sm font-semibold text-zinc-700">
                            {getInitial(session.fullName || session.userEmail)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-950">
                              {session.fullName || "Chưa cập nhật"}
                            </p>
                            <p className="truncate text-xs font-medium text-zinc-500">
                              {session.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-700">
                        {session.identityNumber || "---"}
                      </td>
                      <td className="px-6 py-4">
                        <FaceBadge session={session} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-700">
                        {formatRatioPercent(session.ocrConfidence)}
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge session={session} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-500">
                        {formatDateTime(session.submittedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(session);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl border-zinc-200 bg-white text-sm font-medium !text-zinc-700 hover:bg-zinc-100 hover:!text-zinc-950 [&_svg]:!text-zinc-500 hover:[&_svg]:!text-zinc-700"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-zinc-100 md:hidden">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleOpenDetail(session)}
                  className="w-full p-4 text-left transition-colors hover:bg-zinc-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">
                        {session.fullName || "Chưa cập nhật"}
                      </p>
                      <p className="mt-1 text-xs font-medium text-zinc-500">
                        {session.userEmail}
                      </p>
                    </div>
                    <RiskBadge session={session} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <MiniTag>CCCD: {session.identityNumber || "---"}</MiniTag>
                    <MiniTag>AI: {formatRatioPercent(session.faceMatchScore)}</MiniTag>
                    <MiniTag>OCR: {formatRatioPercent(session.ocrConfidence)}</MiniTag>
                  </div>
                  <p className="mt-3 text-xs font-medium text-zinc-400">
                    Gửi lúc: {formatDateTime(session.submittedAt)}
                  </p>
                </button>
              ))}
            </div>

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

      {selectedSession && (
        <AdminFormDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          icon={ShieldCheck}
          iconClassName="bg-red-600 text-white"
          title={`Chi tiết hồ sơ eKYC #${selectedSession.id}`}
          description="Kiểm tra thông tin OCR, AI face match, liveness và tài liệu đối chiếu."
          maxWidth="max-w-5xl"
          hideFooter
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-5">
              <InfoCard
                title="Thông tin OCR"
                icon={UserCheck}
                rows={[
                  ["Số CCCD", selectedSession.identityNumber],
                  ["Họ và tên", selectedSession.fullName],
                  ["Ngày sinh", selectedSession.dateOfBirth],
                  ["Giới tính", formatGender(selectedSession.gender)],
                  ["Quốc tịch", selectedSession.nationality],
                  ["Quê quán", selectedSession.placeOfOrigin],
                  ["Nơi thường trú", selectedSession.placeOfResidence],
                  ["Ngày cấp", selectedSession.issuedDate],
                  ["Ngày hết hạn", selectedSession.expiryDate],
                ]}
              />

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-zinc-950">
                      Đánh giá AI
                    </h4>
                    <p className="text-sm font-medium text-zinc-500">
                      Face match, liveness và risk scoring.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ScoreTile
                    label="Face match"
                    value={formatRatioPercent(selectedSession.faceMatchScore)}
                    status={
                      selectedSession.faceMatchPassed ?? false
                        ? "Đạt"
                        : "Cần kiểm tra"
                    }
                  />
                  <ScoreTile
                    label="Liveness"
                    value={formatRatioPercent(selectedSession.livenessScore)}
                    status={
                      selectedSession.livenessPassed ?? false
                        ? "Đạt"
                        : "Cần kiểm tra"
                    }
                  />
                  <ScoreTile
                    label="Risk score"
                    value={formatRiskScore(selectedSession.riskScore)}
                    status={selectedSession.riskLevel || "N/A"}
                  />
                  <ScoreTile
                    label="OCR confidence"
                    value={formatRatioPercent(selectedSession.ocrConfidence)}
                    status="OCR"
                  />
                </div>
                <p className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm font-medium leading-6 text-zinc-600">
                  {selectedSession.riskReason || "Chưa có ghi chú rủi ro."}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-zinc-950">
                      Tài liệu đối chiếu
                    </h4>
                    <p className="text-sm font-medium text-zinc-500">
                      Bấm vào ảnh để mở kích thước đầy đủ.
                    </p>
                  </div>
                  <RiskBadge session={selectedSession} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ImagePreview
                    label="Mặt trước CCCD"
                    url={selectedSession.frontImageUrl}
                    className="aspect-[1.58/1]"
                  />
                  <ImagePreview
                    label="Mặt sau CCCD"
                    url={selectedSession.backImageUrl}
                    className="aspect-[1.58/1]"
                  />
                  <ImagePreview
                    label="Selfie"
                    url={selectedSession.selfieImageUrl}
                    className="aspect-square sm:col-span-2"
                    imageClassName="object-contain"
                  />
                  <div className="sm:col-span-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-950">
                      Liveness video
                    </p>
                    {selectedSession.livenessVideoUrl ? (
                      <a
                        href={getImageUrl(selectedSession.livenessVideoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Mở video kiểm tra thực thể sống
                      </a>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-zinc-500">
                        Chưa có video.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="h-11 rounded-xl border-zinc-200 bg-white px-5 text-sm font-medium !text-zinc-700 hover:bg-zinc-100 hover:!text-zinc-950"
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenResolve("reject")}
                  className="h-11 rounded-xl border-red-200 bg-white px-5 text-sm font-semibold !text-red-600 hover:border-red-300 hover:bg-red-50 hover:!text-red-700 [&_svg]:!text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>
                <Button
                  type="button"
                  onClick={() => handleOpenResolve("approve")}
                  className="h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold !text-white shadow-md shadow-red-100 hover:bg-red-700 hover:!text-white [&_svg]:!text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Phê duyệt
                </Button>
              </div>
            </div>
          </div>
        </AdminFormDialog>
      )}

      <AdminFormDialog
        open={isResolveOpen}
        onOpenChange={setIsResolveOpen}
        icon={resolveAction === "approve" ? CheckCircle2 : XCircle}
        iconClassName={
          resolveAction === "approve"
            ? "bg-emerald-600 text-white"
            : "bg-red-600 text-white"
        }
        title={
          resolveAction === "approve"
            ? "Phê duyệt hồ sơ eKYC"
            : "Từ chối hồ sơ eKYC"
        }
        description={
          resolveAction === "approve"
            ? "Hồ sơ sẽ chuyển sang trạng thái VERIFIED."
            : "Nhập lý do để khách hàng biết cần bổ sung hoặc chỉnh sửa gì."
        }
        onSubmit={(e) => {
          e.preventDefault();
          handleResolveSubmit();
        }}
        isPending={submitting}
        submitText="Xác nhận"
        submitIcon={resolveAction === "approve" ? CheckCircle2 : XCircle}
        maxWidth="max-w-md"
      >
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            resolveAction === "approve"
              ? "Ghi chú phê duyệt"
              : "Ví dụ: ảnh mờ, thông tin không trùng khớp..."
          }
          className="min-h-[120px] resize-none rounded-xl border-zinc-200 bg-white text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus-visible:border-red-200 focus-visible:ring-red-100"
        />
      </AdminFormDialog>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: string | number;
  tone?: "zinc" | "red" | "green";
}) {
  const color = {
    zinc: "text-zinc-950",
    red: "text-red-600",
    green: "text-emerald-600",
  }[tone];

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold", color)}>{value}</p>
    </div>
  );
}

function InfoCard({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof UserCheck;
  rows: Array<[string, string | undefined | null]>;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-700">
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="text-base font-semibold text-zinc-950">{title}</h4>
      </div>
      <div className="divide-y divide-zinc-100">
        {rows.map(([label, value]) => (
          <DetailRow key={label} label={label} value={value || "---"} />
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <span className="max-w-[62%] text-right text-sm font-semibold text-zinc-950">
        {value}
      </span>
    </div>
  );
}

function ScoreTile({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-lg font-semibold text-zinc-950">{value}</span>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-100">
          {status}
        </span>
      </div>
    </div>
  );
}

function ImagePreview({
  label,
  url,
  className,
  imageClassName,
}: {
  label: string;
  url?: string;
  className?: string;
  imageClassName?: string;
}) {
  const imageUrl = getImageUrl(url);

  return (
    <div>
      <p className="mb-2 text-center text-xs font-medium text-zinc-500">
        {label}
      </p>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50",
          className,
        )}
      >
        {imageUrl ? (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={imageUrl}
              alt={label}
              className={cn("h-full w-full object-contain", imageClassName)}
            />
          </a>
        ) : (
          <div className="flex h-full min-h-32 items-center justify-center text-sm font-medium text-zinc-400">
            Chưa có ảnh
          </div>
        )}
      </div>
    </div>
  );
}

function FaceBadge({ session }: { session: KycSessionResponse }) {
  const passed = session.faceMatchPassed ?? false;
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        passed
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-amber-100 bg-amber-50 text-amber-700",
      )}
    >
      {formatRatioPercent(session.faceMatchScore)}
    </Badge>
  );
}

function RiskBadge({
  session,
}: {
  session: Pick<KycSessionResponse, "riskLevel" | "riskScore">;
}) {
  if (!session.riskLevel) {
    return (
      <Badge
        variant="outline"
        className="rounded-full border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500"
      >
        N/A
      </Badge>
    );
  }

  const meta = riskMeta[session.riskLevel];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 text-xs font-medium", meta.className)}
    >
      {meta.label} · {formatRiskScore(session.riskScore)}
    </Badge>
  );
}

function MiniTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
      {children}
    </span>
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

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "K";
}

function formatDateTime(value?: string) {
  if (!value) return "Vừa xong";
  return new Date(value).toLocaleString("vi-VN");
}

function formatRatioPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "---";
  return `${(value * 100).toFixed(0)}%`;
}

function formatRiskScore(value: number | null | undefined) {
  if (value === null || value === undefined) return "---";
  return `${value.toFixed(0)}%`;
}

function formatGender(value?: string) {
  if (value === "MALE") return "Nam";
  if (value === "FEMALE") return "Nữ";
  if (value === "OTHER") return "Khác";
  return value || "---";
}
