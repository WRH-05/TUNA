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
      const client = createBrowserClient()
      setSupabase(client)
    } catch (error: any) {
      setAuthError(error.message)
      setIsLoading(false)
    }
  }, [])

  // Set up auth state listener
  useEffect(() => {
    if (!supabase) return;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setAuthError(error.message);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error: any) {
        setAuthError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    setAuthError(null)
    if (!supabase) {
      const error = new Error("Supabase client not initialized")
      setAuthError(error.message)
      throw error
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setAuthError(error.message)
        throw error
      }

      return data
    } catch (error: any) {
      setAuthError(error.message)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    setAuthError(null)
    if (!supabase) {
      const error = new Error("Supabase client not initialized")
      setAuthError(error.message)
      throw error
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        setAuthError(error.message)
        throw error
      }

      return data
    } catch (error: any) {
      setAuthError(error.message)
      throw error
    }
  }

  const signOut = async () => {
    setAuthError(null)
    if (!supabase) {
      const error = new Error("Supabase client not initialized")
      setAuthError(error.message)
      throw error
    }

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setAuthError(error.message)
        throw error
      }
    } catch (error: any) {
      setAuthError(error.message)
      throw error
    }
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
