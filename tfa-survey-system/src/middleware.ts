import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Login page is always accessible
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    // If already authenticated, redirect to dashboard
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const user = await verifyToken(token);
      if (user) return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // All other /admin/* routes require a valid JWT
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const user = await verifyToken(token);
  if (!user) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Viewer role cannot access logic builder or user management
  if (user.role === "viewer") {
    const restricted = ["/admin/logic", "/admin/questions", "/admin/users"];
    if (restricted.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/admin/analytics", request.url));
    }
  }

  // Strategy editor cannot access user management
  if (user.role === "strategy_editor" && pathname.startsWith("/admin/users")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Forward user info to page via header (read in server components if needed)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.sub);
  requestHeaders.set("x-user-role", user.role);
  requestHeaders.set("x-user-name", user.name);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
