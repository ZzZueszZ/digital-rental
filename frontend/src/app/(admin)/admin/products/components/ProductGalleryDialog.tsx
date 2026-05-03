"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Plus, X, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";
import { ProductResponse } from "@/types/product";
import { useAddGallery, useDeleteGalleryImage } from "@/services/product";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { AdminFormDialog } from "@/components/common/AdminFormDialog";

interface ProductGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResponse | null;
}

export function ProductGalleryDialog({
  open,
  onOpenChange,
  product,
}: ProductGalleryDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addGalleryMutation = useAddGallery(product?.id || 0);
  const deleteGalleryMutation = useDeleteGalleryImage(product?.id || 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate size (10MB)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn (tối đa 10MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await addGalleryMutation.mutateAsync(selectedFiles);
      toast.success("Đã thêm ảnh vào bộ sưu tập");
      setSelectedFiles([]);
      setPreviews([]);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi tải ảnh lên");
    }
  };

  const handleDeleteExisting = async (imageId: number) => {
    try {
      await deleteGalleryMutation.mutateAsync(imageId);
      toast.success("Đã xóa ảnh khỏi bộ sưu tập");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể xóa ảnh");
    }
  };

  if (!product) return null;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={ImageIcon}
      iconClassName="bg-zinc-50 text-red-600"
      title="Thư viện ảnh"
      description={`Quản lý bộ sưu tập hình ảnh cho: ${product.name}`}
      onSubmit={handleSubmit}
      isPending={addGalleryMutation.isPending}
      submitText={selectedFiles.length > 0 ? `Tải lên ${selectedFiles.length} ảnh` : "Lưu thay đổi"}
      submitIcon={Plus}
      cancelText="Đóng"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-8">
        {/* Current Gallery */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ảnh hiện tại ({product.gallery?.length || 0})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.gallery?.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100">
                <Image
                  src={getImageUrl(img.url)}
                  alt="Gallery"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="rounded-full h-9 w-9"
                    onClick={() => handleDeleteExisting(img.id)}
                    disabled={deleteGalleryMutation.isPending}
                  >
                    {deleteGalleryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
            {(!product.gallery || product.gallery.length === 0) && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                <ImageIcon className="w-10 h-10 text-zinc-300 mb-3" />
                <p className="text-xs font-bold text-zinc-400">Chưa có ảnh trong bộ sưu tập</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload New Section */}
        <div className="space-y-4 pt-6 border-t border-zinc-100">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tải lên ảnh mới</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-red-100 shadow-sm">
                <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeSelectedFile(idx)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-zinc-950 flex items-center justify-center hover:bg-white shadow-sm transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 hover:border-red-400 hover:bg-red-50/30 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-zinc-400 group-hover:text-red-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-red-600">Thêm ảnh</span>
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </AdminFormDialog>
  );
}
