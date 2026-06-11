"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useMyProfile } from "@/services/profile";
import { useMyCart } from "@/services/cart";
import { authService } from "@/services/auth";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Tổng quan",
    href: "/profile/overview",
    icon: LayoutDashboard,
  },
  { label: "Hồ sơ cá nhân", href: "/profile/info", icon: User },
  { label: "Định danh eKYC", href: "/profile/ekyc", icon: ShieldCheck },
  { label: "Sổ địa chỉ", href: "/profile/address", icon: MapPin },
  { label: "Đơn hàng", href: "/profile/orders", icon: ShoppingBag },
  { label: "Giỏ hàng", href: "/profile/cart", icon: ShoppingCart },
  { label: "Cài đặt", href: "/profile/settings", icon: Settings },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: profileRes, isLoading: isFetchingProfile } = useMyProfile();
  const { data: cartRes } = useMyCart();

  const profile = profileRes?.data;
  const cartItemsCount = cartRes?.data?.length || 0;
  const isProfileRoot = pathname === "/profile" || pathname === "/profile/";

  const pageInfo = useMemo(() => {
    if (isProfileRoot || pathname.includes("/profile/overview"))
      return {
        title: "Tổng quan",
        subtitle: "Thông tin và hoạt động tài khoản",
      };
    if (pathname.includes("/profile/info"))
      return {
        title: "Hồ sơ cá nhân",
        subtitle: "Cập nhật thông tin của bạn",
      };
    if (pathname.includes("/profile/ekyc"))
      return {
        title: "Định danh eKYC",
        subtitle: "Điều kiện xác minh để thuê thiết bị",
      };
    if (pathname.includes("/profile/address"))
      return { title: "Sổ địa chỉ", subtitle: "Quản lý địa chỉ giao nhận" };
    if (pathname.includes("/profile/orders"))
      return { title: "Đơn hàng", subtitle: "Theo dõi giao dịch mua và thuê" };
    if (pathname.includes("/profile/cart"))
      return { title: "Giỏ hàng", subtitle: "Sản phẩm đang chờ thanh toán" };
    if (pathname.includes("/profile/settings"))
      return {
        title: "Cài đặt",
        subtitle: "Bảo mật và thông tin đăng nhập",
      };
    return { title: "Tài khoản", subtitle: "Quản lý thông tin cá nhân" };
  }, [isProfileRoot, pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Đã đăng xuất");
      router.push("/auth/login");
    } catch {
      toast.error("Không thể đăng xuất");
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          <p className="text-xs font-normal text-zinc-500">
            Đang tải thông tin tài khoản...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 selection:bg-red-100">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/35 backdrop-blur-sm transition-opacity lg:hidden",
          isSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-950">
              Digital<span className="text-red-600">Rental</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-medium text-red-600">
              {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">
                {profile?.fullName || "Người dùng"}
              </p>
              <p className="mt-0.5 truncate text-xs font-normal text-zinc-400">
                {profile?.email}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-normal text-zinc-400">
            Quản lý tài khoản
          </p>
          {navigationItems.map((item) => {
            const active =
              (item.href === "/profile/overview" && isProfileRoot) ||
              pathname.includes(item.href);
            const badge =
              item.href === "/profile/cart" && cartItemsCount > 0
                ? cartItemsCount
                : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-normal transition-colors",
                  active
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-red-600" : "text-zinc-400",
                  )}
                />
                <span>{item.label}</span>
                {badge !== undefined && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-lg bg-red-50 px-1.5 text-[10px] font-medium text-red-600">
                    {badge}
                  </span>
                )}
                {active && !badge && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-normal text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950">
                {pageInfo.title}
              </h1>
              <p className="hidden truncate text-xs font-normal text-zinc-400 sm:block">
                {pageInfo.subtitle}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-normal text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
          >
            Về trang chủ
          </Link>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
