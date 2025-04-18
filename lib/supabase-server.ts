"user server"

import { cookies } from "next/headers"
import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// For server components (e.g. app/page.tsx, app/layout.tsx)
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// For route handlers (e.g. app/api/*/route.ts)
export function createServiceRoleClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
}
