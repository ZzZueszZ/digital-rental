"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { SuperAdminSidebar } from "@/components/admin/sidebar";
import { RoleGuard, useAuthSession } from "@/components/auth/Guards";
import { Role } from "@/constants/enum/role";
import { ThemeProvider } from "@/providers/theme-provider";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuthSession();
  const pathname = usePathname();
  const allowedRoles = useMemo(
    () => [Role.SUPER_ADMIN],
    [],
  );

  // Map pathname to Page Titles
  const pageTitle = useMemo(() => {
    if (pathname === "/super-admin")
      return { title: "Tổng quan", subtitle: "Hệ thống quản trị tối cao" };
    if (pathname.includes("/roles"))
      return { title: "Vai trò", subtitle: "Quản lý vai trò (Roles)" };
    if (pathname.includes("/permissions"))
      return { title: "Quyền hạn", subtitle: "Quản lý quyền hạn (Permissions)" };
    if (pathname.includes("/users"))
      return { title: "Người dùng", subtitle: "Quản lý thành viên" };
    if (pathname.includes("/ekyc"))
      return { title: "Duyệt eKYC", subtitle: "Phê duyệt định danh" };
    if (pathname.includes("/categories"))
      return { title: "Danh mục", subtitle: "Phân loại sản phẩm" };
    if (pathname.includes("/address"))
      return { title: "Địa chỉ", subtitle: "Giao nhận hàng" };
    if (pathname.includes("/products"))
      return { title: "Kho hàng", subtitle: "Quản lý thiết bị" };
    if (pathname.includes("/orders"))
      return { title: "Đơn hàng", subtitle: "Quản lý giao dịch" };
    if (pathname.includes("/rentals"))
      return { title: "Thuê thiết bị", subtitle: "Quản lý thuê máy ảnh" };
    if (pathname.includes("/vouchers"))
      return { title: "Vouchers", subtitle: "Mã giảm giá" };
    if (pathname.includes("/reviews"))
      return { title: "Đánh giá", subtitle: "Quản lý phản hồi" };
    if (pathname.includes("/settings"))
      return { title: "Cài đặt", subtitle: "Hệ thống" };
    return { title: "LensHub", subtitle: "Super Admin Pro" };
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
          <SuperAdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

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

                <div>
                  <h1 className="text-lg font-semibold tracking-tight text-zinc-950">
                    {pageTitle.title}
                  </h1>
                  <span className="mt-0.5 hidden text-xs font-normal text-zinc-400 sm:block">
                    {pageTitle.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-sm font-medium text-red-600">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left pr-2">
                      <span className="mb-1 text-[13px] font-medium leading-none text-zinc-950">
                        {user?.email?.split("@")[0]}
                      </span>
                      <span className="text-[11px] font-normal leading-none text-zinc-400">
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
                            <span className="truncate text-xs font-medium text-zinc-950">
                              {user?.email?.split("@")[0]}
                            </span>
                            <span className="text-[10px] font-normal text-zinc-400">
                              {user?.roles?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="p-1">
                          <button
                            onClick={() => logout()}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-normal text-red-600 transition-colors hover:bg-red-50"
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
                "p-4 sm:p-6 lg:p-8",
              )}
            >
              <div className="mx-auto h-full w-full max-w-[1440px]">{children}</div>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ThemeProvider>
  );
}
