"use client";

import { useAuthSession } from "@/components/auth/Guards";
import { FullPageLoading } from "@/components/common/full-page-loading";
import { ReactNode, useEffect, useState } from "react";

export function SessionLoadingGuard({ children }: { children: ReactNode }) {
  const { isLoading } = useAuthSession({ redirectToLogin: false });
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure all client hooks are stable
      const timer = setTimeout(() => setIsAppReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isAppReady) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
}
