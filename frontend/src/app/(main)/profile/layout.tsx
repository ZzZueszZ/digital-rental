"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { useMyProfile } from "@/services/profile";
import { useMyAddresses } from "@/services/address";
import { useMyCart } from "@/services/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Camera,
  LogOut,
  Settings,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  Menu,
  X,
  Search,
  Bell,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth";
import { cn } from "@/lib/utils";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: profileRes, isLoading: isFetchingProfile } = useMyProfile();
  const { data: addressesRes } = useMyAddresses();
  const { data: cartRes } = useMyCart();

  const cartItemsCount = cartRes?.data?.length || 0;

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Đã đăng xuất");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const pageInfo = useMemo(() => {
    if (pathname.includes("/profile/overview"))
      return { title: "Tổng quan", subtitle: "Trung tâm điều khiển của bạn" };
    if (pathname.includes("/profile/info"))
      return { title: "Hồ sơ cá nhân", subtitle: "Quản lý thông tin định danh" };
    if (pathname.includes("/profile/ekyc"))
      return { title: "Xác thực eKYC", subtitle: "Bảo mật định danh & Điều kiện thuê máy" };
    if (pathname.includes("/profile/address"))
      return { title: "Sổ địa chỉ", subtitle: "Các điểm giao nhận hàng" };
    if (pathname.includes("/profile/orders"))
      return { title: "Đơn hàng", subtitle: "Lịch sử giao dịch & Thuê máy" };
    if (pathname.includes("/profile/cart"))
      return { title: "Giỏ hàng", subtitle: "Danh sách sản phẩm chờ thanh toán" };
    return { title: "LensHub", subtitle: "Tài khoản khách hàng" };
  }, [pathname]);

  if (isFetchingProfile) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-[11px] font-bold text-zinc-400">
            Đang đồng bộ dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 flex selection:bg-red-100 overflow-x-hidden">
      {/* Sidebar Backdrop - Mobile only */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 shrink-0 border-r border-zinc-100 bg-white flex flex-col fixed h-full z-50 transition-all duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-50">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100 group-hover:rotate-12 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-zinc-950 group-hover:text-red-600 transition-colors">
              LENSHUB<span className="text-red-600">.</span>
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex-1 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="text-sm font-bold text-zinc-400 mb-5 ml-1">
              Menu chính
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Tổng quan"
                active={pathname.includes("/profile/overview")}
                href="/profile/overview"
              />
              <SidebarItem
                icon={<User className="w-4 h-4" />}
                label="Hồ sơ cá nhân"
                active={pathname.includes("/profile/info")}
                href="/profile/info"
              />
              <SidebarItem
                icon={<ShieldCheck className="w-4 h-4" />}
                label="Định danh eKYC"
                active={pathname.includes("/profile/ekyc")}
                href="/profile/ekyc"
              />
              <SidebarItem
                icon={<MapPin className="w-4 h-4" />}
                label="Sổ địa chỉ"
                active={pathname.includes("/profile/address")}
                href="/profile/address"
              />
              <SidebarItem
                icon={<ShoppingBag className="w-4 h-4" />}
                label="Đơn hàng"
                active={pathname.includes("/profile/orders")}
                href="/profile/orders"
              />
              <SidebarItem
                icon={<ShoppingCart className="w-4 h-4" />}
                label="Giỏ hàng"
                active={pathname.includes("/profile/cart")}
                href="/profile/cart"
                badge={cartItemsCount > 0 ? cartItemsCount : undefined}
              />
            </nav>
          </div>

          <div>
            <p className="text-[11px] font-bold text-zinc-400 mb-4 ml-1">
              Hỗ trợ
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={<Settings className="w-4 h-4" />}
                label="Cài đặt"
                active={false}
                href="#"
                onClick={() => toast.info("Tính năng đang phát triển")}
              />
              <SidebarItem
                icon={<ShieldCheck className="w-4 h-4" />}
                label="Bảo mật"
                active={false}
                href="#"
                onClick={() => toast.info("Tính năng đang phát triển")}
              />
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-50 bg-zinc-50/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-100 bg-white/95 px-4 sm:px-6 lg:px-8 lg:pl-72 backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center gap-4 lg:gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-zinc-600" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 leading-tight">
                {pageInfo.title}
              </h1>
              <div className="w-px h-4 bg-zinc-200" />
              <span className="text-xs font-semibold text-zinc-400 tracking-tight">
                {pageInfo.subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex relative w-64 mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Tìm kiếm nhanh..."
                className="pl-9 h-11 text-xs rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl hover:bg-zinc-100 relative group hidden md:flex"
            >
              <Bell className="h-5 w-5 text-zinc-500 group-hover:text-red-600 transition-colors" />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white" />
            </Button>

            <div className="h-8 w-px bg-zinc-100 mx-1 hidden sm:block" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  href,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group h-12",
        active
          ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200"
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
      )}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={cn(
            "transition-colors",
            active ? "text-red-500" : "text-zinc-400 group-hover:text-red-600",
          )}
        >
          {icon}
        </span>
        <span className="text-[15px] font-medium tracking-tight">{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={cn(
            "w-4.5 h-4.5 rounded-xl flex items-center justify-center font-bold text-[10px]",
            active ? "bg-white text-red-600" : "bg-red-50 text-red-600",
          )}
        >
          {badge}
        </span>
      )}
      {active && <ChevronRight className="w-3 h-3 text-white/60" />}
    </Link>
  );
}
