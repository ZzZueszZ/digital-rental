"use client";

import { useMyProfile } from "@/services/profile";
import { useMyAddresses } from "@/services/address";
import { useMyCart } from "@/services/cart";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ShoppingBag,
  ShoppingCart,
  User,
  Star,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  const router = useRouter();
  const { data: profileRes } = useMyProfile();
  const { data: addressesRes } = useMyAddresses();
  const { data: cartRes } = useMyCart();

  const profile = profileRes?.data;
  const addresses = addressesRes?.data || [];
  const cartItemsCount = cartRes?.data?.length || 0;

  const onNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-zinc-100 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-[36px] font-bold text-zinc-950 tracking-tight mb-4 leading-[1.2]">
              Mừng bạn trở lại, <br className="hidden md:block" />{" "}
              {profile?.fullName || "Người dùng"}!
            </h1>
            <p className="text-base text-zinc-500 font-medium max-w-md leading-relaxed">
              Chào mừng bạn quay trở lại. Hãy quản lý các thiết bị nhiếp ảnh và
              đơn hàng của bạn ngay tại đây.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => onNavigate("/profile/info")}
              className="h-10 px-5 rounded-xl bg-zinc-950 text-white font-semibold text-[14px] hover:bg-red-600 transition-all border-none shadow-lg shadow-zinc-200 hover:shadow-red-200"
            >
              Xem hồ sơ
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("/profile/orders")}
              className="h-10 px-5 rounded-xl border-zinc-200 bg-white text-zinc-950 font-semibold text-[14px] hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm"
            >
              Đơn hàng
            </Button>
          </div>
        </div>
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] -mr-32 -mt-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard
          icon={<MapPin className="w-6 h-6" />}
          label="Sổ địa chỉ"
          value={`${addresses.length} địa chỉ`}
          color="bg-blue-600"
          onClick={() => onNavigate("/profile/address")}
        />
        <OverviewCard
          icon={<ShoppingBag className="w-6 h-6" />}
          label="Đơn hàng"
          value="0 đơn hàng"
          color="bg-amber-500"
          onClick={() => onNavigate("/profile/orders")}
        />
        <OverviewCard
          icon={<ShoppingCart className="w-6 h-6" />}
          label="Giỏ hàng"
          value={`${cartItemsCount} sản phẩm`}
          color="bg-red-600"
          onClick={() => onNavigate("/profile/cart")}
        />
        <OverviewCard
          icon={<User className="w-6 h-6" />}
          label="Trust Level"
          value="Elite Member"
          color="bg-zinc-900"
          onClick={() => onNavigate("/profile/info")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[20px] font-semibold text-zinc-950 tracking-tight">
              Hoạt động gần đây
            </h3>
            <button
              onClick={() => onNavigate("/profile/orders")}
              className="text-sm font-semibold text-red-600 hover:text-zinc-950 transition-colors"
            >
              Xem toàn bộ nhật ký
            </button>
          </div>
          <div className="py-20 flex flex-col items-center justify-center text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
              <ShoppingBag className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-sm font-bold text-zinc-400">
              Chưa có hoạt động giao dịch nào được ghi nhận
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-xl p-8 text-zinc-950 shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:scale-[1.01] transition-all">
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center mb-8 border border-amber-100 shadow-sm">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-xl font-black mb-2 leading-tight text-zinc-950">
              Hội viên <br /> LensHub Pro
            </h3>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-8">
              Mở khóa tất cả các đặc quyền: Miễn phí vận chuyển, Bảo hiểm thiết
              bị và Ưu tiên đặt lịch thuê máy.
            </p>
            <Button className="w-full h-10 bg-zinc-950 text-white font-semibold text-sm rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-zinc-200">
              Nâng cấp ngay
            </Button>
          </div>
          {/* Subtle decorative background elements */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-zinc-50 rounded-full blur-3xl group-hover:bg-red-50 transition-all" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-white border border-zinc-100 rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all text-left flex flex-col justify-between h-44 active:scale-95"
    >
      <div
        className={`w-14 h-14 rounded-xl ${color} text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-medium text-zinc-400 mb-1">{label}</p>
        <p className="text-[22px] font-semibold text-zinc-950 tracking-tight">
          {value}
        </p>
      </div>
    </button>
  );
}
