"use client";

import { 
  Star, 
  User, 
  Package, 
  Calendar, 
  Flag, 
  EyeOff, 
  CheckCircle2,
  Trash2,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Button } from "@/components/ui/button";
import { ReviewResponse } from "@/types/review";
import { cn, getImageUrl } from "@/lib/utils";

interface AdminReviewDetailDialogProps {
  review: ReviewResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHide: (id: number) => void;
  onUnhide: (id: number) => void;
  onDelete: (id: number) => void;
}

export function AdminReviewDetailDialog({ 
  review, 
  open, 
  onOpenChange, 
  onHide, 
  onUnhide, 
  onDelete 
}: AdminReviewDetailDialogProps) {
  if (!review) return null;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết Đánh giá"
      icon={Star}
      iconClassName="bg-red-600 text-white shadow-lg shadow-red-100"
      description={`Quản lý nội dung phản hồi từ khách hàng #${review.userId}`}
      hideFooter
      maxWidth="max-w-2xl"
    >
      <div className="space-y-8 py-2">
        {/* User & Product Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group">
            <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {review.userAvatar ? (
                <img src={getImageUrl(review.userAvatar)} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-zinc-400" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Khách hàng</span>
              <span className="text-sm font-black text-zinc-950 truncate group-hover:text-red-600 transition-colors">{review.userName}</span>
              <span className="text-[11px] font-medium text-zinc-400">ID: #{review.userId}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group">
            <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
              <Package className="w-6 h-6 text-zinc-400 group-hover:text-red-600 transition-colors" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Sản phẩm</span>
              <span className="text-sm font-black text-zinc-950 truncate">ID: #{review.productId}</span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline cursor-pointer">
                Xem thiết bị <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-black text-zinc-900 uppercase tracking-widest">Nội dung đánh giá</span>
            </div>
            <div className="flex items-center gap-0.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
               {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-3.5 h-3.5", 
                    i < review.rating ? "fill-amber-400 text-amber-400" : "text-amber-200/50"
                  )} 
                />
              ))}
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border-2 border-zinc-50 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <MessageSquare className="w-24 h-24" />
            </div>
            <p className="text-base font-medium text-zinc-600 italic leading-relaxed relative z-10">
              &ldquo;{review.content}&rdquo;
            </p>
          </div>

          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {review.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-zinc-100 shadow-sm group relative">
                  <img src={getImageUrl(img)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-widest",
            review.hidden ? "bg-zinc-100 text-zinc-400 border-zinc-200" : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
            {review.hidden ? <><EyeOff className="w-3.5 h-3.5" /> Đã ẩn</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Hiển thị</>}
          </div>
          {review.reporterCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[11px] font-bold uppercase tracking-widest animate-pulse">
              <Flag className="w-3.5 h-3.5" /> {review.reporterCount} Báo cáo
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {review.hidden ? (
              <Button 
                onClick={() => onUnhide(review.id)}
                className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 font-bold transition-all duration-200"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Hiển thị lại
              </Button>
            ) : (
              <Button 
                onClick={() => onHide(review.id)}
                className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-100 font-bold transition-all duration-200"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Ẩn đánh giá
              </Button>
            )}
          </div>
          
          <Button 
            variant="ghost"
            onClick={() => onDelete(review.id)}
            className="w-full sm:w-auto h-12 px-6 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa vĩnh viễn
          </Button>
        </div>
      </div>
    </AdminFormDialog>
  );
}
