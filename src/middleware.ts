import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Only apply middleware to admin routes (except login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    // Get the admin auth token from cookies (we'll set this on login)
    const adminAuth = request.cookies.get("adminAuth");

    if (!adminAuth) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const authData = JSON.parse(adminAuth.value);
      const currentTime = new Date().getTime();

      if (currentTime > authData.expiresAt) {
        // Session expired, redirect to login
        const response = NextResponse.redirect(
          new URL("/admin/login", request.url)
        );
        response.cookies.delete("adminAuth");
        return response;
      }
    } catch (error) {
      // Invalid auth data, redirect to login
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete("adminAuth");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
