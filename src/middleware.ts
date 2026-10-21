import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

function claimResponse() {
  const response = NextResponse.next();
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

const adminAuth = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Prevent infinite redirects by ensuring we don't redirect from login page
    if (pathname === "/admin" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow access to the login page
        if (pathname === "/admin") {
          return true;
        }

        // Require authentication for protected admin routes
        if (pathname.startsWith("/admin/")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  if (pathname === "/claim" || pathname.startsWith("/claim/")) {
    return claimResponse();
  }
  return adminAuth(req as NextRequestWithAuth, event);
}

export const config = {
  matcher: ["/admin/:path*", "/claim", "/claim/:path*"],
};
