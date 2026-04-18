"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/Guards";
import { Role } from "@/constants/enum/role";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthSession();

  const navItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: "Tổng quan",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Người dùng",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/products",
      icon: Package,
      label: "Sản phẩm / Dịch vụ",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/orders",
      icon: ShoppingCart,
      label: "Đơn hàng",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/vouchers",
      icon: Package,
      label: "Mã giảm giá (Vouchers)",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Cài đặt hệ thống",
      roles: [Role.ADMIN, Role.SUPER_ADMIN],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-zinc-950 text-white transition-all overflow-hidden hidden lg:flex flex-col border-r border-zinc-800">
      <div className="flex h-20 items-center px-6 mb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            LENSHUB <span className="text-red-600">PRO</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-4">
          <p className="text-xs font-semibold text-zinc-500">Menu quản trị</p>
        </div>
        {navItems.map((item) => {
          const canAccess = user?.roles?.some((r) =>
            item.roles.includes(r as Role),
          );
          if (!canAccess) return null;

          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-red-600 text-white shadow-[0_8px_32px_rgba(220,38,38,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110",
                )}
              />
              {item.label}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 m-4 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-600/20 text-red-600 font-bold shadow-inner">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-sm overflow-hidden min-w-0">
            <span className="truncate font-semibold text-white tracking-tight">
              {user?.email?.split("@")[0]}
            </span>
            <span className="text-xs text-zinc-500 truncate font-medium">
              {user?.roles?.[0] || "Thành viên"}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all group px-3"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-semibold text-sm">Đăng xuất</span>
        </Button>
      </div>
    </aside>
  );
}
