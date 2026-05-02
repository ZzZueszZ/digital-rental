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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await addGalleryMutation.mutateAsync(selectedFiles);
      toast.success("Đã thêm ảnh vào bộ sưu tập");
      setSelectedFiles([]);
      setPreviews([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tải ảnh lên");
    }
  };

  const handleDeleteExisting = async (imageId: number) => {
    try {
      await deleteGalleryMutation.mutateAsync(imageId);
      toast.success("Đã xóa ảnh khỏi bộ sưu tập");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xóa ảnh");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-white rounded-3xl shadow-2xl">
        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-zinc-950 tracking-tight">
                Thư viện ảnh
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-zinc-500">
                Quản lý bộ sưu tập hình ảnh cho: <span className="text-zinc-950 font-bold">{product.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8">
          {/* Current Gallery */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Ảnh hiện tại ({product.gallery?.length || 0})</h3>
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
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Tải lên ảnh mới</h3>
              {selectedFiles.length > 0 && (
                <Button 
                  onClick={handleUpload}
                  disabled={addGalleryMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-xl px-6 transition-all shadow-lg shadow-indigo-200"
                >
                  {addGalleryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Tải lên {selectedFiles.length} ảnh
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-sm">
                  <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                  <button
                    onClick={() => removeSelectedFile(idx)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-zinc-950 flex items-center justify-center hover:bg-white shadow-sm transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-indigo-600">Thêm ảnh</span>
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

        <div className="p-8 bg-zinc-50/50 border-t border-zinc-100 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold h-11 px-8 border-zinc-200"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
