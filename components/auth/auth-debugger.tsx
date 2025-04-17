"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase"

export default function AuthDebugger() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<"check" | "signup" | "signin">("check")

  const handleAction = async () => {
    setLoading(true)
    setResult(null)
    const supabase = createBrowserClient()

    try {
      let response

      if (action === "check") {
        // Check if user exists
        response = await supabase.auth.getUser()
        setResult({
          action: "Check current user",
          success: !response.error,
          user: response.data?.user || null,
          error: response.error,
        })
      } else if (action === "signup") {
        // Try to sign up
        response = await supabase.auth.signUp({
          email,
          password,
        })
        setResult({
          action: "Sign up",
          success: !response.error,
          user: response.data?.user || null,
          session: response.data?.session || null,
          error: response.error,
        })
      } else if (action === "signin") {
        // Try to sign in
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        setResult({
          action: "Sign in",
          success: !response.error,
          user: response.data?.user || null,
          session: response.data?.session || null,
          error: response.error,
        })
      }
    } catch (error: any) {
      setResult({
        action,
        success: false,
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50 mb-6">
      <h2 className="text-lg font-semibold mb-4">Authentication Debugger</h2>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="action"
                checked={action === "check"}
                onChange={() => setAction("check")}
              />
              <span className="ml-2">Check Current User</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="action"
                checked={action === "signup"}
                onChange={() => setAction("signup")}
              />
              <span className="ml-2">Sign Up</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="action"
                checked={action === "signin"}
                onChange={() => setAction("signin")}
              />
              <span className="ml-2">Sign In</span>
            </label>
          </div>
        </div>

        {(action === "signup" || action === "signin") && (
          <>
            <div>
              <label htmlFor="debug-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="debug-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="debug-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="debug-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleAction}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Run Test"}
      </button>

      {result && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Result:</h3>
          <div className="bg-white p-3 rounded border overflow-auto max-h-80">
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
