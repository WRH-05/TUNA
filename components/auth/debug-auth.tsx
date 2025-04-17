"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase"

export default function DebugAuth() {
  const [status, setStatus] = useState<string>("Not checked")
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    try {
      setStatus("Checking...")
      setError(null)

      // Check if environment variables are defined
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Environment variables are missing")
      }

      // Try to initialize the client
      const supabase = createBrowserClient()

      // Make a simple API call to test the connection
      const { data, error } = await supabase.auth.getSession()

      if (error) throw error

      setStatus("Connection successful")
    } catch (err: any) {
      console.error("Auth debug error:", err)
      setStatus("Failed")
      setError(err.message || "Unknown error")
    }
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Authentication Debug</h2>
      <div className="mb-4">
        <p>
          Status:{" "}
          <span
            className={
              status === "Connection successful"
                ? "text-green-600"
                : status === "Checking..."
                  ? "text-blue-600"
                  : "text-red-600"
            }
          >
            {status}
          </span>
        </p>
        {error && <p className="text-red-600 mt-1">Error: {error}</p>}
      </div>
      <button onClick={checkAuth} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Test Connection
      </button>
    </div>
  )
}
