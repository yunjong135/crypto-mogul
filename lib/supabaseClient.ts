import { createClient } from "@supabase/supabase-js"

// TODO: Replace with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xvlauaftjhrmrhlipgak.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bGF1YWZ0amhybXJobGlwZ2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzQ1ODMsImV4cCI6MjA3MjY1MDU4M30.o7ABAA8bKhB5aK324MeA3PtcqgsrakJW1sgsOk42hjA"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
