"use client";

import { useState } from "react";
import { CheckCircle2, Clock, MessageSquare, Search } from "lucide-react";
import { SupportTicketList } from "./components/SupportTicketList";
import { useSupportTickets } from "@/services/support";
import { SupportStatus } from "@/types/support";
import { StatCard } from "../components/StatCard";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "ALL" as const, label: "Tất cả" },
  { value: SupportStatus.PENDING, label: "Chờ xử lý" },
  { value: SupportStatus.RESOLVED, label: "Đã giải quyết" },
];

export default function AdminSupportPage() {
  const [viewMode, setViewMode] = useState<SupportStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data: totalData } = useSupportTickets({}, 0, 1);
  const { data: pendingData } = useSupportTickets(
    { status: SupportStatus.PENDING },
    0,
    1,
  );
  const { data: resolvedData } = useSupportTickets(
    { status: SupportStatus.RESOLVED },
    0,
    1,
  );

  const totalCount = totalData?.pagination?.totalElements || 0;
  const pendingCount = pendingData?.pagination?.totalElements || 0;
  const resolvedCount = resolvedData?.pagination?.totalElements || 0;

  return (
    <div className="flex-1 space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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

      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                  <MessageSquare className="h-4.5 w-4.5" strokeWidth={2} />
                </div>
                <h2 className="truncate text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                  Hỗ trợ khách hàng
                </h2>
              </div>
              <p className="ml-12 text-sm font-medium text-zinc-500">
                Theo dõi và phản hồi các yêu cầu từ khách hàng.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[560px] lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-red-500/30 focus:ring-4 focus:ring-red-600/5"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-zinc-100 bg-zinc-50/60 p-1 sm:w-fit">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setViewMode(filter.value);
                      setPage(0);
                    }}
                    className={cn(
                      "h-9 flex-1 rounded-xl px-4 text-sm font-medium transition-all duration-150 whitespace-nowrap sm:flex-none",
                      viewMode === filter.value
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-500 hover:bg-white hover:text-zinc-950",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

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
