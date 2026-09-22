import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/workspace", "/invite"];
// Routes only for unauthenticated users
const AUTH_ROUTES = ["/login", "/register"];

// Presence of this marker cookie signals an active session.
//
// We can't read the real refresh token here: it's an httpOnly cookie owned by
// the API domain (tatalaku-services.up.railway.app), which is a different site
// from the web app and unshareable because up.railway.app is a public suffix.
// Instead we read a non-sensitive marker set on the web domain after login.
// This is only a routing hint — the API still validates the real token and
// rejects stale sessions with 401.
const SESSION_COOKIE = "tatalaku_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
