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

const fetchMe = async () => {
  const res = await authService.me();
  return res.data.data;
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
    return (
      <div className='min-h-screen bg-zinc-950 grid place-items-center'>
        <div className='flex flex-col items-center gap-4 text-zinc-400'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
          <span className='text-sm font-medium tracking-wide'>Authenticating session...</span>
        </div>
      </div>
    );
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
    return (
      <div className='min-h-screen bg-zinc-950 grid place-items-center'>
        <div className='flex flex-col items-center gap-4 text-zinc-400'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
          <span className='text-sm font-medium tracking-wide'>Checking status...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) {
  const { user, isAuthenticated, isLoading } = useAuthSession({ redirectToLogin: true });
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(Routers.LOGIN);
      return;
    }

    if (user && user.roles) {
      const hasPermission = user.roles.some((role: Role) => allowedRoles.includes(role));
      if (!hasPermission) {
        router.replace(Routers.FORBIDDEN);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading || !isAuthenticated || !user || !user.roles.some((role: Role) => allowedRoles.includes(role))) {
    return (
      <div className='min-h-screen bg-zinc-950 grid place-items-center'>
        <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  return <>{children}</>;
}
