import { NextResponse, type NextRequest } from "next/server";
import { PRIVATE_ROUTE_PREFIXES } from "@/lib/seo";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  if (PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/super-admin/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/auth/:path*",
    "/api/:path*",
  ],
};
