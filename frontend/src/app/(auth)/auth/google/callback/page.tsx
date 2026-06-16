"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { AUTH_ME_QUERY_KEY } from "@/constants/query-keys";
import Routers from "@/constants/routers";
import { getRoleRedirectUrl } from "@/lib/auth-redirect";
import {
  consumeGoogleOAuthState,
  getGoogleRedirectUriForBackend,
} from "@/lib/google-oauth";
import { persistRefreshTokenCookie } from "@/lib/refresh-token-client";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/auth";
import type { LoginResponse } from "@/schemas/auth/login";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const hasHandledCallback = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }
    hasHandledCallback.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const googleError = searchParams.get("error");

    const completeGoogleLogin = async () => {
      if (googleError) {
        setError("Bạn đã hủy hoặc Google không thể xác thực yêu cầu.");
        return;
      }
      if (!code) {
        setError("Không tìm thấy mã xác thực từ Google.");
        return;
      }
      if (!consumeGoogleOAuthState(state)) {
        setError("Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.");
        return;
      }

      try {
        const { data } = await authService.googleLogin({
          code,
          redirectUri: getGoogleRedirectUriForBackend(),
        });
        const payload = data.data as LoginResponse;

        await persistRefreshTokenCookie(payload.refreshToken);
        setAccessToken(payload.accessToken);
        queryClient.setQueryData(AUTH_ME_QUERY_KEY, payload.user);

        window.location.href = getRoleRedirectUrl(payload.user.roles);
      } catch (err: unknown) {
        const serverError = err as { response?: { data?: { message?: string } } };
        setError(
          serverError.response?.data?.message ||
            "Đăng nhập Google thất bại. Vui lòng thử lại.",
        );
      }
    };

    void completeGoogleLogin();
  }, [queryClient, searchParams, setAccessToken]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 py-10">
        <section className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
            Không thể đăng nhập Google
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{error}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() => (window.location.href = Routers.LOGIN)}
              className="h-11 rounded-2xl bg-zinc-950 text-sm font-semibold text-white hover:bg-red-600"
            >
              Về đăng nhập
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => (window.location.href = Routers.HOME)}
              className="h-11 rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
            >
              Về trang chủ
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 py-10">
      <section className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
          Đang xác thực Google
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          DigitalRental đang kiểm tra tài khoản Google và chuẩn bị phiên đăng nhập cho bạn.
        </p>
        <Loader2 className="mx-auto mt-8 h-6 w-6 animate-spin text-red-600" />
      </section>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
