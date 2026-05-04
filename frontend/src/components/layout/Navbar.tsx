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
    if (
      user.roles.includes(Role.SUPER_ADMIN) ||
      user.roles.includes(Role.ADMIN)
    )
      return Routers.ADMIN;
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
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-zinc-100 select-none">
        <div className="container flex h-20 items-center justify-between px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto transition-all duration-300">
          {/* Logo */}
          <div className="flex items-center gap-6 lg:gap-12">
            <Link
              href="/"
              className="group flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col select-none">
                <span className="text-[18px] lg:text-[20px] font-black tracking-tight text-zinc-950 uppercase leading-[0.9]">
                  Studio
                </span>
                <span className="text-[18px] lg:text-[20px] font-black tracking-tight text-red-600 uppercase leading-[0.9]">
                  Visuals
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-zinc-600 hover:text-zinc-950 font-medium text-[15px] tracking-tight transition-colors data-[state=open]:!text-red-600 data-[state=open]:!bg-zinc-50 data-[popup-open]:!bg-zinc-50 focus:bg-zinc-50 hover:bg-zinc-50 rounded-full h-10 px-5 border-none shadow-none">
                      Thiết bị
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="p-0 border-none bg-transparent shadow-none">
                      <div className="p-8 w-[720px] bg-white border border-zinc-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex gap-8">
                        <div className="flex-1 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                          <Zap className="w-8 h-8 text-red-600 mb-4" />
                          <h4 className="text-[20px] font-semibold text-zinc-900 tracking-tight mb-3">
                            Kho thiết bị
                          </h4>
                          <p className="text-zinc-500 text-[14px] leading-relaxed mb-4 font-normal">
                            Khám phá các dòng máy ảnh và ống kính chuyên nghiệp
                            nhất hiện nay.
                          </p>
                          <Button
                            className="rounded-full !bg-red-600 !text-white font-semibold text-[13px] tracking-tight px-6 h-10 hover:!bg-red-700 transition-all shadow-md shadow-red-100"
                          >
                            Xem tất cả
                          </Button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-2">
                          <Link
                            href="/rentals"
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 transition-all"
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
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 transition-all"
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
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 transition-all"
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
                      className="inline-flex h-10 items-center justify-center rounded-full bg-transparent px-5 text-[15px] font-medium text-zinc-500 tracking-tight transition-all hover:text-zinc-950 hover:bg-zinc-50"
                    >
                      Sản phẩm mới
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/about"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-transparent px-5 text-[15px] font-medium text-zinc-500 tracking-tight transition-all hover:text-zinc-950 hover:bg-zinc-50"
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
            <div className="hidden lg:flex items-center bg-zinc-50 border border-zinc-100 rounded-xl px-4 h-11 gap-3 focus-within:bg-white focus-within:border-zinc-200 transition-all">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none outline-none text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 w-44"
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
                className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl hover:bg-zinc-100 transition-all group"
              >
                <ShoppingBag className="h-4 w-4 text-zinc-500 group-hover:text-zinc-900" />
                <span className="absolute top-1 right-1 lg:top-1.5 lg:right-1.5 flex h-3.5 w-3.5 lg:h-4 lg:w-4 items-center justify-center rounded-full bg-red-600 text-[7px] lg:text-[8px] font-black text-white">
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
                  <DropdownMenuTrigger className="w-10 h-10 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer flex items-center justify-center group">
                    <User className="h-4 w-4 text-zinc-500 group-hover:text-zinc-900" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-white border border-zinc-200 rounded-2xl p-2 shadow-2xl"
                  >
                    <div className="px-3 py-3 mb-1">
                      <p className="text-[14px] font-semibold text-zinc-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest mt-1">
                        {user.roles?.[0] || "Customer"}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-zinc-100" />

                    {dashboardLink && (
                      <DropdownMenuItem className="rounded-xl cursor-pointer focus:bg-zinc-50 focus:text-zinc-900">
                        <Link
                          href={dashboardLink}
                          className="flex items-center gap-3 px-3 py-2.5 w-full group"
                        >
                          <LayoutDashboard className="w-4 h-4 text-red-600" />
                          <span className="text-[14px] font-medium text-zinc-900 tracking-tight">
                            Bảng điều khiển
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="rounded-xl cursor-pointer focus:bg-zinc-50 focus:text-zinc-900">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 w-full group"
                      >
                        <User className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                        <span className="text-[14px] font-medium text-zinc-900 tracking-tight">
                          Tài khoản
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="rounded-xl cursor-pointer focus:bg-zinc-50 focus:text-zinc-900">
                      <Link
                        href="/profile/settings"
                        className="flex items-center gap-3 px-3 py-2.5 w-full group"
                      >
                        <Settings className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                        <span className="text-[14px] font-medium text-zinc-900 tracking-tight">
                          Cài đặt
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-zinc-100" />

                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-500"
                    >
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-[14px] font-medium text-red-600 tracking-tight">
                          Đăng xuất
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={Routers.LOGIN}>
                  <Button className="h-11 rounded-xl px-6 bg-zinc-950 text-white hover:bg-black font-semibold text-[15px] transition-all shadow-sm">
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
                  className="h-8 px-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-black font-black uppercase text-[8px] tracking-widest transition-all flex items-center"
                >
                  Đăng nhập
                </Link>
              )}
            </div>


            {/* Desktop CTA */}
            <Button className="hidden xl:flex ml-2 h-11 rounded-xl px-6 bg-red-600 text-white border border-transparent hover:bg-red-700 font-semibold text-[15px] transition-all shadow-md shadow-red-200 active:scale-95">
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
          <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-200">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
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
                <div className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center shrink-0 shadow-lg">
                  <span className="text-sm font-black text-white uppercase">
                    {user.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-zinc-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                    {user.roles?.[0] || "Customer"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              <p className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                Điều Hướng
              </p>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
              >
                <Home className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                <span className="text-[14px] font-bold uppercase tracking-widest">
                  Trang Chủ
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
              </Link>

              <Link
                href="/rentals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
              >
                <Camera className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                <span className="text-[14px] font-bold uppercase tracking-widest">
                  Thiết Bị
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
              </Link>

              <Link
                href="/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
              >
                <Package className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                <span className="text-[14px] font-bold uppercase tracking-widest">
                  Sản Phẩm Mới
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
              >
                <Info className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                <span className="text-[14px] font-bold uppercase tracking-widest">
                  Về Chúng Tôi
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
              </Link>
            </div>

            {/* Mobile Menu Account Section */}
            {!isLoading && isAuthenticated && user && (
              <div className="px-3 mt-4 space-y-1">
                <p className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  Tài Khoản
                </p>

                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
                  >
                    <LayoutDashboard className="w-4 h-4 text-red-600" />
                    <span className="text-[14px] font-bold uppercase tracking-widest">
                      Dashboard
                    </span>
                    <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
                >
                  <User className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                  <span className="text-[14px] font-bold uppercase tracking-widest">
                    Tài Khoản
                  </span>
                  <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-400" />
                </Link>

                <Link
                  href="/profile/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
                >
                  <Settings className="w-4 h-4 text-zinc-400 group-hover:text-red-600" />
                  <span className="text-[14px] font-bold uppercase tracking-widest">
                    Cài Đặt
                  </span>
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
                  className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-black font-bold uppercase text-[12px] tracking-widest shadow-lg active:scale-[0.98] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đặt Thuê Ngay
                </Button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-50 font-bold uppercase text-[12px] tracking-widest transition-all"
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
                  <Button className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-black font-bold uppercase text-[12px] tracking-widest shadow-lg active:scale-[0.98] transition-all">
                    Đăng Nhập
                  </Button>
                </Link>
                <Button
                  className="w-full h-12 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold uppercase text-[12px] tracking-widest shadow-lg active:scale-[0.98] transition-all mt-2"
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
