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
