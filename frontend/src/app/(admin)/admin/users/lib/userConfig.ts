// Shared avatar color palette & helper
export const AVATAR_COLORS = [
  { bg: "from-red-500 to-rose-600", text: "text-white" },
  { bg: "from-blue-500 to-indigo-600", text: "text-white" },
  { bg: "from-emerald-500 to-teal-600", text: "text-white" },
  { bg: "from-violet-500 to-purple-600", text: "text-white" },
  { bg: "from-amber-500 to-orange-600", text: "text-white" },
  { bg: "from-pink-500 to-fuchsia-600", text: "text-white" },
] as const;

export function getAvatarColor(seed: string) {
  const idx = seed.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// Shared account status display config
export const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  ACTIVE: {
    label: "Hoạt động",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-0",
  },
  PENDING: {
    label: "Chờ duyệt",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200 ring-0",
  },
  SUSPENDED: {
    label: "Đình chỉ",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border border-red-200 ring-0",
  },
  DISABLED: {
    label: "Vô hiệu",
    dot: "bg-zinc-400",
    badge: "bg-zinc-50 text-zinc-600 border border-zinc-200 ring-0",
  },
  DELETED: {
    label: "Đã xóa",
    dot: "bg-zinc-800",
    badge: "bg-red-50 text-red-700 border border-red-200 ring-0",
  },
};

export const BASE_AVATAR_URL = "https://api.lenshub.shop";

export function getFullAvatarUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_AVATAR_URL}${url.startsWith("/") ? url : `/${url}`}`;
}
