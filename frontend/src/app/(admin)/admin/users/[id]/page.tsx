"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useUserDetail } from "@/services/user";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { UserForm } from "../components/UserForm";

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
          <p className="text-zinc-500 font-semibold text-sm">Đang tải dữ liệu...</p>
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

  return <UserForm user={user} userId={userId} mode="view" />;
}
