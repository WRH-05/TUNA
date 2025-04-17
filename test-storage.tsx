"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase"

export default function TestStorage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to upload files")
      }

      // Create a unique file path
      const filePath = `${user.id}/${Date.now()}_${file.name}`

      // Upload the file
      const { error: uploadError, data } = await supabase.storage.from("captures").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      // Get a signed URL for the uploaded file
      const {
        data: { signedUrl },
      } = await supabase.storage.from("captures").createSignedUrl(filePath, 60 * 60) // 1 hour expiry

      setUploadedUrl(signedUrl || null)
    } catch (err: any) {
      console.error("Error uploading file:", err)
      setError(err.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Test Storage Bucket</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a file to upload</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}

      {uploadedUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Upload Successful!</h2>
          <div className="p-3 bg-green-50 text-green-700 rounded-md mb-2">File uploaded successfully</div>
          <div className="mt-2">
            <img
              src={uploadedUrl || "/placeholder.svg"}
              alt="Uploaded file"
              className="max-w-full h-auto rounded-md border"
            />
          </div>
        </div>
      )}
    </div>
  )
}
