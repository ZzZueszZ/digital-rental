'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Routers from '@/constants/routers';
import { AUTH_ME_QUERY_KEY } from '@/constants/query-keys';
import { refreshAccessToken } from '@/lib/http';
import { removeRefreshTokenCookie } from '@/lib/refresh-token-client';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/constants/enum/role';
import type { UserResponse } from '@/types/user';
import { FullPageLoading } from '@/components/common/full-page-loading';

const fetchMe = async (): Promise<UserResponse> => {
  const res = await authService.me();
  return res.data.data as UserResponse;
};

export function useAuthSession(options?: { redirectToLogin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearAccessToken = useAuthStore((state) => state.clear);
  const [bootstrapping, setBootstrapping] = useState(!accessToken);

  const meQuery = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: fetchMe,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!accessToken) {
      queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
    }
  }, [accessToken, queryClient]);

  useEffect(() => {
    if (accessToken) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await refreshAccessToken();
        if (cancelled) return;

        if (token) {
          setAccessToken(token);
          await queryClient.refetchQueries({ queryKey: AUTH_ME_QUERY_KEY });
        } else if (options?.redirectToLogin) {
          clearAccessToken();
          await removeRefreshTokenCookie();
          router.replace(`${Routers.LOGIN}?redirect=${encodeURIComponent(pathname)}`);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, clearAccessToken, options?.redirectToLogin, pathname, queryClient, router, setAccessToken]);

  useEffect(() => {
    if (!options?.redirectToLogin) return;
    if (bootstrapping) return;
    if (meQuery.isLoading || meQuery.isFetching) return;
    if (!meQuery.isError) return;

    clearAccessToken();
    void removeRefreshTokenCookie();
    router.replace(`${Routers.LOGIN}?redirect=${encodeURIComponent(pathname)}`);
  }, [bootstrapping, clearAccessToken, meQuery.isError, meQuery.isFetching, meQuery.isLoading, options?.redirectToLogin, pathname, router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore server logout errors
    } finally {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
      await removeRefreshTokenCookie();
      router.replace(Routers.LOGIN);
    }
  }, [clearAccessToken, queryClient, router]);

  const isAuthenticated = useMemo(() => !!meQuery.data, [meQuery.data]);
  const isLoading = bootstrapping || meQuery.isLoading || meQuery.isFetching;

  return {
    user: meQuery.data ?? null,
    isAuthenticated,
    isLoading,
    refetchUser: meQuery.refetch,
    logout,
  };
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthSession({ redirectToLogin: true });

  if (isLoading) {
    return <FullPageLoading message="Đang xác thực" />;
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthSession({ redirectToLogin: false });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(Routers.HOME);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <FullPageLoading message="Đang kiểm tra" />;
  }

  return <>{children}</>;
}

export function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) {
  const { user, isAuthenticated, isLoading } = useAuthSession({ redirectToLogin: true });
  const router = useRouter();

  // Memoize the hasPermission check
  const hasPermission = useMemo(() => {
    if (!user || !user.roles) return false;
    
    // Normalize user roles (handle both strings and objects if necessary)
    const userRoleCodes = user.roles.map((r: string | { code: string }) => {
      if (typeof r === 'string') return r.toUpperCase();
      if (r && typeof r === 'object' && r.code) return r.code.toUpperCase();
      return '';
    });

    return userRoleCodes.some(roleCode => 
      allowedRoles.some(allowed => {
        const normalizedAllowed = allowed.toUpperCase();
        return roleCode === normalizedAllowed || roleCode === `ROLE_${normalizedAllowed}`;
      })
    );
  }, [user, allowedRoles]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(Routers.LOGIN);
      return;
    }

    if (user && !hasPermission) {
      router.replace(Routers.FORBIDDEN);
    }
  }, [isAuthenticated, isLoading, user, hasPermission, router]);

  if (isLoading) {
    return <FullPageLoading message="Đang kiểm tra quyền..." />;
  }

  if (!isAuthenticated || !hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-8 bg-zinc-50/50 rounded-xl border border-zinc-200 mt-10 mx-auto max-w-2xl text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-7V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H10a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900">Quyền truy cập bị từ chối</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Tài khoản <span className="font-semibold text-zinc-900">{user?.email}</span> không có quyền admin để truy cập trang này.
          </p>
        </div>

        {/* Debug info */}
        <div className="w-full bg-white p-4 rounded-xl border border-zinc-100 text-left space-y-2">
          <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Thông tin gỡ lỗi:</p>
          <div className="text-sm">
            <p className="text-zinc-600">Roles hiện có: <span className="font-mono text-red-600">{user?.roles?.join(', ') || 'Không thấy role nào'}</span></p>
            <p className="text-zinc-600">Roles yêu cầu: <span className="font-mono text-zinc-900">{allowedRoles.join(', ')}</span></p>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button 
            onClick={() => router.replace(Routers.HOME)}
            className="px-6 h-11 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-full hover:bg-zinc-50 transition-colors shadow-sm"
          >
            Về Trang Chủ
          </button>
          <button 
            onClick={() => router.replace(Routers.LOGIN)}
            className="px-6 h-11 bg-zinc-900 text-white font-bold rounded-full hover:bg-black transition-colors shadow-sm"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
