import { createClient } from "@supabase/supabase-js"

// These environment variables are automatically available from the Supabase integration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a single supabase client for the browser
export const createBrowserClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Create a client with the service role key for server operations
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase server environment variables")
    throw new Error("Missing Supabase server environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
