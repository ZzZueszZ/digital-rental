"use client";

import { useRouter } from "next/navigation";
import {
  Eye,
  Edit2,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export interface UserActionCallbacks {
  onResetPassword: () => void;
  onLock: () => void;
  onUnlock: () => void;
  onDelete: () => void;
  onRestore: () => void;
}

interface UserActionMenuProps {
  userId: number;
  viewMode: "ACTIVE" | "DELETED";
  accountNonLocked: boolean;
  callbacks: UserActionCallbacks;
  /** Compact trigger style for desktop table */
  compact?: boolean;
}

export function UserActionMenu({
  userId,
  viewMode,
  accountNonLocked,
  callbacks,
  compact = false,
}: UserActionMenuProps) {
  const router = useRouter();

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={
            compact
              ? "inline-flex items-center justify-center h-8 w-8 rounded-xl p-0 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-all duration-200 outline-none"
              : "inline-flex items-center justify-center h-8 w-8 rounded-xl hover:bg-zinc-100 outline-none"
          }
        >
          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-52 p-1.5 rounded-xl border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-bold text-zinc-400 px-2 py-1.5 tracking-widest">
              Tác vụ quản trị
            </DropdownMenuLabel>

            {viewMode === "ACTIVE" ? (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/users/${userId}`)}
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-400" /> Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/users/${userId}/edit`)}
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" /> Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={callbacks.onResetPassword}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400" /> Reset mật
                  khẩu
                </DropdownMenuItem>
                {accountNonLocked ? (
                  <DropdownMenuItem
                    className="rounded-xl h-9 font-semibold text-xs gap-3 cursor-pointer focus:bg-amber-50 text-zinc-700"
                    onClick={callbacks.onLock}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" /> Khóa tài
                    khoản
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="rounded-xl h-9 font-semibold text-xs gap-3 cursor-pointer focus:bg-emerald-50 text-zinc-700"
                    onClick={callbacks.onUnlock}
                  >
                    <Unlock className="w-3.5 h-3.5 text-emerald-500" /> Mở khóa
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1 bg-zinc-50" />
                <DropdownMenuItem
                  className="rounded-xl h-9 font-semibold text-xs gap-3 cursor-pointer text-red-600 focus:bg-red-50"
                  onClick={callbacks.onDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vô hiệu hóa
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/users/${userId}`)}
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-400" /> Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-zinc-50" />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={callbacks.onRestore}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Khôi phục tài khoản
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
