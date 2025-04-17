import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServiceRoleClient()

    // Get all cookies for debugging
    const allCookies = cookieStore.getAll()
    const cookieNames = allCookies.map((cookie) => cookie.name)

    // Check for session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to get session",
          error: error.message,
          cookieCount: cookieNames.length,
          cookieNames,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      hasSession: !!data.session,
      cookieCount: cookieNames.length,
      cookieNames,
      // Include minimal session info for security
      sessionInfo: data.session
        ? {
            user_id: data.session.user.id,
            expires_at: new Date(data.session.expires_at * 1000).toISOString(),
          }
        : null,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Server error checking session",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
