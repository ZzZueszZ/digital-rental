"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useUserDetail } from "@/services/user";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { KycStatus } from "@/types/user";

const AVATAR_COLORS = [
  { bg: "from-red-500 to-rose-600", text: "text-white" },
  { bg: "from-blue-500 to-indigo-600", text: "text-white" },
  { bg: "from-emerald-500 to-teal-600", text: "text-white" },
  { bg: "from-violet-500 to-purple-600", text: "text-white" },
  { bg: "from-amber-500 to-orange-600", text: "text-white" },
  { bg: "from-pink-500 to-fuchsia-600", text: "text-white" },
];

function getAvatarColor(email: string) {
  const idx = email.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  ACTIVE: { label: "Hoạt động", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  PENDING: { label: "Chờ duyệt", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border border-amber-200" },
  SUSPENDED: { label: "Đình chỉ", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border border-red-200" },
  DISABLED: { label: "Vô hiệu", dot: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-500 border border-zinc-200" },
  DELETED: { label: "Đã xóa", dot: "bg-zinc-800", badge: "bg-zinc-900 text-white border-0" },
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id, 10);
  
  const { data: res, isLoading } = useUserDetail(userId);
  const user = res?.data;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
        <XCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-zinc-950">Không tìm thấy tài khoản</h2>
        <Button variant="outline" onClick={() => router.back()} className="mt-4 rounded-xl">Quay lại</Button>
      </div>
    );
  }

  const avatarColor = getAvatarColor(user.email);
  const statusConfig = STATUS_CONFIG[user.accountStatus] ?? STATUS_CONFIG["DISABLED"];

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="h-12 w-12 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-zinc-950">
              Hồ sơ người dùng
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              Chi tiết tài khoản và lịch sử hệ thống của ID #{user.id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Profile Identity */}
        <div className="md:col-span-1">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden relative group hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center text-center">
              <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center shadow-sm bg-gradient-to-br mb-4", avatarColor.bg)}>
                <span className={cn("text-4xl font-black", avatarColor.text)}>
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-zinc-950 truncate w-full mb-1" title={user.email}>{user.email}</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Người dùng nền tảng</p>
              
              <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                {user.roles.map((role: string) => {
                  const isSpecial = role === "SUPER_ADMIN" || role === "ADMIN";
                  return (
                    <span
                      key={role}
                      className={cn(
                        "inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.15em] border",
                        isSpecial ? "bg-red-50 text-red-600 border-red-200" : "bg-zinc-50 text-zinc-600 border-zinc-200"
                      )}
                    >
                      {role}
                    </span>
                  );
                })}
              </div>

              <div className="w-full space-y-4 pt-5 border-t border-zinc-100 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Email</p>
                    <p className="text-sm font-bold text-zinc-900 truncate">{user.email}</p>
                  </div>
                  {user.emailVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">SĐT</p>
                    <p className="text-sm font-bold text-zinc-900 truncate">{user.phone || "Trống"}</p>
                  </div>
                  {user.phone && (
                    user.phoneVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Account Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden relative group hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-950 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                Trạng thái bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 gap-y-6 gap-x-6">
                <div className="bg-zinc-50/50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Tình trạng tài khoản</p>
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full", statusConfig.badge)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="bg-zinc-50/50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Trạng thái khóa</p>
                  {user.accountNonLocked ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Unlock className="w-3.5 h-3.5" />
                      Không bị khóa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                      <Lock className="w-3.5 h-3.5" />
                      Đang bị khóa
                    </span>
                  )}
                </div>

                <div className="bg-zinc-50/50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Xác minh danh tính (KYC)</p>
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border", 
                    user.kycStatus === KycStatus.VERIFIED ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    user.kycStatus === KycStatus.PENDING ? "bg-amber-50 border-amber-200 text-amber-700" :
                    "bg-zinc-100 border-zinc-200 text-zinc-600"
                  )}>
                    {user.kycStatus === KycStatus.VERIFIED ? "Đã xác minh" : user.kycStatus === KycStatus.PENDING ? "Chờ duyệt" : "Chưa xác minh"}
                  </span>
                </div>

                <div className="bg-zinc-50/50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Cấp độ tin cậy</p>
                  <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-950 text-white tracking-widest uppercase">
                    {user.trustLevel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden relative group hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-950 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-400" />
                Lịch sử hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-950 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ngày gia nhập</p>
                    <p className="text-sm font-black tracking-tight text-zinc-950 tabular-nums">
                      {new Date(user.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-950 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Cập nhật cuối</p>
                    <p className="text-sm font-black tracking-tight text-zinc-950 tabular-nums">
                      {new Date(user.updatedAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
