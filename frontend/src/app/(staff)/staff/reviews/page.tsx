"use client";

import { useState } from "react";
import {
  Search,
  MessageSquare,
  Flag,
  EyeOff,
  Star,
  MessageCircle,
  TrendingUp,
  Package,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useReviews,
  useReportedReviews,
  useHiddenReviews,
  useHideReview,
  useUnhideReview,
  useDeleteReview,
} from "@/hooks/useReviews";
import { ReviewResponse } from "@/types/review";
import { ReviewTableRow, ReviewMobileCard } from "./components/ReviewListItems";
import { AdminReviewDetailDialog } from "./components/AdminReviewDetailDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Pagination } from "../components/Pagination";
import { EmptyState } from "../users/components/EmptyState";
import { StatCard } from "../components/StatCard";
import { cn } from "@/lib/utils";

export default function ReviewsAdminPage() {
  const [viewMode, setViewMode] = useState<"ALL" | "REPORTED" | "HIDDEN">(
    "ALL",
  );
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const allQuery = useReviews(page, 10);
  const reportedQuery = useReportedReviews(page, 10);
  const hiddenQuery = useHiddenReviews(page, 10);

  const query =
    viewMode === "ALL"
      ? allQuery
      : viewMode === "REPORTED"
        ? reportedQuery
        : hiddenQuery;
  const reviews: ReviewResponse[] = query.data?.data || [];

  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || 0;

  const hideMutation = useHideReview();
  const unhideMutation = useUnhideReview();
  const deleteMutation = useDeleteReview();

  const handleAction = async (
    action: () => Promise<unknown>,
    successMsg: string,
  ) => {
    try {
      await action();
      toast.success(successMsg);
      if (isDetailOpen) setIsDetailOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Thao tác thất bại";
      toast.error(message);
    }
  };

  const confirmHide = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Ẩn đánh giá?",
      description:
        "Đánh giá này sẽ không còn hiển thị công khai trên cửa hàng.",
      variant: "warning",
      onConfirm: () =>
        handleAction(() => hideMutation.mutateAsync(id), "Đã ẩn đánh giá"),
    });
  };

  const confirmDelete = (id: number) => {
    setConfirmConfig({
      open: true,
      title: "Xóa vĩnh viễn?",
      description:
        "Hành động này không thể hoàn tác. Đánh giá sẽ bị xóa khỏi hệ thống.",
      variant: "danger",
      onConfirm: () =>
        handleAction(() => deleteMutation.mutateAsync(id), "Đã xóa đánh giá"),
    });
  };

  const handleShowDetail = (review: ReviewResponse) => {
    setSelectedReview(review);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Section */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng phản hồi"
          value={totalElements}
          icon={MessageSquare}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Bị báo cáo"
          value={reportedQuery.data?.pagination?.totalElements || 0}
          trend={0}
          icon={Flag}
          accent="bg-red-500"
        />
        <StatCard
          title="Đã ẩn"
          value={hiddenQuery.data?.pagination?.totalElements || 0}
          trend={0}
          icon={EyeOff}
          accent="bg-zinc-500"
        />
        <StatCard
          title="Tỉ lệ hài lòng"
          value="92%"
          trend={3}
          icon={Star}
          accent="bg-emerald-500"
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
        {/* Header with Title and Filters */}
        <div className="px-5 py-4 sm:py-5 border-b border-zinc-50">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
            {/* Left: Title + Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center ">
                    <MessageSquare
                      className="w-4.5 h-4.5 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <h2 className="text-2xl font-semibold text-zinc-950 tracking-tight leading-tight">
                    {viewMode === "ALL"
                      ? "Quản lý đánh giá"
                      : viewMode === "REPORTED"
                        ? "Đánh giá bị báo cáo"
                        : "Đánh giá đã ẩn"}
                  </h2>
                </div>
                <p className="text-[14px] text-zinc-500 font-medium ml-12">
                  Giám sát và điều phối phản hồi của khách hàng
                </p>
              </div>

              {/* Tab Toggle */}
              <div className="flex items-center gap-1 bg-zinc-50/50 border border-zinc-100 p-1 rounded-xl w-fit">
                {[
                  { id: "ALL", label: "Tất cả" },
                  { id: "REPORTED", label: "Báo cáo" },
                  { id: "HIDDEN", label: "Đã ẩn" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setViewMode(tab.id as typeof viewMode);
                      setPage(0);
                    }}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-[14px] font-medium transition-all duration-150 whitespace-nowrap",
                      viewMode === tab.id
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Search */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="group relative min-w-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors duration-200" />
                <Input
                  placeholder="Tìm nội dung đánh giá..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1">
          {query.isLoading ? (
            <div className="py-24 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-zinc-100 border-t-red-600 rounded-full animate-spin" />
                <span className="text-[13px] font-medium text-zinc-400">
                  Đang tải dữ liệu...
                </span>
              </div>
            </div>
          ) : reviews.length > 0 ? (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">
                        Người dùng
                      </th>
                      <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">
                        Nội dung & Đánh giá
                      </th>
                      <th className="px-6 py-4 text-[13px] font-medium text-zinc-400 text-center">
                        Ngày đăng
                      </th>
                      <th className="px-6 py-4 text-[13px] font-medium text-zinc-400 text-center">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-[13px] font-medium text-zinc-400 text-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {reviews.map((review) => (
                      <ReviewTableRow
                        key={review.id}
                        review={review}
                        onView={(r) => handleShowDetail(r)}
                        onHide={(id) => confirmHide(id)}
                        onUnhide={(id) =>
                          handleAction(
                            () => unhideMutation.mutateAsync(id),
                            "Đã hiển thị lại đánh giá",
                          )
                        }
                        onDelete={(id) => confirmDelete(id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                {reviews.map((review) => (
                  <ReviewMobileCard
                    key={review.id}
                    review={review}
                    onView={(r) => handleShowDetail(r)}
                    onHide={(id) => confirmHide(id)}
                    onUnhide={(id) =>
                      handleAction(
                        () => unhideMutation.mutateAsync(id),
                        "Đã hiển thị lại đánh giá",
                      )
                    }
                    onDelete={(id) => confirmDelete(id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-24">
              <EmptyState
                title="Không tìm thấy đánh giá nào"
                description={
                  search
                    ? `Không có kết quả nào cho "${search}"`
                    : "Hiện tại chưa có đánh giá nào trong hệ thống."
                }
                icon={MessageSquare}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={10}
          onPageChange={setPage}
        />
      </div>

      <AdminReviewDetailDialog
        review={selectedReview}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onHide={confirmHide}
        onUnhide={(id) =>
          handleAction(
            () => unhideMutation.mutateAsync(id),
            "Đã hiển thị lại đánh giá",
          )
        }
        onDelete={confirmDelete}
      />

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(open) => setConfirmConfig({ ...confirmConfig, open })}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
