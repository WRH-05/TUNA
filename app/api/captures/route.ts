import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const url = request.nextUrl.searchParams.get("url")

    // Query captures for the current user
    let query = supabase.from("captures").select("*").eq("user_id", userId).order("created_at", { ascending: false })

    // Filter by URL if provided
    if (url) {
      query = query.eq("url", url)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching captures:", error)
      return NextResponse.json({ error: "Failed to fetch captures" }, { status: 500 })
    }

    // Get signed URLs for images
    const capturesWithUrls = await Promise.all(
      data.map(async (capture) => {
        if (capture.image_path) {
          const { data: signedUrl } = await supabase.storage
            .from("captures")
            .createSignedUrl(capture.image_path, 60 * 60) // 1 hour expiry

          return {
            ...capture,
            imageUrl: signedUrl?.signedUrl,
          }
        }
        return capture
      }),
    )

    return NextResponse.json({ captures: capturesWithUrls })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
