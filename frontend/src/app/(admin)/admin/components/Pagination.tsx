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
  if (totalPages <= 1) return null;

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
    <div className="px-6 py-5 bg-zinc-50/50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        Hiển thị <span className="text-zinc-950">{startIndex}-{endIndex}</span> / <span className="text-zinc-950">{totalElements}</span> mục
      </p>
      
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="w-9 h-9 rounded-xl border-zinc-200 bg-white shadow-sm disabled:opacity-30 transition-all active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, i) => (
            p === "..." ? (
              <span key={`dots-${i}`} className="w-9 text-center text-zinc-400 font-bold">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-9 h-9 rounded-xl text-xs font-black transition-all active:scale-90",
                  page === p 
                    ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200" 
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                )}
              >
                {p + 1}
              </button>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="w-9 h-9 rounded-xl border-zinc-200 bg-white shadow-sm disabled:opacity-30 transition-all active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
