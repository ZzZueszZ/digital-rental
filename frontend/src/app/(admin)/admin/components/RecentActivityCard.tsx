"use client";

import { useRouter } from "next/navigation";
import {
  History,
  User,
  Settings,
  Package,
  Trash2,
  RotateCcw,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  ArrowRight,
  LucideIcon,
  FileText,
  Mail,
  FileCheck,
  CreditCard,
  PackageCheck,
  XCircle,
  FilePlus,
  Coins,
  Truck,
  ArrowLeftRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/services/audit";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const ACTION_ICONS: Record<string, LucideIcon> = {
  CREATE_USER: User,
  UPDATE_USER: Settings,
  LOCK_USER: Lock,
  UNLOCK_USER: Unlock,
  BATCH_SOFT_DELETE: Trash2,
  BATCH_RESTORE: RotateCcw,
  RESET_PASSWORD: Key,
  UPDATE_PASSWORD: Key,
  DELETE_AVATAR: Trash2,
  UPLOAD_AVATAR: RefreshCw,
  CREATE_ORDER: FilePlus,
  SEND_OTP: Mail,
  SIGN_CONTRACT: FileCheck,
  PAY_DEPOSIT: CreditCard,
  PREPARE_RENTAL: PackageCheck,
  REJECT_RENTAL: XCircle,
  CREATE_HANDOVER_REPORT: FileText,
  COLLECT_DEPOSIT: Coins,
  HANDOVER_DEVICES: Truck,
  CREATE_RETURN_REPORT: ArrowLeftRight,
  COMPLETE_RENTAL: CheckCircle2,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE_USER: "text-emerald-600 bg-emerald-50",
  UPDATE_USER: "text-blue-600 bg-blue-50",
  LOCK_USER: "text-amber-600 bg-amber-50",
  UNLOCK_USER: "text-emerald-600 bg-emerald-50",
  BATCH_SOFT_DELETE: "text-red-600 bg-red-50",
  BATCH_RESTORE: "text-indigo-600 bg-indigo-50",
  RESET_PASSWORD: "text-amber-600 bg-amber-50",
  CREATE_ORDER: "text-indigo-600 bg-indigo-50",
  SEND_OTP: "text-amber-600 bg-amber-50",
  SIGN_CONTRACT: "text-emerald-600 bg-emerald-50",
  PAY_DEPOSIT: "text-blue-600 bg-blue-50",
  PREPARE_RENTAL: "text-teal-600 bg-teal-50",
  REJECT_RENTAL: "text-red-600 bg-red-50",
  CREATE_HANDOVER_REPORT: "text-sky-600 bg-sky-50",
  COLLECT_DEPOSIT: "text-orange-600 bg-orange-50",
  HANDOVER_DEVICES: "text-emerald-600 bg-emerald-50",
  CREATE_RETURN_REPORT: "text-purple-600 bg-purple-50",
  COMPLETE_RENTAL: "text-emerald-600 bg-emerald-50",
};

export function RecentActivityCard() {
  const router = useRouter();
  const { data, isLoading } = useAuditLogs(0, 8); // Increased to 8 for compact display
  const logs = data?.data || [];

  return (
    <div className="admin-card flex flex-col h-full !p-0">
      <div className="p-4 border-b border-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <span className="text-[15px] font-semibold text-zinc-900 tracking-tight">
            Hoạt động hệ thống
          </span>
        </div>
        <Button
          onClick={() => router.push("/admin/audit-logs")}
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-[11px] font-bold text-zinc-400 hover:text-zinc-950 transition-all gap-1"
        >
          Tất cả <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-zinc-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 flex items-start gap-3 animate-pulse"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-50 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-zinc-50 rounded w-1/3" />
                  <div className="h-2.5 bg-zinc-50 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-[13px] text-zinc-400 font-medium italic">
              Chưa có dữ liệu hoạt động
            </div>
          ) : (
            logs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || History;
              const colorClass =
                ACTION_COLORS[log.action] || "text-zinc-400 bg-zinc-50";

              return (
                <div
                  key={log.id}
                  className="p-3.5 flex items-start gap-3 hover:bg-zinc-50/50 transition-colors group"
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-transparent group-hover:border-zinc-200 transition-all",
                      colorClass,
                    )}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold text-zinc-900 truncate">
                        {log.actorEmail}
                      </p>
                      <span className="text-[10px] font-bold text-zinc-300 whitespace-nowrap uppercase">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                    <p className="text-[12px] text-zinc-500 line-clamp-1 mt-0.5 font-medium leading-snug">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500 border border-zinc-200/50 tracking-wider">
                        {log.action.split("_").pop()}
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 tracking-wider">
                        {log.targetType} #{log.targetId}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
