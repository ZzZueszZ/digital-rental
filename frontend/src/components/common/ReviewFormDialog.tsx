"use client";

import { useState, useRef } from "react";
import {
  Star,
  Image as ImageIcon,
  X,
  Loader2,
  MessageSquare,
  Package,
  CheckCircle2,
} from "lucide-react";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateReview, useUpdateReview } from "@/hooks/useReviews";
import {
  ReviewCreateRequest,
  ReviewResponse,
  ReviewUpdateRequest,
} from "@/types/review";
import { cn, getImageUrl } from "@/lib/utils";

interface ReviewFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  orderId?: number;
  orderCode?: string;
  initialData?: ReviewResponse;
}

export function ReviewFormDialog({
  isOpen,
  onClose,
  productId,
  productName,
  orderId,
  orderCode,
  initialData,
}: ReviewFormDialogProps) {
  const isEdit = !!initialData;
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [content, setContent] = useState(initialData?.content || "");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialData?.images || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Bạn chỉ có thể tải lên tối đa 5 ảnh");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    const newPreviews = previews.filter((_, i) => i !== index);
    // Only revoke if it's a blob URL
    if (previews[index].startsWith("blob:")) {
      URL.revokeObjectURL(previews[index]);
    }
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      if (isEdit && initialData) {
        const data: ReviewUpdateRequest = {
          rating,
          content: content.trim(),
        };
        await updateMutation.mutateAsync({ id: initialData.id, data, images });
        toast.success("Cập nhật đánh giá thành công!");
      } else {
        const data: ReviewCreateRequest = {
          productId,
          orderId: orderId!,
          rating,
          content: content.trim(),
        };
        await createMutation.mutateAsync({ data, images });
        toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      }
      handleClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể gửi đánh giá";
      toast.error(message);
    }
  };

  const handleClose = () => {
    if (!isEdit) {
      setRating(5);
      setContent("");
      setImages([]);
      previews.forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
      setPreviews([]);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminFormDialog
      open={isOpen}
      onOpenChange={handleClose}
      icon={Star}
      title={isEdit ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}
      description={
        isEdit
          ? `Cập nhật phản hồi cho ${productName}`
          : `Chia sẻ trải nghiệm của bạn về ${productName}`
      }
      hideFooter
    >
      <div className="space-y-6">
        {/* Order Info */}
        {orderCode && (
          <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center">
              <Package className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 tracking-wide">
                Đơn hàng
              </p>
              <p className="text-xs font-semibold text-zinc-900">{orderCode}</p>
            </div>
          </div>
        )}

        {/* Rating Stars */}
        <div className="flex flex-col items-center gap-3 py-4">
          <span className="text-sm font-semibold text-zinc-500">
            Bạn thấy sản phẩm này thế nào?
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="group relative"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-all duration-300",
                    s <= rating
                      ? "fill-amber-400 text-amber-400 scale-110"
                      : "text-zinc-200 group-hover:text-zinc-300",
                  )}
                />
              </button>
            ))}
          </div>
          <span
            className={cn(
              "text-xs font-semibold tracking-wide",
              rating >= 4
                ? "text-emerald-600"
                : rating >= 3
                  ? "text-amber-500"
                  : "text-red-500",
            )}
          >
            {rating === 5
              ? "Rất hài lòng"
              : rating === 4
                ? "Hài lòng"
                : rating === 3
                  ? "Bình thường"
                  : rating === 2
                    ? "Không hài lòng"
                    : "Rất tệ"}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-900">
              Nội dung đánh giá
            </span>
          </div>
          <Textarea
            placeholder="Hãy chia sẻ những điều bạn thích về thiết bị này nhé..."
            className="min-h-[120px] rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all duration-300 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-900">
                Hình ảnh thực tế (Tối đa 5)
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] font-semibold text-red-600 tracking-wide hover:underline"
            >
              Thêm ảnh
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {previews.map((p, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-100 group animate-in zoom-in-50 duration-300"
              >
                <img
                  src={getImageUrl(p)}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-1 hover:border-red-200 hover:bg-red-50/30 transition-all text-zinc-300 hover:text-red-400"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Thêm</span>
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-zinc-50 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="flex-1 h-12 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-semibold shadow-sm hover:bg-zinc-100 hover:text-zinc-950"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-[2] h-12 rounded-xl bg-zinc-950 text-white font-semibold text-xs hover:bg-red-600 transition-all shadow-xl shadow-zinc-100"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            {isEdit ? "Cập nhật" : "Gửi đánh giá"}
          </Button>
        </div>
      </div>
    </AdminFormDialog>
  );
}
