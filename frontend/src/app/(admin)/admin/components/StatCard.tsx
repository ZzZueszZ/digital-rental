"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ElementType;
  accent: string;
}

export function StatCard({
  title,
  value,
  trend = 0,
  icon: Icon,
  accent,
}: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <div className="admin-card group relative flex min-h-[132px] flex-col justify-between overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-zinc-500">{title}</p>
          <p className="text-[24px] font-semibold leading-none tracking-tight text-zinc-950">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700",
            accent.replace("bg-", "text-"),
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium",
            isPositive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700",
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {isPositive ? "+" : ""}
          {trend}%
        </span>
        <span className="text-[12px] font-medium text-zinc-400">
          tháng này
        </span>
      </div>
    </div>
  );
}
