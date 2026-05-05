"use client";

import { Edit2, Trash2, RotateCcw, MoreHorizontal, Image as ImageIcon, DollarSign, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface ProductActionMenuProps {
  onEdit: () => void;
  onUpdatePrice: () => void;
  onGallery: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
  onView: () => void;
  isActive: boolean;
  isDeleted: boolean;
}

export function ProductActionMenu({
  onEdit,
  onUpdatePrice,
  onGallery,
  onDelete,
  onRestore,
  onHardDelete,
  onView,
  isActive,
  isDeleted,
}: ProductActionMenuProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-zinc-100 outline-none"
        >
          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 p-1.5 rounded-xl border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[9px] font-black uppercase text-zinc-400 px-3 py-1.5 tracking-widest">
              Tác vụ sản phẩm
            </DropdownMenuLabel>

            {!isDeleted ? (
              <>
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer"
                  onClick={onView}
                >
                  <Eye className="w-3.5 h-3.5" /> Xem chi tiết sản phẩm
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer"
                  onClick={onEdit}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Cập nhật thông tin
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer"
                  onClick={onUpdatePrice}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Cập nhật giá bán/thuê
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer"
                  onClick={onGallery}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Quản lý thư viện ảnh
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-zinc-50" />
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer text-red-600"
                  onClick={onDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vô hiệu hóa
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer text-emerald-700"
                  onClick={onRestore}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Khôi phục sản phẩm
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-zinc-50" />
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer text-red-600"
                  onClick={onHardDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa vĩnh viễn
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
