"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SessionDebugger from "@/components/auth/session-debugger"

export default function MiddlewareDebugPage() {
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [redirectCount, setRedirectCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Record this page visit
    setNavigationHistory((prev) => [...prev, `${new Date().toISOString()} - Loaded middleware debug page`])

    // Check if we were redirected here
    const urlParams = new URLSearchParams(window.location.search)
    const redirected = urlParams.get("redirected")

    if (redirected) {
      setRedirectCount((prev) => prev + 1)
      setNavigationHistory((prev) => [...prev, `${new Date().toISOString()} - Redirected to debug page`])
    }
  }, [])

  const testProtectedRoute = () => {
    setNavigationHistory((prev) => [...prev, `${new Date().toISOString()} - Attempting to navigate to protected route`])
    router.push("/")
  }

  const testAuthRoute = () => {
    setNavigationHistory((prev) => [...prev, `${new Date().toISOString()} - Attempting to navigate to auth route`])
    router.push("/auth/login")
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Middleware Debug Page</h1>

      <div className="mb-8">
        <SessionDebugger />
      </div>

      <div className="mb-8 p-4 bg-white rounded-md shadow">
        <h2 className="text-xl font-semibold mb-4">Test Navigation</h2>
        <div className="flex space-x-4">
          <button
            onClick={testProtectedRoute}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test Protected Route
          </button>
          <button onClick={testAuthRoute} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Test Auth Route
          </button>
        </div>
      </div>

      <div className="mb-8 p-4 bg-white rounded-md shadow">
        <h2 className="text-xl font-semibold mb-4">Navigation History</h2>
        {redirectCount > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md">
            Detected {redirectCount} redirect(s) to this page
          </div>
        )}
        <ul className="list-disc pl-5 space-y-1">
          {navigationHistory.map((entry, index) => (
            <li key={index} className="text-sm">
              {entry}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-white rounded-md shadow">
        <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
          {JSON.stringify(
            {
              userAgent: navigator.userAgent,
              cookiesEnabled: navigator.cookieEnabled,
              language: navigator.language,
              doNotTrack: navigator.doNotTrack,
              url: window.location.href,
              referrer: document.referrer || "None",
            },
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  )
}
