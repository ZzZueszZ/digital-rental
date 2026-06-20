import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidRedirectUrl(searchParams: URLSearchParams) {
  const redirect = searchParams.get('redirect');
  if (!redirect) return null;
  // Ensure it's a relative path to prevent open redirect attacks
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }
  return null;
}

export function getImageUrl(url: string | null | undefined): string {
  const rawUrl = url?.trim();
  if (!rawUrl) return "";
  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("blob:") ||
    rawUrl.startsWith("data:")
  ) {
    return rawUrl;
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  const origin = apiBaseUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;

  return `${origin}${path}`;
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatMoneyInput(value?: number | null): string {
  const amount = Number(value || 0);
  if (!amount) return "";
  return new Intl.NumberFormat("vi-VN").format(Math.max(0, amount));
}

export function parseMoneyInput(value: string): number {
  const numericValue = value.replace(/[^\d]/g, "");
  return numericValue ? Number(numericValue) : 0;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
