import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      console.log("Middleware: Session found for user", session.user.id);
    } else {
      console.log("Middleware: No session found");
    }

    const isProtectedRoute =
      !req.nextUrl.pathname.startsWith("/auth") &&
      !req.nextUrl.pathname.startsWith("/_next") &&
      !req.nextUrl.pathname.startsWith("/api/public") &&
      req.nextUrl.pathname !== "/favicon.ico";

    const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");

    if (isProtectedRoute && !session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }

    if (isProtectedRoute && session) {
      const redirectedFrom = req.nextUrl.searchParams.get("redirectedFrom") || "/";
      return NextResponse.redirect(new URL(redirectedFrom, req.url));
    }

    if (isAuthRoute && session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
