import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // Get auth settings
    const { data: authSettings, error: authError } = await supabase.rpc("get_auth_settings")

    if (authError) {
      return NextResponse.json(
        {
          error: "Failed to fetch auth settings",
          details: authError,
        },
        { status: 500 },
      )
    }

    // Get list of users (without sensitive info)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      return NextResponse.json(
        {
          error: "Failed to fetch users",
          details: usersError,
        },
        { status: 500 },
      )
    }

    // Return sanitized data
    return NextResponse.json({
      authSettings: {
        // Only include non-sensitive settings
        emailConfirmationRequired: authSettings?.email_confirmation_required || false,
        enableSignup: authSettings?.enable_signup || false,
        authProviders: authSettings?.auth_providers || [],
      },
      userCount: users?.users?.length || 0,
      // Don't return actual user data for security
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to check auth configuration",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
