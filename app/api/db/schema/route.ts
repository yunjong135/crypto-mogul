import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if all expected tables exist
    const tables = ['users', 'bets', 'purchases']
    const tableChecks = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .limit(1)
        
        tableChecks[table] = {
          exists: !error,
          error: error?.message || null
        }
      } catch (err) {
        tableChecks[table] = {
          exists: false,
          error: err instanceof Error ? err.message : "Unknown error"
        }
      }
    }
    
    // Check if leaderboard_view exists
    let leaderboardViewCheck = { exists: false, error: null }
    try {
      const { data, error } = await supabase
        .from("leaderboard_view")
        .select("*")
        .limit(1)
      
      leaderboardViewCheck = {
        exists: !error,
        error: error?.message || null
      }
    } catch (err) {
      leaderboardViewCheck = {
        exists: false,
        error: err instanceof Error ? err.message : "Unknown error"
      }
    }
    
    // Test a sample user creation to verify schema constraints
    let schemaTest = { passed: false, error: null }
    try {
      const testUserId = `test_${Date.now()}`
      const { data, error } = await supabase
        .from("users")
        .insert({
          tg_user_id: testUserId,
          username: "Schema Test User",
          balance: 10000,
          snail_accumulated: 0
        })
        .select()
        .single()
      
      if (!error && data) {
        // Clean up test user
        await supabase.from("users").delete().eq("id", data.id)
        schemaTest = { passed: true, error: null }
      } else {
        schemaTest = { passed: false, error: error?.message || "Unknown error" }
      }
    } catch (err) {
      schemaTest = {
        passed: false,
        error: err instanceof Error ? err.message : "Unknown error"
      }
    }
    
    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      tables: tableChecks,
      views: {
        leaderboard_view: leaderboardViewCheck
      },
      schemaTest,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SNAILSUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SNAILSUPABASE_ANON_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SNAILSUPABASE_URL ? 
          process.env.NEXT_PUBLIC_SNAILSUPABASE_URL.substring(0, 30) + "..." : 
          "Not set"
      }
    })
    
  } catch (error) {
    console.error("Schema check failed:", error)
    
    return NextResponse.json(
      {
        status: "error",
        message: "Schema check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}