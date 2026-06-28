"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
}: PaginationProps) {
  if (totalElements === 0) return null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push("...");

      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 3) pages.push("...");
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
    }
    return pages;
  };

  const startIndex = page * size + 1;
  const endIndex = Math.min((page + 1) * size, totalElements);

  return (
    <div className="px-5 py-4 bg-zinc-50/50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs font-semibold text-zinc-500">
        Hiển thị{" "}
        <span className="text-zinc-950 font-semibold">
          {startIndex}-{endIndex}
        </span>{" "}
        / <span className="text-zinc-950 font-semibold">{totalElements}</span> mục
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="w-8 h-8 rounded-xl border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:border-red-200 hover:!bg-white hover:!text-red-600 disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:!text-zinc-600 active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="w-8 text-center text-zinc-400 font-semibold text-xs"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={cn(
                    "w-8 h-8 rounded-xl border text-xs font-semibold transition-all active:scale-95",
                    page === p
                      ? "border-zinc-950 !bg-zinc-950 !text-white hover:!bg-zinc-900 hover:!text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-red-200 hover:!bg-white hover:!text-red-600",
                  )}
                >
                  {p + 1}
                </button>
              ),
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="w-8 h-8 rounded-xl border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:border-red-200 hover:!bg-white hover:!text-red-600 disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:!text-zinc-600 active:scale-95"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
