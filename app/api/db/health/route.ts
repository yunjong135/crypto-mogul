import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SNAILSUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SNAILSUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        ok: false,
        error: "Missing Supabase credentials",
        env_check: {
          supabase_url: !!supabaseUrl,
          supabase_key: !!supabaseKey,
          expected_vars: [
            "NEXT_PUBLIC_SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY", 
            "NEXT_PUBLIC_SNAILSUPABASE_URL",
            "NEXT_PUBLIC_SNAILSUPABASE_ANON_KEY"
          ]
        }
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        ok: false,
        error: "Database connection failed",
        details: connectionError.message,
        code: connectionError.code,
        hint: connectionError.hint
      }, { status: 500 })
    }

    // Test all required tables exist
    const tables = ['users', 'bets', 'purchases', 'leaderboard_view', 'stocks']
    const tableChecks = await Promise.allSettled(
      tables.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        return { table, exists: !error, error: error?.message }
      })
    )

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      ok: true,
      response_time_ms: responseTime,
      connection: "healthy",
      tables: tableChecks.map((result, index) => ({
        table: tables[index],
        ...(result.status === 'fulfilled' ? result.value : { exists: false, error: result.reason })
      })),
      env_vars: {
        supabase_url_configured: !!supabaseUrl,
        supabase_key_configured: !!supabaseKey,
        url_prefix: supabaseUrl?.substring(0, 20) + "..."
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      ok: false,
      error: "Health check failed",
      details: error instanceof Error ? error.message : String(error),
      response_time_ms: responseTime,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}