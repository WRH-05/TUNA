"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, authError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectedFrom") || "/"

  // Log any auth errors to the console for debugging
  useEffect(() => {
    if (authError) {
      console.error("Auth error from context:", authError)
    }
  }, [authError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    console.log("Login attempt started for:", email)

    try {
      // Capture the start time to measure how long the process takes
      const startTime = performance.now()

      // Attempt to sign in
      const result = await signIn(email, password)

      const endTime = performance.now()
      console.log(`Login process completed in ${Math.round(endTime - startTime)}ms`)

      // Store debug info
      setDebugInfo({
        success: true,
        processingTime: Math.round(endTime - startTime),
        result,
      })

      console.log("Login successful, redirecting to:", redirectTo)
      router.push(redirectTo)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Failed to sign in")

      // Capture detailed error information
      setDebugInfo({
        success: false,
        error: {
          message: err.message,
          name: err.name,
          code: err.code,
          stack: err.stack,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        </div>

        {(error || authError) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error || authError}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>

        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <details>
              <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
              <pre className="mt-2 text-xs overflow-auto max-h-60">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
