import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];
const SUPER_ADMIN_ROUTES = ["/super-admin"];
const COMPANY_ADMIN_ROUTES = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check auth from cookie (we'll set this on login)
  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("userRole")?.value;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Not logged in → redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in → redirect from login
  if (token && isPublic) {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based protection
  if (token && role === "COMPANY_ADMIN") {
    const isSuperRoute = SUPER_ADMIN_ROUTES.some((r) => pathname.startsWith(r));
    if (isSuperRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (token && role === "SUPER_ADMIN") {
    const isCompanyRoute = COMPANY_ADMIN_ROUTES.some((r) => pathname.startsWith(r));
    if (isCompanyRoute) {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
