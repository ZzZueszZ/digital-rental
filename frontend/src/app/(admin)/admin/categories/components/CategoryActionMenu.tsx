"use client";

import { Edit2, Trash2, RotateCcw, MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface CategoryActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  isActive: boolean;
  compact?: boolean;
}

export function CategoryActionMenu({
  onEdit,
  onDelete,
  onRestore,
  isActive,
  compact = false,
}: CategoryActionMenuProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={
            compact
              ? "inline-flex items-center justify-center h-8 w-8 rounded-lg p-0 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-all duration-200 outline-none"
              : "inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-zinc-100 outline-none"
          }
        >
          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-52 p-1.5 rounded-xl border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[9px] font-black uppercase text-zinc-400 px-3 py-1.5 tracking-widest">
              Tác vụ quản trị
            </DropdownMenuLabel>

            {isActive ? (
              <>
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer focus:bg-zinc-50 text-zinc-700"
                  onClick={onEdit}
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" /> Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-zinc-50" />
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer text-red-600 focus:bg-red-50"
                  onClick={onDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vô hiệu hóa
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  className="rounded-lg h-9 font-semibold text-xs gap-3 cursor-pointer text-emerald-700 focus:bg-emerald-50"
                  onClick={onRestore}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Khôi phục danh mục
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
