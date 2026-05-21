import {
  Eye,
  MoreHorizontal,
  EyeOff,
  Flag,
  CheckCircle2,
  Trash2,
  Star,
  User,
  MessageSquare,
  Package,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReviewResponse } from "@/types/review";
import { cn, getImageUrl } from "@/lib/utils";

interface ReviewItemsProps {
  review: ReviewResponse;
  onView: (review: ReviewResponse) => void;
  onHide: (id: number) => void;
  onUnhide: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ReviewTableRow({
  review,
  onView,
  onHide,
  onUnhide,
  onDelete,
}: ReviewItemsProps) {
  return (
    <tr
      onClick={() => onView(review)}
      className="group transition-all duration-300 hover:bg-zinc-50/50 cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200/50 group-hover:scale-105 transition-transform duration-150">
            {review.userAvatar ? (
              <img
                src={getImageUrl(review.userAvatar)}
                alt={review.userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-950 tracking-tight mb-0.5 group-hover:text-red-600 transition-colors duration-300">
              {review.userName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                ID: {review.userId}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col max-w-[250px]">
          <div className="flex items-center gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-200",
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-zinc-600 line-clamp-2 leading-relaxed italic">
            &ldquo;{review.content}&rdquo;
          </span>
          {review.images && review.images.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                +{review.images.length} ảnh
              </span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl border border-zinc-100 bg-zinc-50/50 w-fit mx-auto">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] font-bold text-zinc-600">
            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit",
              review.hidden
                ? "bg-zinc-100 text-zinc-500 border border-zinc-200"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100",
            )}
          >
            {review.hidden ? (
              <>
                <EyeOff className="w-2.5 h-2.5" /> Ẩn
              </>
            ) : (
              <>
                <CheckCircle2 className="w-2.5 h-2.5" /> Hiển thị
              </>
            )}
          </div>
          {review.reporterCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold w-fit animate-pulse">
              <Flag className="w-2.5 h-2.5" /> {review.reporterCount} Báo cáo
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-xl hover:bg-zinc-100 inline-flex items-center justify-center outline-none transition-all duration-200">
            <MoreHorizontal className="h-4 w-4 text-zinc-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 p-1.5 rounded-xl shadow-xl border-zinc-100 bg-white animate-in zoom-in-95 duration-200"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-bold text-zinc-500 px-2 py-1.5">
                Quản lý đánh giá
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onView(review)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </DropdownMenuItem>
              {review.hidden ? (
                <DropdownMenuItem
                  onClick={() => onUnhide(review.id)}
                  className="cursor-pointer text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Hiển thị lại
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onHide(review.id)}
                  className="cursor-pointer text-amber-600 focus:bg-amber-50 focus:text-amber-600"
                >
                  <EyeOff className="w-4 h-4" />
                  Ẩn đánh giá
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(review.id)}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Xóa vĩnh viễn
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function ReviewMobileCard({
  review,
  onView,
  onHide,
  onUnhide,
  onDelete,
}: ReviewItemsProps) {
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
            {review.userAvatar ? (
              <img
                src={getImageUrl(review.userAvatar)}
                alt={review.userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <div>
            <h4 className="font-black text-zinc-950">{review.userName}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-200",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "px-2.5 py-1 rounded-xl border text-[10px] font-bold",
            review.hidden
              ? "bg-zinc-50 text-zinc-400 border-zinc-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100",
          )}
        >
          {review.hidden ? "Đã ẩn" : "Hiển thị"}
        </div>
      </div>

      <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100/50">
        <p className="text-sm font-medium text-zinc-600 leading-relaxed italic">
          &ldquo;{review.content}&rdquo;
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-950"
            onClick={() => onView(review)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-950"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
