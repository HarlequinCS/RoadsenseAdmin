import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/verify-admin";
import { SESSION_COOKIE } from "@/lib/server/session";

const ADMIN_PREFIXES = [
  "/dashboard",
  "/reports",
  "/map",
  "/users",
  "/analytics",
  "/activity",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isAdminRoute) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const admin = await verifyAdminRequest(
      token ? `Bearer ${token}` : null
    );

    if (!admin) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set(
        "error",
        token ? "unauthorized" : "session_expired"
      );
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reports/:path*",
    "/map/:path*",
    "/users/:path*",
    "/analytics/:path*",
    "/activity/:path*",
  ],
};
