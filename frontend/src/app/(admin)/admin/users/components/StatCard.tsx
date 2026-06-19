"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ElementType;
  accent: string;
}

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  accent,
}: StatCardProps) {
  const isPositive = trend >= 0;
  return (
    <div
      className={cn(
        "relative bg-white rounded-xl border border-zinc-200 p-5 overflow-hidden",
        "shadow-sm hover:shadow-2xl",
        "transition-all duration-500 hover:-translate-y-1 group",
      )}
    >
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-1 transition-all duration-500",
          accent,
          "opacity-0 group-hover:opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-[0.06] blur-2xl transition-all duration-500 group-hover:opacity-[0.12] group-hover:scale-125",
          accent,
        )}
      />

      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-semibold tracking-wide text-zinc-400">
          {title}
        </p>
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 bg-zinc-50 group-hover:scale-110",
            accent.replace("bg-", "text-"),
          )}
        >
          <Icon className="w-4.5 h-4.5" strokeWidth={2.5} />
        </div>
      </div>

      <p className="text-3xl font-semibold tracking-tight text-zinc-950 mb-2">
        {value}
      </p>

      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-xl",
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600",
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? "+" : ""}
          {trend}%
        </span>
        <span className="text-[10px] text-zinc-400 font-medium">
          so với kỳ trước
        </span>
      </div>
    </div>
  );
}
