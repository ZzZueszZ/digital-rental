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
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8080";
  return `${baseUrl}${url}`;
}
