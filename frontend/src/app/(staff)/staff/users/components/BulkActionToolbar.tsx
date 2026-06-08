"use client";

import { CheckSquare, Trash2, RotateCcw } from "lucide-react";

interface BulkActionToolbarProps {
  count: number;
  viewMode: "ACTIVE" | "DELETED";
  onDeleteMany: () => void;
  onRestoreMany: () => void;
  onClearSelection: () => void;
}

export function BulkActionToolbar({
  count,
  viewMode,
  onDeleteMany,
  onRestoreMany,
  onClearSelection,
}: BulkActionToolbarProps) {
  if (count === 0) return null;

  return (
    <div className="px-6 py-3 bg-zinc-950 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onClearSelection}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-white">
          Đã chọn <span className="text-red-400">{count}</span> tài khoản
        </span>
      </div>

      <div className="flex items-center gap-2">
        {viewMode === "ACTIVE" ? (
          <button
            onClick={onDeleteMany}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vô hiệu hóa ({count})
          </button>
        ) : (
          <button
            onClick={onRestoreMany}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục ({count})
          </button>
        )}
        <button
          onClick={onClearSelection}
          className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
        >
          Bỏ chọn
        </button>
      </div>
    </div>
  );
}
