'use client';

import { AdminSidebar } from '@/components/admin/sidebar';
import { RoleGuard } from '@/components/auth/Guards';
import { Role } from '@/constants/enum/role';
import { ThemeProvider } from '@/providers/theme-provider';

import { useMemo } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Chỉ truy cập nếu là STAFF, ADMIN hoặc SUPER_ADMIN
  const allowedRoles = useMemo(() => [Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN], []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RoleGuard allowedRoles={allowedRoles}>
        <div className="flex min-h-screen w-full bg-zinc-50">
          <AdminSidebar />
          <main className="flex-1 lg:ml-64 flex flex-col p-4 sm:p-6 md:p-10 lg:p-12 overflow-y-auto h-screen custom-scrollbar">
            {children}
          </main>
        </div>
      </RoleGuard>
    </ThemeProvider>
  );
}
