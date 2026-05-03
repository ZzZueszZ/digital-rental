'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { RoleGuard, useAuthSession } from '@/components/auth/Guards';
import { Role } from '@/constants/enum/role';
import { ThemeProvider } from '@/providers/theme-provider';
import { Menu, Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuthSession();
  const pathname = usePathname();
  const allowedRoles = useMemo(() => [Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN], []);

  // Map pathname to Page Titles
  const pageTitle = useMemo(() => {
    if (pathname === '/admin') return { title: 'Tổng quan', subtitle: 'Hệ thống quản trị' };
    if (pathname.includes('/users')) return { title: 'Người dùng', subtitle: 'Quản lý thành viên' };
    if (pathname.includes('/categories')) return { title: 'Danh mục', subtitle: 'Phân loại sản phẩm' };
    if (pathname.includes('/address')) return { title: 'Địa chỉ', subtitle: 'Quản lý điểm giao nhận' };
    if (pathname.includes('/products')) return { title: 'Kho hàng', subtitle: 'Quản lý thiết bị' };
    if (pathname.includes('/orders')) return { title: 'Đơn hàng', subtitle: 'Quản lý giao dịch' };
    if (pathname.includes('/vouchers')) return { title: 'Vouchers', subtitle: 'Ưu đãi & Khuyến mãi' };
    if (pathname.includes('/settings')) return { title: 'Cài đặt', subtitle: 'Cấu hình hệ thống' };
    return { title: 'LensHub', subtitle: 'Admin PRO' };
  }, [pathname]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <RoleGuard allowedRoles={allowedRoles}>
        <div className="flex min-h-screen w-full bg-zinc-50/50">
          <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-100 bg-white/95 px-4 sm:px-6 backdrop-blur-xl lg:pl-64 transition-all duration-300">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden h-12 w-12 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6 text-zinc-600" />
                </Button>
                
                {/* Dynamic Page Title in Header */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-zinc-950 truncate max-w-[140px] sm:max-w-none">{pageTitle.title}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-0.5 shrink-0" />
                  </div>
                  <span className="text-sm font-medium text-zinc-500 mt-0.5">{pageTitle.subtitle}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden xl:flex relative w-64 mr-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Tìm kiếm nhanh..." 
                    className="pl-9 h-10 text-xs rounded-xl border-zinc-100 bg-zinc-50/50"
                  />
                </div>

                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-zinc-100 relative group hidden md:flex">
                  <Bell className="h-5 w-5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-600 rounded-full border-2 border-white" />
                </Button>
                
                <div className="h-8 w-px bg-zinc-100 mx-2 hidden sm:block" />

                {/* User Dropdown Profile */}
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                      "flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-all duration-300 border border-transparent",
                      isUserMenuOpen ? "bg-zinc-100 border-zinc-200 shadow-inner" : "hover:bg-zinc-100 hover:border-zinc-200"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/10">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left">
                      <span className="text-sm font-semibold text-zinc-950 tracking-tight leading-none mb-1">
                        {user?.email?.split('@')[0]}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium leading-none">
                        {user?.roles?.[0] || 'Member'}
                      </span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform duration-300", isUserMenuOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-3 w-64 bg-white border border-zinc-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] z-20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-5 border-b border-zinc-50 flex items-center gap-4 bg-zinc-50/50">
                          <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-black text-lg shadow-sm">
                            {user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate font-semibold text-zinc-950 text-sm">{user?.email?.split('@')[0]}</span>
                            <span className="text-xs text-zinc-400 font-medium">{user?.roles?.[0]}</span>
                          </div>
                        </div>
                        <div className="p-2">
                          <button 
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                          >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
              <div className="w-full mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ThemeProvider>
  );
}
