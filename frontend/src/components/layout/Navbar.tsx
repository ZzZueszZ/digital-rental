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
      <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/5 select-none">
        <div className="container flex h-16 lg:h-20 items-center justify-between px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-6 lg:gap-12">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-all"
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-[#ff8c5a] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Camera className="h-4 w-4 lg:h-5 lg:w-5 text-black" />
              </div>
              <div className="flex flex-col select-none">
                <span className="text-lg lg:text-xl font-black tracking-tighter text-white uppercase font-heading leading-none">
                  Studio
                </span>
                <span className="text-lg lg:text-xl font-black tracking-tighter text-[#ff8c5a] uppercase font-heading leading-none">
                  Visuals
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-zinc-500 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors data-[state=open]:text-white">
                      Thiết Bị
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="p-6 w-[700px] bg-[#0c0c0c] border border-white/5 rounded-[2rem] shadow-2xl flex gap-6">
                        <div className="flex-1 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                          <Zap className="w-8 h-8 text-[#ff8c5a] mb-4" />
                          <h4 className="text-xl font-black text-white uppercase font-heading mb-3">
                            Kho Vũ Khí
                          </h4>
                          <p className="text-zinc-500 text-xs leading-relaxed mb-4 font-medium">
                            Khám phá các dòng máy ảnh và ống kính chuyên nghiệp
                            nhất hiện nay.
                          </p>
                          <Button
                            variant="outline"
                            className="rounded-full border-white/10 text-white font-black uppercase text-[9px] tracking-widest px-6 h-10 hover:bg-[#ff8c5a] hover:text-black transition-all"
                          >
                            Xem Tất Cả
                          </Button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-2">
                          <Link
                            href="/rentals"
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 transition-all"
                          >
                            <div>
                              <p className="text-white font-bold text-xs uppercase tracking-widest">
                                Máy Ảnh
                              </p>
                              <p className="text-zinc-500 text-[9px] font-bold uppercase mt-0.5">
                                Mirrorless & Cinema
                              </p>
                            </div>
                            <Sparkles className="w-3 h-3 text-[#ff8c5a] opacity-0 group-hover:opacity-100 transition-all" />
                          </Link>
                          <Link
                            href="/rentals"
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 transition-all"
                          >
                            <div>
                              <p className="text-white font-bold text-xs uppercase tracking-widest">
                                Ống Kính
                              </p>
                              <p className="text-zinc-500 text-[9px] font-bold uppercase mt-0.5">
                                Prime & Zoom
                              </p>
                            </div>
                            <Sparkles className="w-3 h-3 text-[#ff8c5a] opacity-0 group-hover:opacity-100 transition-all" />
                          </Link>
                          <Link
                            href="/rentals"
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 transition-all"
                          >
                            <div>
                              <p className="text-white font-bold text-xs uppercase tracking-widest">
                                Ánh Sáng
                              </p>
                              <p className="text-zinc-500 text-[9px] font-bold uppercase mt-0.5">
                                Phòng Studio & Ngoại Cảnh
                              </p>
                            </div>
                            <Sparkles className="w-3 h-3 text-[#ff8c5a] opacity-0 group-hover:opacity-100 transition-all" />
                          </Link>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/inventory"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-transparent px-5 text-xs font-bold text-zinc-500 uppercase tracking-widest transition-all hover:text-white"
                    >
                      Sản Phẩm Mới
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/about"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-transparent px-5 text-xs font-bold text-zinc-500 uppercase tracking-widest transition-all hover:text-white"
                    >
                      Về Chúng Tôi
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center bg-zinc-900/50 border border-white/5 rounded-full px-5 h-10 gap-3">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <input
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest text-white placeholder:text-zinc-500 w-36"
              />
            </div>

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9 rounded-xl hover:bg-zinc-900 transition-all"
            >
              <Search className="h-4 w-4 text-zinc-400" />
            </Button>

            {/* Auth: Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {isLoading ? (
                <div className="w-10 h-10 rounded-xl bg-zinc-900/50 animate-pulse" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-10 h-10 rounded-xl hover:bg-zinc-900 transition-all cursor-pointer flex items-center justify-center group">
                    <User className="h-4 w-4 text-zinc-500 group-hover:text-white" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-[#0c0c0c] border border-white/10 rounded-2xl p-2 shadow-2xl"
                  >
                    <div className="px-3 py-3 mb-1">
                      <p className="text-sm font-bold text-white truncate">
                        {user.email}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        {user.roles?.join(", ") || "Customer"}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-white/5" />

                    {dashboardLink && (
                      <DropdownMenuItem className="rounded-xl cursor-pointer focus:bg-zinc-900 focus:text-white">
                        <Link
                          href={dashboardLink}
                          className="flex items-center gap-3 px-3 py-2.5 w-full"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#ff8c5a]" />
                          <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                            Dashboard
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="rounded-xl cursor-pointer focus:bg-zinc-900 focus:text-white">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 w-full"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                          Tài Khoản
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="rounded-xl cursor-pointer focus:bg-zinc-900 focus:text-white">
                      <Link
                        href="/profile/settings"
                        className="flex items-center gap-3 px-3 py-2.5 w-full"
                      >
                        <Settings className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                          Cài Đặt
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/5" />

                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-xl cursor-pointer focus:bg-red-950/50 focus:text-red-400"
                    >
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                          Đăng Xuất
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={Routers.LOGIN}>
                  <Button className="h-10 rounded-full px-6 bg-zinc-900 border border-white/5 text-white hover:bg-zinc-800 hover:border-white/10 font-black uppercase text-[9px] tracking-widest transition-all">
                    Đăng Nhập
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Auth */}
            <div className="lg:hidden">
              {isLoading ? (
                <div className="w-9 h-9 rounded-xl bg-zinc-900/50 animate-pulse" />
              ) : isAuthenticated && user ? (
                <Link
                  href="/profile"
                  className="w-9 h-9 rounded-xl hover:bg-zinc-900 transition-all flex items-center justify-center group"
                >
                  <User className="h-4 w-4 text-zinc-500 group-hover:text-white" />
                </Link>
              ) : (
                <Link
                  href={Routers.LOGIN}
                  className="h-8 px-3.5 rounded-full bg-zinc-900 border border-white/5 text-white hover:bg-zinc-800 font-black uppercase text-[8px] tracking-widest transition-all flex items-center"
                >
                  Đăng Nhập
                </Link>
              )}
            </div>

            {/* Shopping Bag */}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl hover:bg-zinc-900 transition-all group"
            >
              <ShoppingBag className="h-4 w-4 text-zinc-500 group-hover:text-white" />
              <span className="absolute top-1 right-1 lg:top-1.5 lg:right-1.5 flex h-3.5 w-3.5 lg:h-4 lg:w-4 items-center justify-center rounded-full bg-[#ff8c5a] text-[7px] lg:text-[8px] font-black text-black">
                0
              </span>
            </Button>

            {/* Desktop CTA */}
            <Button className="hidden xl:flex ml-2 h-10 rounded-full px-6 bg-white text-black hover:bg-[#ff8c5a] font-black uppercase text-[9px] tracking-widest shadow-lg active:scale-95 transition-all">
              Đặt Thuê Ngay
            </Button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center transition-all active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-white" />
              ) : (
                <Menu className="h-4 w-4 text-white" />
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
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-[#0c0c0c] border-l border-white/5 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">
              Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center transition-all active:scale-95"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Mobile Menu User Section */}
          {!isLoading && isAuthenticated && user && (
            <div className="px-5 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#ff8c5a] to-[#ff6b3a] flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-black uppercase">
                    {user.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {user.email}
                  </p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                    {user.roles?.join(", ") || "Customer"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              <p className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                Điều Hướng
              </p>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all group"
              >
                <Home className="w-4 h-4 text-zinc-500 group-hover:text-[#ff8c5a]" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Trang Chủ
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-700 ml-auto group-hover:text-zinc-500" />
              </Link>

              <Link
                href="/rentals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all group"
              >
                <Camera className="w-4 h-4 text-zinc-500 group-hover:text-[#ff8c5a]" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Thiết Bị
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-700 ml-auto group-hover:text-zinc-500" />
              </Link>

              <Link
                href="/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all group"
              >
                <Package className="w-4 h-4 text-zinc-500 group-hover:text-[#ff8c5a]" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Sản Phẩm Mới
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-700 ml-auto group-hover:text-zinc-500" />
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all group"
              >
                <Info className="w-4 h-4 text-zinc-500 group-hover:text-[#ff8c5a]" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Về Chúng Tôi
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-700 ml-auto group-hover:text-zinc-500" />
              </Link>
            </div>

            {/* Mobile Menu Account Section */}
            {!isLoading && isAuthenticated && user && (
              <div className="px-3 mt-4 space-y-1">
                <p className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                  Tài Khoản
                </p>

                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all group"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#ff8c5a]" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Dashboard
                    </span>
                    <ChevronRight className="w-3 h-3 text-zinc-700 ml-auto group-hover:text-zinc-500" />
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all group"
                >
                  <User className="w-4 h-4 text-zinc-500 group-hover:text-[#ff8c5a]" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Tài Khoản
                  </span>
                  <ChevronRight className="w-3 h-3 text-zinc-700 ml-auto group-hover:text-zinc-500" />
                </Link>

                <Link
                  href="/profile/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all group"
                >
                  <Settings className="w-4 h-4 text-zinc-500 group-hover:text-[#ff8c5a]" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Cài Đặt
                  </span>
                  <ChevronRight className="w-3 h-3 text-zinc-700 ml-auto group-hover:text-zinc-500" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="px-5 py-5 border-t border-white/5 space-y-3">
            {!isLoading && isAuthenticated && user ? (
              <>
                <Button
                  className="w-full h-12 rounded-xl bg-white text-black hover:bg-[#ff8c5a] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-[0.98] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đặt Thuê Ngay
                </Button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-950/30 font-bold uppercase text-[10px] tracking-widest transition-all"
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
                  <Button className="w-full h-12 rounded-xl bg-white text-black hover:bg-[#ff8c5a] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-[0.98] transition-all">
                    Đăng Nhập
                  </Button>
                </Link>
                <Button
                  className="w-full h-12 rounded-xl bg-[#ff8c5a] text-black hover:bg-[#ff7a45] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-[0.98] transition-all mt-2"
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
