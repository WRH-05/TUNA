import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// For server actions and API routes that need to bypass RLS
export const createServiceRoleClient = () => {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
