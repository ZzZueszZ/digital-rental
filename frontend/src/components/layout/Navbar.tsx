"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Camera,
  ChevronRight,
  Headphones,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Routers from "@/constants/routers";
import { useAuthSession } from "@/components/auth/Guards";
import { Role } from "@/constants/enum/role";
import { useMyCart } from "@/services/cart";

const navigationItems = [
  { label: "Thiết bị", href: "/products", icon: Camera },
  { label: "Sản phẩm mới", href: "/#product-section", icon: Package },
  { label: "An toàn", href: "/trust", icon: ShieldCheck },
  { label: "Hỗ trợ", href: "/about#support-form", icon: Headphones },
  { label: "Về chúng tôi", href: "/about", icon: Info },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuthSession({
    redirectToLogin: false,
  });
  const isCustomer = user?.roles?.includes(Role.CUSTOMER) ?? false;
  const { data: cartResponse } = useMyCart({
    enabled: !isLoading && isAuthenticated && isCustomer,
  });

  const cartItemsCount =
    cartResponse?.data?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const cartBadgeText = cartItemsCount > 99 ? "99+" : String(cartItemsCount);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const getDashboardLink = () => {
    if (!user?.roles) return null;
    if (user.roles.includes(Role.SUPER_ADMIN)) return Routers.SUPER_ADMIN;
    if (user.roles.includes(Role.ADMIN)) return Routers.ADMIN;
    if (user.roles.includes(Role.STAFF)) return Routers.STAFF;
    return null;
  };

  const dashboardLink = getDashboardLink();

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-[1320px] items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white transition-colors group-hover:bg-red-600">
                <Camera className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-semibold tracking-tight text-zinc-950">
                Digital<span className="text-red-600">Rental</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3.5 py-2 text-sm font-normal text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="hidden h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 transition-colors focus-within:border-zinc-300 focus-within:bg-white lg:flex">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <input
                placeholder="Tìm thiết bị"
                className="w-36 border-none bg-transparent text-xs font-normal text-zinc-900 outline-none placeholder:text-zinc-400 xl:w-44"
              />
            </label>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-zinc-500 hover:bg-zinc-100 lg:hidden"
              aria-label="Tìm kiếm"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Link
              href="/profile/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-600 px-0.5 text-[9px] font-medium text-white">
                {cartBadgeText}
              </span>
            </Link>

            <div className="hidden lg:block">
              {isLoading ? (
                <div className="h-9 w-9 animate-pulse rounded-xl bg-zinc-100" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 outline-none transition-colors hover:bg-zinc-50 hover:text-zinc-950">
                    <User className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg"
                  >
                    <div className="px-2.5 py-2">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs font-normal text-zinc-400">
                        {user.roles?.[0] || "Khách hàng"}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-zinc-100" />

                    {dashboardLink && (
                      <DropdownMenuItem className="cursor-pointer rounded-lg">
                        <Link
                          href={dashboardLink}
                          className="flex w-full items-center gap-3"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Bảng điều khiển
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                      <Link
                        href="/profile"
                        className="flex w-full items-center gap-3"
                      >
                        <User className="h-4 w-4" />
                        Tài khoản
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                      <Link
                        href="/profile/settings"
                        className="flex w-full items-center gap-3"
                      >
                        <Settings className="h-4 w-4" />
                        Cài đặt
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-100" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={Routers.LOGIN}>
                  <Button className="h-9 rounded-xl bg-zinc-950 px-4 text-xs font-medium text-white shadow-none hover:bg-zinc-800">
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>

            <div className="lg:hidden">
              {!isLoading && isAuthenticated && user ? (
                <Link
                  href="/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500"
                  aria-label="Tài khoản"
                >
                  <User className="h-4 w-4" />
                </Link>
              ) : !isLoading ? (
                <Link
                  href={Routers.LOGIN}
                  className="flex h-9 items-center rounded-xl bg-zinc-950 px-3 text-xs font-medium text-white"
                >
                  Đăng nhập
                </Link>
              ) : null}
            </div>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 lg:hidden"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </nav>
      <div className="h-16 shrink-0" aria-hidden="true" />

      <div
        className={`fixed inset-0 z-40 bg-zinc-950/35 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[86%] max-w-sm border-l border-zinc-200 bg-white transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-zinc-950">
                Digital<span className="text-red-600">Rental</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100"
              aria-label="Đóng menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!isLoading && isAuthenticated && user && (
            <div className="border-b border-zinc-200 px-5 py-4">
              <p className="truncate text-sm font-medium text-zinc-900">
                {user.email}
              </p>
              <p className="mt-1 text-xs font-normal text-zinc-400">
                {user.roles?.[0] || "Khách hàng"}
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3">
            <p className="px-3 pb-2 pt-1 text-xs font-normal text-zinc-400">
              Điều hướng
            </p>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-normal text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
            >
              <Home className="h-4 w-4 text-zinc-400" />
              Trang chủ
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-300" />
            </Link>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-normal text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              >
                <item.icon className="h-4 w-4 text-zinc-400" />
                {item.label}
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-300" />
              </Link>
            ))}

            {!isLoading && isAuthenticated && user && (
              <div className="mt-4 border-t border-zinc-100 pt-4">
                <p className="px-3 pb-2 text-xs font-normal text-zinc-400">
                  Tài khoản
                </p>
                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-normal text-zinc-600 hover:bg-zinc-50"
                  >
                    <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                    Bảng điều khiển
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-normal text-zinc-600 hover:bg-zinc-50"
                >
                  <User className="h-4 w-4 text-zinc-400" />
                  Tài khoản
                </Link>
                <Link
                  href="/profile/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-normal text-zinc-600 hover:bg-zinc-50"
                >
                  <Settings className="h-4 w-4 text-zinc-400" />
                  Cài đặt
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 p-5">
            {!isLoading && isAuthenticated && user ? (
              <button
                onClick={handleLogout}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-100 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            ) : (
              <Link
                href={Routers.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-full items-center justify-center rounded-xl bg-zinc-950 text-sm font-medium text-white"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
