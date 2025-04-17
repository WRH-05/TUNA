"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"

export default function SessionDebugger() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [cookieData, setCookieData] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkSession = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      setSessionData(data)

      // Get cookie information (without values for security)
      const cookies = document.cookie.split(";").map((cookie) => {
        const [name] = cookie.trim().split("=")
        return name
      })

      setCookieData(`Found ${cookies.length} cookies: ${cookies.join(", ")}`)
    } catch (err: any) {
      console.error("Session check error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="p-4 border rounded-md bg-gray-50 mb-6">
      <h2 className="text-lg font-semibold mb-2">Session Debugger</h2>

      <div className="mb-4">
        <button
          onClick={checkSession}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Session"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">Error: {error}</div>}

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Session Status:</h3>
          <div className="bg-white p-3 rounded border">
            {sessionData ? (
              <span className={sessionData.session ? "text-green-600" : "text-yellow-600"}>
                {sessionData.session ? "Active session found" : "No active session"}
              </span>
            ) : (
              <span className="text-gray-500">Checking...</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-1">Cookies:</h3>
          <div className="bg-white p-3 rounded border">{cookieData || "No cookie data available"}</div>
        </div>

        {sessionData && sessionData.session && (
          <div>
            <h3 className="font-medium mb-1">Session Details:</h3>
            <div className="bg-white p-3 rounded border overflow-auto max-h-60">
              <pre className="text-xs">
                {JSON.stringify(
                  {
                    user_id: sessionData.session.user.id,
                    email: sessionData.session.user.email,
                    expires_at: new Date(sessionData.session.expires_at * 1000).toLocaleString(),
                    created_at: new Date(sessionData.session.created_at * 1000).toLocaleString(),
                    last_sign_in_at: sessionData.session.user.last_sign_in_at
                      ? new Date(sessionData.session.user.last_sign_in_at).toLocaleString()
                      : "N/A",
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
