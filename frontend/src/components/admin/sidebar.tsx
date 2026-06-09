"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Camera,
  CreditCard,
  Key,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/Guards";
import { Role } from "@/constants/enum/role";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
};

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: Role[];
};

const sharedAdminNav: NavItem[] = [
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
    href: "/admin/ekyc",
    icon: ShieldAlert,
    label: "Duyệt eKYC",
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
    label: "Đơn mua",
    roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
  },
  {
    href: "/admin/rentals",
    icon: Calendar,
    label: "Đơn thuê",
    roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF],
  },
  {
    href: "/admin/vouchers",
    icon: CreditCard,
    label: "Voucher",
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

const staffNav: NavItem[] = sharedAdminNav
  .filter((item) => item.href !== "/admin/settings")
  .map((item) => ({
    ...item,
    href: item.href.replace("/admin", "/staff"),
    roles: [Role.STAFF],
  }));

const superAdminNav: NavItem[] = [
  {
    href: "/super-admin",
    icon: LayoutDashboard,
    label: "Tổng quan",
    roles: [Role.SUPER_ADMIN],
  },
  {
    href: "/super-admin/roles",
    icon: ShieldAlert,
    label: "Vai trò",
    roles: [Role.SUPER_ADMIN],
  },
  {
    href: "/super-admin/permissions",
    icon: Key,
    label: "Quyền hạn",
    roles: [Role.SUPER_ADMIN],
  },
  ...sharedAdminNav.slice(1).map((item) => ({
    ...item,
    href: item.href.replace("/admin", "/super-admin"),
    roles: [Role.SUPER_ADMIN],
  })),
];

function DashboardSidebar({
  isOpen,
  setIsOpen,
  navItems,
  rootHref,
  eyebrow,
  tone = "red",
}: SidebarProps & {
  navItems: NavItem[];
  rootHref: string;
  eyebrow: string;
  tone?: "red" | "zinc";
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthSession();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/10 backdrop-blur-sm transition-all duration-200 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-zinc-200/80 bg-white text-zinc-950 transition-all duration-300",
          "w-[var(--dash-sidebar-w)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="mb-2 flex h-[var(--dash-navbar-h)] items-center border-b border-zinc-100 px-5">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-all duration-200"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:-rotate-3",
                tone === "red" ? "bg-red-600" : "bg-zinc-950",
              )}
            >
              <Camera className="h-4 w-4 text-white" />
            </div>
            <span className="text-[16px] font-semibold tracking-tight text-zinc-950 transition-colors group-hover:text-red-600">
              Digital<span className="text-red-600">Rental</span>
            </span>
          </Link>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-4">
          <div className="mb-4 ml-1">
            <p className="text-[13px] font-medium text-zinc-400">{eyebrow}</p>
          </div>
          {navItems.map((item) => {
            const canAccess = user?.roles?.some((role) =>
              item.roles.includes(role as Role),
            );
            if (!canAccess) return null;

            const isActive =
              pathname === item.href ||
              (item.href !== rootHref && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-[14px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isActive
                      ? "text-white"
                      : "text-zinc-400 group-hover:text-red-600",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-100 bg-zinc-50/50 p-5">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-zinc-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function AdminSidebar(props: SidebarProps) {
  return (
    <DashboardSidebar
      {...props}
      navItems={sharedAdminNav}
      rootHref="/admin"
      eyebrow="Menu chính"
    />
  );
}

export function StaffSidebar(props: SidebarProps) {
  return (
    <DashboardSidebar
      {...props}
      navItems={staffNav}
      rootHref="/staff"
      eyebrow="Menu hỗ trợ"
      tone="zinc"
    />
  );
}

export function SuperAdminSidebar(props: SidebarProps) {
  return (
    <DashboardSidebar
      {...props}
      navItems={superAdminNav}
      rootHref="/super-admin"
      eyebrow="Super admin"
    />
  );
}
