"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createBrowserClient } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  authError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)

  // Initialize Supabase client
  useEffect(() => {
    try {
      console.log("Initializing Supabase client...")
      const client = createBrowserClient()
      setSupabase(client)
      console.log("Supabase client initialized successfully")
    } catch (error: any) {
      console.error("Failed to initialize Supabase client:", error)
      setAuthError(error.message)
      setIsLoading(false)
    }
  }, [])

  // Set up auth state listener
  useEffect(() => {
    if (!supabase) return

    const initAuth = async () => {
      try {
        console.log("Checking initial session...")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          setAuthError(error.message)
        } else {
          console.log("Session check result:", data.session ? "Session found" : "No session")
          setSession(data.session)
          setUser(data.session?.user ?? null)
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error)
        setAuthError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session")
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      console.log("Cleaning up auth listener")
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    setAuthError(null)
    if (!supabase) {
      const error = new Error("Supabase client not initialized")
      console.error(error)
      setAuthError(error.message)
      throw error
    }

    console.log("Attempting to sign in with email:", email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error("Sign in error:", error)
        setAuthError(error.message)
        throw error
      }

      console.log("Sign in successful:", data.user?.id)
      return data
    } catch (error: any) {
      console.error("Sign in exception:", error)
      setAuthError(error.message)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    setAuthError(null)
    if (!supabase) {
      const error = new Error("Supabase client not initialized")
      console.error(error)
      setAuthError(error.message)
      throw error
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        console.error("Sign up error:", error)
        setAuthError(error.message)
        throw error
      }

      return data
    } catch (error: any) {
      console.error("Sign up exception:", error)
      setAuthError(error.message)
      throw error
    }
  }

  const signOut = async () => {
    setAuthError(null)
    if (!supabase) {
      const error = new Error("Supabase client not initialized")
      console.error(error)
      setAuthError(error.message)
      throw error
    }

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
        setAuthError(error.message)
        throw error
      }
    } catch (error: any) {
      console.error("Sign out exception:", error)
      setAuthError(error.message)
      throw error
    }
  }

  // Provide a default context when Supabase is not initialized
  if (!supabase) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          session: null,
          isLoading: false,
          signIn: async () => {
            throw new Error("Supabase client not initialized")
          },
          signUp: async () => {
            throw new Error("Supabase client not initialized")
          },
          signOut: async () => {
            throw new Error("Supabase client not initialized")
          },
          authError,
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut, authError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
