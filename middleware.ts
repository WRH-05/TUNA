import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  try {
    // Create a Supabase client for the middleware
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define protected and auth routes
    const isProtectedRoute =
      !req.nextUrl.pathname.startsWith("/auth") &&
      !req.nextUrl.pathname.startsWith("/_next") &&
      !req.nextUrl.pathname.startsWith("/api/public") &&
      req.nextUrl.pathname !== "/favicon.ico"

    const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")

    // Handle protected routes (redirect to login if no session)
    if (isProtectedRoute && !session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/auth/login"
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Handle auth routes (redirect to home if session exists)
    if (isAuthRoute && session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/"
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
