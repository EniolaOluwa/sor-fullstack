import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/auth/constants";

/**
 * Optimistic check only: redirects visitors with no session cookie away from
 * /admin. The real authorization lives in the admin layout and in
 * `requireAdmin()` on every mutation.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!isLoginPage && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
