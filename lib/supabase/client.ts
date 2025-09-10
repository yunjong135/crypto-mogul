import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SNAILSUPABASE_URL!,
    process.env.NEXT_PUBLIC_SNAILSUPABASE_ANON_KEY!,
  )
}
