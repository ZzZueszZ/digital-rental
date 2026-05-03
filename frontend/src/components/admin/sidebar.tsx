"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/Guards";
import { Role } from "@/constants/enum/role";
import { Button } from "@/components/ui/button";

export function AdminSidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
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
      href: "/admin/categories",
      icon: Layers,
      label: "Danh mục",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/address",
      icon: MapPin,
      label: "Địa chỉ nhận hàng",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/products",
      icon: Package,
      label: "Sản phẩm",
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
      icon: CreditCard,
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
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-white text-zinc-950 transition-all duration-500 overflow-hidden flex flex-col border-r border-zinc-100 shadow-[20px_0_60px_rgba(0,0,0,0.03)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center px-6 mb-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:rotate-12 transition-transform duration-500">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <span className="text-lg font-black tracking-tighter text-zinc-950">
              LENSHUB{" "}
              <span className="text-red-600 italic font-medium">PRO</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5 p-6 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-6">
            <p className="text-xs font-semibold text-zinc-400">Hệ thống</p>
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
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 relative overflow-hidden",
                  isActive
                    ? "bg-zinc-950 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive
                      ? "scale-110 text-red-500"
                      : "group-hover:scale-110 group-hover:text-red-600",
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-red-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
