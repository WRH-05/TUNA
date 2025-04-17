import { NextResponse } from "next/server"

export async function GET() {
  // Check environment variables
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
    SUPABASE_URL: process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
  }

  // Don't return the actual values for security reasons
  return NextResponse.json({
    status: "Environment variables check",
    variables: envVars,
    note: "This endpoint only shows if variables are set, not their values",
  })
}
