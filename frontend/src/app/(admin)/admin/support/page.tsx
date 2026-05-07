"use client";

import { useState } from "react";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Search, Filter } from "lucide-react";
import { SupportTicketList } from "./components/SupportTicketList";
import { useSupportTickets } from "@/services/support";
import { SupportStatus } from "@/types/support";
import { StatCard } from "../components/StatCard";
import { cn } from "@/lib/utils";

export default function AdminSupportPage() {
  const [viewMode, setViewMode] = useState<SupportStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data: totalData } = useSupportTickets({}, 0, 1);
  const { data: pendingData } = useSupportTickets({ status: SupportStatus.PENDING }, 0, 1);
  const { data: resolvedData } = useSupportTickets({ status: SupportStatus.RESOLVED }, 0, 1);

  const totalCount = totalData?.pagination?.totalElements || 0;
  const pendingCount = pendingData?.pagination?.totalElements || 0;
  const resolvedCount = resolvedData?.pagination?.totalElements || 0;

  return (
    <div className="flex-1 space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Tổng yêu cầu"
          value={totalCount}
          trend={0}
          icon={MessageSquare}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Chờ xử lý"
          value={pendingCount}
          trend={0}
          icon={Clock}
          accent="bg-amber-500"
        />
        <StatCard
          title="Đã giải quyết"
          value={resolvedCount}
          trend={0}
          icon={CheckCircle2}
          accent="bg-emerald-500"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="px-5 py-4 sm:py-5 border-b border-zinc-50">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
            {/* Left: Title + Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-100/20">
                    <MessageSquare className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-[30px] font-semibold text-zinc-950 tracking-tight leading-tight">
                    Hỗ trợ khách hàng
                  </h2>
                </div>
                <p className="text-[14px] text-zinc-500 font-medium ml-12">
                  Quản lý và phản hồi các yêu cầu từ Studio Visuals
                </p>
              </div>

              {/* Tab Toggle - Styled like Products Page */}
              <div className="flex items-center gap-1 bg-zinc-50/50 border border-zinc-100 p-1 rounded-lg w-fit">
                {(["ALL", SupportStatus.PENDING, SupportStatus.RESOLVED] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setViewMode(mode); setPage(0); }}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-[14px] font-medium transition-all duration-150 whitespace-nowrap",
                        viewMode === mode
                          ? "bg-zinc-950 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50"
                      )}
                    >
                      {mode === "ALL" ? "Tất cả" : mode === SupportStatus.PENDING ? "Chờ xử lý" : "Đã xong"}
                    </button>
                ))}
              </div>
            </div>

            {/* Right: Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 xl:w-80 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, điện thoại..."
                  className="w-full pl-10 h-10 rounded-xl border border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Support List Content */}
        <SupportTicketList 
          status={viewMode === "ALL" ? undefined : viewMode}
          keyword={search}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
