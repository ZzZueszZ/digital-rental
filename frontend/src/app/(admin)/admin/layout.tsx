"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { RoleGuard, useAuthSession } from "@/components/auth/Guards";
import { Role } from "@/constants/enum/role";
import { ThemeProvider } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
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

  const pageTitle = useMemo(() => {
    if (pathname === "/admin")
      return { title: "Tổng quan", subtitle: "Điều phối hệ thống" };
    if (pathname.includes("/users"))
      return { title: "Người dùng", subtitle: "Quản lý thành viên" };
    if (pathname.includes("/ekyc"))
      return { title: "Duyệt eKYC", subtitle: "Phê duyệt định danh" };
    if (pathname.includes("/categories"))
      return { title: "Danh mục", subtitle: "Phân loại thiết bị" };
    if (pathname.includes("/address"))
      return { title: "Địa chỉ", subtitle: "Giao nhận hàng" };
    if (pathname.includes("/products"))
      return { title: "Kho hàng", subtitle: "Quản lý thiết bị" };
    if (pathname.includes("/orders"))
      return { title: "Đơn hàng", subtitle: "Quản lý giao dịch" };
    if (pathname.includes("/rentals"))
      return { title: "Thuê thiết bị", subtitle: "Quản lý đơn thuê" };
    if (pathname.includes("/vouchers"))
      return { title: "Voucher", subtitle: "Mã giảm giá" };
    if (pathname.includes("/reviews"))
      return { title: "Đánh giá", subtitle: "Quản lý phản hồi" };
    if (pathname.includes("/support"))
      return { title: "Hỗ trợ", subtitle: "Yêu cầu khách hàng" };
    if (pathname.includes("/audit-logs"))
      return { title: "Nhật ký", subtitle: "Hoạt động hệ thống" };
    if (pathname.includes("/settings"))
      return { title: "Cài đặt", subtitle: "Thiết lập hệ thống" };
    return { title: "Digital Rental", subtitle: "Admin" };
  }, [pathname]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <RoleGuard allowedRoles={allowedRoles}>
        <div className="flex min-h-screen w-full bg-zinc-50/70 text-zinc-950">
          <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <div className="flex min-w-0 flex-1 flex-col">
            <header
              className={cn(
                "sticky top-0 z-30 flex w-full items-center justify-between border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl transition-all duration-300",
                "h-[var(--dash-navbar-h)] px-4 sm:px-6 lg:px-8 lg:pl-10",
                "lg:ml-[var(--dash-sidebar-w)]",
              )}
            >
              <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div className="min-w-0">
                  <h1 className="truncate text-[18px] font-semibold leading-tight tracking-tight text-zinc-950 sm:text-[20px]">
                    {pageTitle.title}
                  </h1>
                  <span className="hidden text-[13px] font-medium leading-tight text-zinc-500 sm:block">
                    {pageTitle.subtitle}
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-1 transition-all duration-200",
                    isUserMenuOpen
                      ? "border-zinc-200 bg-zinc-50"
                      : "border-zinc-200/70 bg-white hover:bg-zinc-50",
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden flex-col items-start pr-2 text-left sm:flex">
                    <span className="mb-1 max-w-36 truncate text-[13px] font-semibold leading-none tracking-tight text-zinc-950">
                      {user?.email?.split("@")[0]}
                    </span>
                    <span className="text-[11px] font-medium leading-none text-zinc-500">
                      {user?.roles?.[0] || "Staff"}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "mr-1 h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
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
                    <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-dash-overlay animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/60 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold">
                          {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-xs font-semibold text-zinc-950">
                            {user?.email?.split("@")[0]}
                          </span>
                          <span className="text-[11px] font-medium text-zinc-500">
                            {user?.roles?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => logout()}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-600 transition-all hover:bg-red-50"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </header>

            <main
              className={cn(
                "flex flex-1 flex-col transition-all duration-300",
                "lg:ml-[var(--dash-sidebar-w)]",
                "p-4 sm:p-6 lg:p-8",
              )}
            >
              <div className="mx-auto h-full w-full max-w-[1440px]">
                {children}
              </div>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ThemeProvider>
  );
}
