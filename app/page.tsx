"use client"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import URLForm from "@/components/URLForm"
import CaptureList from "@/components/CaptureList"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch captures
  const { data: captures } = await supabase.from("captures").select("*").order("created_at", { ascending: false })

  // Get signed URLs for images
  const capturesWithUrls = await Promise.all(
    (captures || []).map(async (capture) => {
      if (capture.image_path) {
        const { data: signedUrl } = await supabase.storage.from("captures").createSignedUrl(capture.image_path, 60 * 60) // 1 hour expiry

        return {
          ...capture,
          imageUrl: signedUrl?.signedUrl,
        }
      }
      return capture
    }),
  )

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Page Capture Viewer</h1>
          <form action="/auth/signout" method="post">
            <button type="submit" className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">
              Sign Out
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter Captures</h2>
          <URLForm
            onSubmit={(url) => {
              // Client-side filtering will be handled by the client component
            }}
            buttonText="Filter"
          />
        </div>

        <CaptureList initialCaptures={capturesWithUrls} />
      </div>
    </main>
  )
}
