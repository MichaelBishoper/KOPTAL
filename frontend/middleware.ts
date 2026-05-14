import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRoleFromRequestCookies } from "@/lib/cookies/server";

function requiredRoleForPath(pathname: string): "customer" | "tennant" | "admin" | null {
  if (pathname.startsWith("/customer")) return "customer";
  if (pathname.startsWith("/tennant")) return "tennant";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRole = requiredRoleForPath(pathname);

  if (!requiredRole) return NextResponse.next();

  const currentRole = getRoleFromRequestCookies(request);
  if (currentRole === requiredRole) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/customer/:path*", "/tennant/:path*", "/admin/:path*"],
};