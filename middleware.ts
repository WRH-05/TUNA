import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  try {
    console.log(`[Middleware] Processing request for: ${req.nextUrl.pathname}`)

    // Create a Supabase client for the middleware
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log(`[Middleware] Session check result: ${session ? "Session found" : "No session"}`)

    // Define protected and auth routes
    const isProtectedRoute =
      !req.nextUrl.pathname.startsWith("/auth") &&
      !req.nextUrl.pathname.startsWith("/debug") &&
      !req.nextUrl.pathname.startsWith("/_next") &&
      !req.nextUrl.pathname.startsWith("/api/public") &&
      req.nextUrl.pathname !== "/favicon.ico"

    const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")

    // Handle protected routes (redirect to login if no session)
    if (isProtectedRoute && !session) {
      console.log(`[Middleware] Redirecting to login from protected route: ${req.nextUrl.pathname}`)
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/auth/login"
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Handle auth routes (redirect to home if session exists)
    if (isAuthRoute && session) {
      console.log(`[Middleware] Redirecting to home from auth route: ${req.nextUrl.pathname}`)
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/"
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("[Middleware] Error:", error)

    // For debugging purposes, redirect to debug page on error
    // In production, you might want to handle this differently
    const debugUrl = req.nextUrl.clone()
    debugUrl.pathname = "/debug/middleware"
    debugUrl.searchParams.set("redirected", "true")
    debugUrl.searchParams.set("error", "middleware_error")
    return NextResponse.redirect(debugUrl)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
