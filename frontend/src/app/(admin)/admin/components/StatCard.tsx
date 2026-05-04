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

export function StatCard({ title, value, trend, icon: Icon, accent }: StatCardProps) {
  const isPositive = trend >= 0;
  return (
    <div className="admin-card group relative overflow-hidden flex flex-col justify-between">
      {/* Subtle accent highlight on top */}
      <div className={cn("absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300", accent)} />
      
      <div>
        <div className="flex items-center gap-2 mb-2">
           <div className={cn(
             "w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-zinc-50 border border-zinc-100 group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950",
             accent.replace("bg-", "text-")
           )}>
             <Icon className="w-4 h-4" />
           </div>
           <p className="text-[13px] font-medium text-zinc-500 tracking-tight">{title}</p>
        </div>

        <p className="text-[24px] font-bold tracking-tight text-zinc-950 mb-2 leading-none">
          {value}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className={cn(
          "flex items-center gap-0.5 text-[12px] font-semibold px-2 py-0.5 rounded-lg", 
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isPositive ? "+" : ""}{trend}%
        </span>
        <span className="text-[12px] text-zinc-400 font-medium tracking-tight">Tháng này</span>
      </div>
    </div>
  );
}
