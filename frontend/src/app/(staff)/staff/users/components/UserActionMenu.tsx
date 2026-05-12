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
              Tác vụ tra cứu
            </DropdownMenuLabel>
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push(`/staff/users/${userId}`)}
            >
              <Eye className="w-3.5 h-3.5 text-zinc-400" /> Xem chi tiết
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
