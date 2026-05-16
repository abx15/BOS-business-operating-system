import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("userRole")?.value;

  // Public routes — no auth needed
  const PUBLIC = ["/", "/login"];
  const isPublic = PUBLIC.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // Static/API — skip
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Not logged in → allow public, block protected
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in → redirect from login page only
  if (token && pathname === "/login") {
    if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin", request.url));
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based protection
  if (token && role === "COMPANY_ADMIN" && pathname.startsWith("/super-admin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (token && role === "SUPER_ADMIN" && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
