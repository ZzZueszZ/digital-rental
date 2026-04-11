"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { createQueryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/providers/theme-provider";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { SessionLoadingGuard } from "@/components/auth/session-loading-guard";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SessionLoadingGuard>
          {children}
          <LoadingOverlay />
          <Toaster />
        </SessionLoadingGuard>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
