export type E2eeLevel = "PUBLIC" | "SENSITIVE" | "CRITICAL";

type RouteRule = {
  method: string;
  path: RegExp;
  level: Exclude<E2eeLevel, "PUBLIC">;
};

const rules: RouteRule[] = [
  {
    method: "POST",
    path: /^\/auth\/(login|google|register|forgot-password|reset-password|change-password|change-email)$/,
    level: "CRITICAL",
  },
  { method: "POST", path: /^\/ekyc\/(submit|ocr-preview)$/, level: "CRITICAL" },
  {
    method: "PUT",
    path: /^\/admin\/ekyc\/\d+\/(approve|reject)$/,
    level: "CRITICAL",
  },
  {
    method: "POST",
    path: /^\/rentals\/\d+\/contract\/(send-otp|sign)$/,
    level: "CRITICAL",
  },
  {
    method: "POST",
    path: /^\/rentals\/staff\/\d+\/(prepare|handover-report|collect-deposit|handover|return-report|complete)$/,
    level: "CRITICAL",
  },
  { method: "POST", path: /^\/rentals\/admin\/devices$/, level: "SENSITIVE" },
  {
    method: "PUT",
    path: /^\/rentals\/admin\/devices\/\d+$/,
    level: "SENSITIVE",
  },
  {
    method: "PATCH",
    path: /^\/rentals\/admin\/devices\/\d+\/status$/,
    level: "SENSITIVE",
  },
  {
    method: "DELETE",
    path: /^\/rentals\/admin\/devices\/\d+$/,
    level: "SENSITIVE",
  },
  { method: "GET", path: /^\/profile$/, level: "SENSITIVE" },
  { method: "PUT", path: /^\/profile$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/addresses$/, level: "SENSITIVE" },
  { method: "PUT", path: /^\/addresses\/\d+$/, level: "SENSITIVE" },
  { method: "DELETE", path: /^\/addresses\/\d+$/, level: "SENSITIVE" },
  { method: "PATCH", path: /^\/addresses\/\d+\/default$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/addresses\/user\/\d+$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/addresses\/\d+\/user\/\d+$/, level: "CRITICAL" },
  {
    method: "DELETE",
    path: /^\/addresses\/\d+\/user\/\d+$/,
    level: "CRITICAL",
  },
  {
    method: "PATCH",
    path: /^\/addresses\/\d+\/default\/user\/\d+$/,
    level: "CRITICAL",
  },
  { method: "POST", path: /^\/rentals\/checkout$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/orders\/checkout$/, level: "SENSITIVE" },
  { method: "POST", path: /^\/orders\/checkout\/carts$/, level: "SENSITIVE" },
  {
    method: "POST",
    path: /^\/orders\/my\/\d+\/confirm-received$/,
    level: "SENSITIVE",
  },
  { method: "PATCH", path: /^\/orders\/\d+\/status$/, level: "CRITICAL" },
  { method: "POST", path: /^\/payments\/vnpay\/create$/, level: "SENSITIVE" },
  {
    method: "POST",
    path: /^\/payments\/vnpay\/rental-fee\/create$/,
    level: "SENSITIVE",
  },
  { method: "POST", path: /^\/support\/tickets$/, level: "SENSITIVE" },
  {
    method: "PUT",
    path: /^\/admin\/support\/tickets\/\d+\/(status|reply)$/,
    level: "SENSITIVE",
  },
  {
    method: "PUT",
    path: /^\/inventory\/products\/\d+\/stock$/,
    level: "SENSITIVE",
  },
  {
    method: "PUT",
    path: /^\/inventory\/products\/\d+\/stock\/(sale|rental)$/,
    level: "SENSITIVE",
  },
  { method: "POST", path: /^\/roles$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/roles\/\d+$/, level: "CRITICAL" },
  { method: "DELETE", path: /^\/roles\/\d+$/, level: "CRITICAL" },
  { method: "POST", path: /^\/roles\/\d+\/permissions$/, level: "CRITICAL" },
  { method: "POST", path: /^\/permissions$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/permissions\/\d+$/, level: "CRITICAL" },
  { method: "DELETE", path: /^\/permissions\/\d+$/, level: "CRITICAL" },
  { method: "GET", path: /^\/users$/, level: "CRITICAL" },
  { method: "GET", path: /^\/users\/deleted$/, level: "CRITICAL" },
  { method: "GET", path: /^\/users\/\d+$/, level: "CRITICAL" },
  { method: "GET", path: /^\/users\/\d+\/profile$/, level: "CRITICAL" },
  { method: "POST", path: /^\/users$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/users\/\d+$/, level: "CRITICAL" },
  { method: "PATCH", path: /^\/users\/\d+\/status$/, level: "CRITICAL" },
  { method: "DELETE", path: /^\/users\/\d+$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/users\/\d+\/restore$/, level: "CRITICAL" },
  { method: "DELETE", path: /^\/users$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/users\/restore$/, level: "CRITICAL" },
  { method: "PUT", path: /^\/users\/\d+\/profile$/, level: "CRITICAL" },
  {
    method: "PUT",
    path: /^\/users\/\d+\/(reset-password|lock|unlock)$/,
    level: "CRITICAL",
  },
];

export function normalizeApiPath(pathname: string) {
  return pathname.startsWith("/api/") ? pathname.slice(4) : pathname;
}

export function resolveE2eeLevel(method: string, pathname: string): E2eeLevel {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = normalizeApiPath(pathname);
  return (
    rules.find(
      (rule) =>
        rule.method === normalizedMethod && rule.path.test(normalizedPath),
    )?.level ?? "PUBLIC"
  );
}

export function shouldEncryptRequest(method: string, pathname: string) {
  return resolveE2eeLevel(method, pathname) !== "PUBLIC";
}
