import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const { url, timestamp, imageBlob, textContent } = body

    if (!url || !timestamp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a unique path for the image
    const imagePath = `${userId}/${Date.now()}_${timestamp}.jpg`

    // Upload the image to Supabase Storage
    if (imageBlob) {
      // Convert base64 to blob
      const base64Data = imageBlob.split(",")[1]
      const buffer = Buffer.from(base64Data, "base64")

      // Upload to storage
      const { error: uploadError } = await supabase.storage.from("captures").upload(imagePath, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      })

      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
      }
    }

    // Insert the capture metadata into the database
    const { data, error } = await supabase
      .from("captures")
      .insert({
        user_id: userId,
        url,
        timestamp,
        text_content: textContent ? JSON.parse(textContent) : null,
        image_path: imageBlob ? imagePath : null,
      })
      .select()

    if (error) {
      console.error("Error inserting capture:", error)
      return NextResponse.json({ error: "Failed to save capture" }, { status: 500 })
    }

    return NextResponse.json({ success: true, capture: data[0] })
  } catch (error) {
    console.error("Capture API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
