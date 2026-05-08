"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { RoleGuard, useAuthSession } from "@/components/auth/Guards";
import { Role } from "@/constants/enum/role";
import { ThemeProvider } from "@/providers/theme-provider";
import { Menu, Search, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuthSession();
  const pathname = usePathname();
  const allowedRoles = useMemo(
    () => [Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN],
    [],
  );

  // Map pathname to Page Titles
  const pageTitle = useMemo(() => {
    if (pathname === "/admin")
      return { title: "Tổng quan", subtitle: "Hệ thống quản trị" };
    if (pathname.includes("/users"))
      return { title: "Người dùng", subtitle: "Quản lý thành viên" };
    if (pathname.includes("/categories"))
      return { title: "Danh mục", subtitle: "Phân loại sản phẩm" };
    if (pathname.includes("/address"))
      return { title: "Địa chỉ", subtitle: "Giao nhận hàng" };
    if (pathname.includes("/products"))
      return { title: "Kho hàng", subtitle: "Quản lý thiết bị" };
    if (pathname.includes("/orders"))
      return { title: "Đơn hàng", subtitle: "Quản lý giao dịch" };
    if (pathname.includes("/vouchers"))
      return { title: "Vouchers", subtitle: "Mã giảm giá" };
    if (pathname.includes("/reviews"))
      return { title: "Đánh giá", subtitle: "Quản lý phản hồi" };
    if (pathname.includes("/settings"))
      return { title: "Cài đặt", subtitle: "Hệ thống" };
    return { title: "LensHub", subtitle: "Admin Pro" };
  }, [pathname]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <RoleGuard allowedRoles={allowedRoles}>
        <div className="flex min-h-screen w-full bg-zinc-50/30">
          <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <div className="flex-1 flex flex-col min-w-0">
            {/* Optimized Navbar */}
            <header
              className={cn(
                "sticky top-0 z-30 flex w-full items-center justify-between border-b border-zinc-100 bg-white/90 backdrop-blur-md transition-all duration-300",
                "h-[var(--dash-navbar-h)] px-4 sm:px-6 lg:px-8 lg:pl-10",
                "lg:ml-[var(--dash-sidebar-w)]",
              )}
            >
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-10 w-10 rounded-xl hover:bg-zinc-100 border border-zinc-100 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5 text-zinc-600" />
                </Button>

                <div className="flex items-center gap-4">
                  <h1 className="text-[20px] font-bold tracking-tight text-zinc-950 leading-none">
                    {pageTitle.title}
                  </h1>
                  <div className="w-px h-4 bg-zinc-200" />
                  <span className="text-[13px] font-medium text-zinc-400 tracking-tight leading-none">
                    {pageTitle.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden xl:flex relative w-64 mr-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input
                    placeholder="Tìm kiếm nhanh..."
                    className="pl-10 h-10 text-[13px] font-medium rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-1 focus:ring-zinc-200 focus:shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition-all"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-zinc-50 relative group hidden md:flex border border-transparent hover:border-zinc-100 transition-all hover:shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                >
                  <Bell className="h-4.5 w-4.5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white" />
                </Button>

                <div className="h-6 w-px bg-zinc-100 mx-2 hidden sm:block" />

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                      "flex items-center gap-3 p-1 rounded-xl transition-all duration-300 border border-transparent",
                      isUserMenuOpen
                        ? "bg-zinc-100 border-zinc-200 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                        : "hover:bg-zinc-50 hover:border-zinc-100 hover:shadow-[0_2px_6px_rgba(0,0,0,0.04)]",
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-semibold text-sm shadow-md shadow-red-100">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left pr-2">
                      <span className="text-[13px] font-bold text-zinc-950 tracking-tight leading-none mb-1">
                        {user?.email?.split("@")[0]}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider leading-none">
                        {user?.roles?.[0] || "Staff"}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 mr-1",
                        isUserMenuOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-100 rounded-xl shadow-dash-overlay z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-zinc-50 flex items-center gap-3 bg-zinc-50/30">
                          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-bold text-sm">
                            {user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate font-bold text-zinc-950 text-xs">
                              {user?.email?.split("@")[0]}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">
                              {user?.roles?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="p-1">
                          <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Main Content Area - Fluid & Data-dense */}
            <main
              className={cn(
                "flex-1 flex flex-col transition-all duration-300",
                "lg:ml-[var(--dash-sidebar-w)]",
                "p-6 sm:p-8 lg:p-8",
              )}
            >
              <div className="w-full h-full">{children}</div>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ThemeProvider>
  );
}
