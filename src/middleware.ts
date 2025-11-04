import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    console.log(`Middleware: ${pathname}, token: ${!!req.nextauth.token}`);
    
    // Prevent infinite redirects by ensuring we don't redirect from login page
    if (pathname === "/admin" && req.nextauth.token) {
      console.log("User has token but on login page, redirecting to dashboard");
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        console.log(`Authorization check: ${pathname}, token: ${!!token}`);
        
        // Always allow access to the login page
        if (pathname === "/admin") {
          return true;
        }
        
        // Require authentication for protected admin routes
        if (pathname.startsWith("/admin/")) {
          const isAuthorized = !!token;
          console.log(`Protected route ${pathname}: ${isAuthorized ? 'authorized' : 'unauthorized'}`);
          return isAuthorized;
        }
        
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
