import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    const captureId = params.id

    // First, get the capture to check ownership and get the image path
    const { data: capture, error: fetchError } = await supabase
      .from("captures")
      .select("*")
      .eq("id", captureId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !capture) {
      return NextResponse.json({ error: "Capture not found" }, { status: 404 })
    }

    // Delete the image from storage if it exists
    if (capture.image_path) {
      const { error: storageError } = await supabase.storage.from("captures").remove([capture.image_path])

      if (storageError) {
        console.error("Error deleting image:", storageError)
        // Continue with deletion of database record even if storage deletion fails
      }
    }

    // Delete the capture record
    const { error: deleteError } = await supabase.from("captures").delete().eq("id", captureId).eq("user_id", userId)

    if (deleteError) {
      console.error("Error deleting capture:", deleteError)
      return NextResponse.json({ error: "Failed to delete capture" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
