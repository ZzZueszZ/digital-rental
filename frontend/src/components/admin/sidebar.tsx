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
  Camera,
  MessageCircle,
  MessageSquare,
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
      label: "Địa chỉ",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/products",
      icon: Package,
      label: "Kho hàng",
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
      label: "Vouchers",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/reviews",
      icon: MessageCircle,
      label: "Đánh giá",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/support",
      icon: MessageSquare,
      label: "Hỗ trợ",
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Cài đặt",
      roles: [Role.ADMIN, Role.SUPER_ADMIN],
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/10 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-white text-zinc-950 transition-all duration-300 overflow-hidden flex flex-col border-r border-zinc-100 shadow-[20px_0_60px_rgba(0,0,0,0.01)]",
          "w-[var(--dash-sidebar-w)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-[var(--dash-navbar-h)] items-center px-6 border-b border-zinc-50 mb-2">
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
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="mb-5 ml-1">
            <p className="text-sm font-bold text-zinc-400">Menu chính</p>
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
                  "group flex items-center gap-3.5 rounded-xl px-4 h-12 text-[15px] font-medium transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isActive
                      ? "text-red-500"
                      : "text-zinc-400 group-hover:text-red-600",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-50 bg-zinc-50/30">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function StaffSidebar({
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
      href: "/staff",
      icon: LayoutDashboard,
      label: "Tổng quan",
      roles: [Role.STAFF],
    },
    {
      href: "/staff/users",
      icon: Users,
      label: "Người dùng",
      roles: [Role.STAFF],
    },
    {
      href: "/staff/categories",
      icon: Layers,
      label: "Danh mục",
      roles: [Role.STAFF],
    },
    {
      href: "/staff/address",
      icon: MapPin,
      label: "Địa chỉ",
      roles: [Role.STAFF],
    },
    {
      href: "/staff/products",
      icon: Package,
      label: "Kho hàng",
      roles: [Role.STAFF],
    },
    {
      href: "/staff/orders",
      icon: ShoppingCart,
      label: "Đơn hàng",
      roles: [Role.STAFF],
    },
    {
      href: "/staff/vouchers",
      icon: CreditCard,
      label: "Vouchers",
      roles: [Role.STAFF],
    },
    {
      href: "/staff/reviews",
      icon: MessageCircle,
      label: "Đánh giá",
      roles: [Role.STAFF],
    },
    {
      href: "/staff/support",
      icon: MessageSquare,
      label: "Hỗ trợ",
      roles: [Role.STAFF],
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/10 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-white text-zinc-950 transition-all duration-300 overflow-hidden flex flex-col border-r border-zinc-100 shadow-[20px_0_60px_rgba(0,0,0,0.01)]",
          "w-[var(--dash-sidebar-w)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-[var(--dash-navbar-h)] items-center px-6 border-b border-zinc-50 mb-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-200 group-hover:rotate-12 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-zinc-950 transition-colors">
              LENSHUB<span className="text-zinc-500">.</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="mb-5 ml-1">
            <p className="text-sm font-bold text-zinc-400">Menu hỗ trợ</p>
          </div>
          {navItems.map((item) => {
            const canAccess = user?.roles?.some((r) =>
              item.roles.includes(r as Role),
            );
            if (!canAccess) return null;

            const isActive =
              pathname === item.href ||
              (item.href !== "/staff" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center gap-3.5 rounded-xl px-4 h-12 text-[15px] font-medium transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-zinc-400 group-hover:text-zinc-600",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-50 bg-zinc-50/30">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
