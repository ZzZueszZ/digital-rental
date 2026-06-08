export type E2eeLevel = "PUBLIC" | "SENSITIVE" | "CRITICAL";

type RouteRule = {
  method: string;
  path: RegExp;
  level: Exclude<E2eeLevel, "PUBLIC">;
};

const rules: RouteRule[] = [
  { method: "POST", path: /^\/auth\/(login|register|forgot-password|reset-password|change-password|change-email)$/, level: "CRITICAL" },
  { method: "POST", path: /^\/ekyc\/(submit|ocr-preview)$/, level: "CRITICAL" },
  { method: "POST", path: /^\/rentals\/\d+\/contract\/sign$/, level: "CRITICAL" },
  { method: "POST", path: /^\/rentals\/staff\/\d+\/(handover-report|return-report)$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/profile$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/addresses$/, level: "SENSITIVE" },
  { method: "PUT", path: /^\/addresses\/\d+$/, level: "SENSITIVE" },
  { method: "DELETE", path: /^\/addresses\/\d+$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/rentals\/checkout$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/orders\/checkout$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/orders\/checkout\/carts$/, level: "SENSITIVE" },
  { method: "PUT", path: /^\/inventory\/products\/\d+\/stock$/, level: "SENSITIVE" },
  { method: "PUT", path: /^\/inventory\/products\/\d+\/stock\/(sale|rental)$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/roles$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/roles\/\d+$/, level: "CRITICAL" },
  { method: "POST", path: /^\/roles\/\d+\/permissions$/, level: "CRITICAL" },
  { method: "POST", path: /^\/permissions$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/permissions\/\d+$/, level: "CRITICAL" },
  { method: "POST", path: /^\/users$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/users\/\d+$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/users\/\d+\/(reset-password|lock|unlock)$/, level: "CRITICAL" },
];

export function normalizeApiPath(pathname: string) {
  return pathname.startsWith("/api/") ? pathname.slice(4) : pathname;
}

export function resolveE2eeLevel(method: string, pathname: string): E2eeLevel {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = normalizeApiPath(pathname);
  return rules.find((rule) => rule.method === normalizedMethod && rule.path.test(normalizedPath))?.level ?? "PUBLIC";
}

export function shouldEncryptRequest(method: string, pathname: string) {
  return resolveE2eeLevel(method, pathname) !== "PUBLIC";
}
