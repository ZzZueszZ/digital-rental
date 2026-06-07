"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  Zap,
  Sparkles,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronRight,
  Home,
  Package,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
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

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuthSession({
    redirectToLogin: false,
  });

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-zinc-100/80 select-none transition-all duration-300 shadow-sm">
        <div className="container flex h-[72px] items-center justify-between px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-8 lg:gap-14">
            <Link
              href="/"
              className="group flex items-center gap-3.5 transition-all"
            >
              <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center shadow-dash-sm group-hover:bg-red-600 group-hover:scale-105 transition-all duration-500">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col select-none leading-none">
                <span className="text-[16px] lg:text-[18px] font-black tracking-tighter text-zinc-950">
                  Studio
                </span>
                <span className="text-[16px] lg:text-[18px] font-black tracking-tighter text-red-600">
                  Visuals
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-zinc-500 hover:!text-zinc-950 font-bold text-[15px] tracking-tight transition-all data-open:!text-red-600 data-open:!bg-transparent data-popup-open:!bg-transparent data-popup-open:!text-red-600 hover:!bg-transparent focus:!bg-transparent data-open:hover:!bg-transparent data-popup-open:hover:!bg-transparent data-active:!bg-transparent rounded-xl h-10 px-4 border-none shadow-none outline-none">
                      Thiết bị
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="p-0 border-none bg-transparent shadow-none">
                      <div className="p-8 w-[720px] bg-white border border-zinc-100 rounded-xl shadow-dash-lg flex gap-8">
                        <div className="flex-1 bg-zinc-50 p-6 rounded-xl border border-zinc-200">
                          <Zap className="w-8 h-8 text-red-600 mb-4" />
                          <h4 className="text-[20px] font-semibold text-zinc-900 tracking-tight mb-3">
                            Kho thiết bị
                          </h4>
                          <p className="text-zinc-500 text-[14px] leading-relaxed mb-4 font-normal">
                            Khám phá các dòng máy ảnh và ống kính chuyên nghiệp
                            nhất hiện nay.
                          </p>
                          <Button className="rounded-xl !bg-red-600 !text-white font-semibold text-[13px] tracking-tight px-6 h-10 hover:!bg-red-700 transition-all shadow-dash-sm">
                            Xem tất cả
                          </Button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-2">
                          <Link
                            href="/rentals"
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 hover:text-zinc-950 transition-all"
                          >
                            <div>
                              <p className="text-zinc-900 font-medium text-[15px] tracking-tight">
                                Máy ảnh
                              </p>
                              <p className="text-zinc-500 text-[13px] font-normal mt-0.5">
                                Mirrorless & Cinema
                              </p>
                            </div>
                            <Sparkles className="w-3 h-3 text-red-600 opacity-0 group-hover:opacity-100 transition-all" />
                          </Link>
                          <Link
                            href="/rentals"
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 hover:text-zinc-950 transition-all"
                          >
                            <div>
                              <p className="text-zinc-900 font-medium text-[15px] tracking-tight">
                                Ống kính
                              </p>
                              <p className="text-zinc-500 text-[13px] font-normal mt-0.5">
                                Prime & Zoom
                              </p>
                            </div>
                            <Sparkles className="w-3 h-3 text-red-600 opacity-0 group-hover:opacity-100 transition-all" />
                          </Link>
                          <Link
                            href="/rentals"
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 hover:text-zinc-950 transition-all"
                          >
                            <div>
                              <p className="text-zinc-900 font-medium text-[15px] tracking-tight">
                                Ánh sáng
                              </p>
                              <p className="text-zinc-500 text-[13px] font-normal mt-0.5">
                                Phòng Studio & Ngoại cảnh
                              </p>
                            </div>
                            <Sparkles className="w-3 h-3 text-red-600 opacity-0 group-hover:opacity-100 transition-all" />
                          </Link>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/inventory"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-transparent px-4 text-[15px] font-bold tracking-tight text-zinc-500 transition-all hover:text-zinc-950 hover:bg-zinc-50 focus:!bg-zinc-950 focus:!text-white data-active:!bg-zinc-950 data-active:!text-white outline-none"
                    >
                      Sản phẩm mới
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/about"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-transparent px-4 text-[15px] font-bold tracking-tight text-zinc-500 transition-all hover:text-zinc-950 hover:bg-zinc-50 focus:!bg-zinc-950 focus:!text-white data-active:!bg-zinc-950 data-active:!text-white outline-none"
                    >
                      Về chúng tôi
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center bg-zinc-50/80 border border-zinc-100 rounded-xl px-4 h-11 gap-3 focus-within:bg-white focus-within:border-zinc-300 focus-within:shadow-dash-sm transition-all">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none outline-none text-[13px] font-bold text-zinc-950 placeholder:text-zinc-400 placeholder:font-medium w-48 tracking-tight"
              />
            </div>

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9 rounded-xl hover:bg-zinc-100 transition-all"
            >
              <Search className="h-4 w-4 text-zinc-500" />
            </Button>

            {/* Shopping Bag */}
            <Link href="/profile?section=cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative w-10 h-10 rounded-xl bg-zinc-50/50 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all group active:scale-95"
              >
                <ShoppingBag className="h-4 w-4 text-zinc-500 group-hover:text-red-600 transition-colors" />
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-950 text-[9px] font-black text-white shadow-lg border-2 border-white">
                  0
                </span>
              </Button>
            </Link>

            {/* Auth: Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {isLoading ? (
                <div className="w-10 h-10 rounded-xl bg-zinc-100 animate-pulse" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-10 h-10 rounded-xl bg-zinc-50/50 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all cursor-pointer flex items-center justify-center group active:scale-95 outline-none">
                    <User className="h-4 w-4 text-zinc-500 group-hover:text-red-600 transition-colors" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-white border border-zinc-100 rounded-xl p-2 shadow-dash-lg"
                  >
                    <div className="px-3 py-3 mb-1">
                      <p className="text-[14px] font-bold text-zinc-950 truncate">
                        {user.email}
                      </p>
                      <p className="text-[11px] font-black text-zinc-400 mt-1">
                        {user.roles?.[0] || "Customer"}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-zinc-100" />

                    {dashboardLink && (
                      <DropdownMenuItem className="cursor-pointer">
                        <Link
                          href={dashboardLink}
                          className="flex items-center gap-3 px-1 py-1 w-full group"
                        >
                          <LayoutDashboard className="w-4 h-4 text-red-600 group-hover:text-white" />
                          <span className="tracking-tight">
                            Bảng điều khiển
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="cursor-pointer">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-1 py-1 w-full group"
                      >
                        <User className="w-4 h-4" />
                        <span className="tracking-tight">Tài khoản</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer">
                      <Link
                        href="/profile/settings"
                        className="flex items-center gap-3 px-1 py-1 w-full group"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="tracking-tight">Cài đặt</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-zinc-100" />

                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer !text-red-600 focus:!bg-red-600 focus:!text-white"
                    >
                      <div className="flex items-center gap-3 px-1 py-1">
                        <LogOut className="w-4 h-4" />
                        <span className="tracking-tight">Đăng xuất</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={Routers.LOGIN}>
                  <Button className="h-10 rounded-xl px-8 bg-zinc-950 text-white hover:bg-red-600 font-bold text-[13px] transition-all shadow-dash-sm active:scale-95 border-none">
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Auth */}
            <div className="lg:hidden">
              {isLoading ? (
                <div className="w-9 h-9 rounded-xl bg-zinc-100 animate-pulse" />
              ) : isAuthenticated && user ? (
                <Link
                  href="/profile"
                  className="w-9 h-9 rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center group"
                >
                  <User className="h-4 w-4 text-zinc-500 group-hover:text-zinc-900" />
                </Link>
              ) : (
                <Link
                  href={Routers.LOGIN}
                  className="h-8 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-black font-black text-[10px] transition-all flex items-center"
                >
                  Đăng nhập
                </Link>
              )}
            </div>

            {/* Desktop CTA */}
            <Button className="hidden xl:flex ml-2 h-10 rounded-xl px-8 bg-red-600 text-white border-none hover:bg-red-700 font-bold text-[14px] transition-all shadow-dash-md active:scale-95">
              Đặt thuê ngay
            </Button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center transition-all active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-zinc-900" />
              ) : (
                <Menu className="h-4 w-4 text-zinc-900" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu Overlay ─── */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ─── Mobile Menu Slide Panel ─── */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-white border-l border-zinc-200 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-100">
            <span className="text-[11px] font-black text-zinc-400 tracking-tight">
              Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center transition-all active:scale-95"
            >
              <X className="h-4 w-4 text-zinc-900" />
            </button>
          </div>

          {/* Mobile Menu User Section */}
          {!isLoading && isAuthenticated && user && (
            <div className="px-5 py-5 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-dash-md">
                  <span className="text-sm font-black text-white">
                    {user.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-zinc-950 truncate">
                    {user.email}
                  </p>
                  <p className="text-[11px] font-black text-zinc-400 mt-0.5">
                    {user.roles?.[0] || "Customer"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              <p className="px-3 py-2 text-[11px] font-black text-zinc-400 tracking-tight">
                Điều hướng
              </p>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all group"
              >
                <Home className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                <span className="text-[14px] font-bold">Trang chủ</span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
              </Link>

              <Link
                href="/rentals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all group"
              >
                <Camera className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                <span className="text-[14px] font-bold">Thiết bị</span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
              </Link>

              <Link
                href="/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all group"
              >
                <Package className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                <span className="text-[14px] font-bold">Sản phẩm mới</span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all group"
              >
                <Info className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                <span className="text-[14px] font-bold">Về chúng tôi</span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
              </Link>
            </div>

            {/* Mobile Menu Account Section */}
            {!isLoading && isAuthenticated && user && (
              <div className="px-3 mt-4 space-y-1">
                <p className="px-3 py-2 text-[11px] font-black text-zinc-400 tracking-tight">
                  Tài khoản
                </p>

                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all group"
                  >
                    <LayoutDashboard className="w-4 h-4 text-red-600" />
                    <span className="text-[14px] font-bold">
                      Bảng điều khiển
                    </span>
                    <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all group"
                >
                  <User className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                  <span className="text-[14px] font-bold">Tài khoản</span>
                  <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
                </Link>

                <Link
                  href="/profile/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all group"
                >
                  <Settings className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                  <span className="text-[14px] font-bold">Cài đặt</span>
                  <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="px-5 py-5 border-t border-zinc-200 space-y-3">
            {!isLoading && isAuthenticated && user ? (
              <>
                <Button
                  className="w-full h-11 rounded-xl bg-zinc-950 text-white hover:bg-black font-bold text-[14px] shadow-dash-md active:scale-[0.98] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đặt Thuê Ngay
                </Button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-50 font-bold text-[14px] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng Xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href={Routers.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full h-11 rounded-xl bg-zinc-950 text-white hover:bg-black font-bold text-[14px] shadow-dash-md active:scale-[0.98] transition-all">
                    Đăng nhập
                  </Button>
                </Link>
                <Button
                  className="w-full h-11 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-[14px] shadow-dash-md active:scale-[0.98] transition-all mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đặt Thuê Ngay
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
