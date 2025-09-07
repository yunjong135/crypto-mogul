import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SNAILSUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SNAILSUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        ok: false,
        error: "Missing Supabase credentials"
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })

    // Get table schemas
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_schemas', { schema_name: 'public' })
      .catch(() => ({ data: null, error: { message: "RPC function not available" } }))

    // Fallback: test each table structure
    const expectedTables = {
      users: ['id', 'tg_user_id', 'username', 'balance', 'snail_accumulated', 'created_at'],
      bets: ['id', 'user_id', 'choice', 'amount', 'server_seed', 'nonce', 'commit_hash', 'revealed', 'winner', 'payout', 'started_at', 'resolved_at'],
      purchases: ['id', 'user_id', 'stars_amount', 'game_money', 'tg_payment_id', 'created_at'],
      stocks: ['id', 'symbol', 'name', 'price', 'change_24h', 'change_percent_24h', 'volatility', 'dividend_yield', 'last_price_at', 'created_at', 'updated_at']
    }

    const schemaChecks = await Promise.allSettled(
      Object.entries(expectedTables).map(async ([table, expectedColumns]) => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          return {
            table,
            exists: false,
            error: error.message,
            expected_columns: expectedColumns
          }
        }

        // Check if we can get column info (limited in anon context)
        return {
          table,
          exists: true,
          accessible: true,
          expected_columns: expectedColumns,
          sample_data_keys: data && data.length > 0 ? Object.keys(data[0]) : []
        }
      })
    )

    // Test leaderboard view
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('leaderboard_view')
      .select('*')
      .limit(1)

    return NextResponse.json({
      ok: true,
      schema_check: {
        tables: schemaChecks.map((result, index) => ({
          ...(result.status === 'fulfilled' ? result.value : { 
            table: Object.keys(expectedTables)[index], 
            exists: false, 
            error: result.reason 
          })
        })),
        leaderboard_view: {
          exists: !leaderboardError,
          error: leaderboardError?.message,
          sample_keys: leaderboardData && leaderboardData.length > 0 ? Object.keys(leaderboardData[0]) : []
        }
      },
      expected_schema: {
        users: {
          columns: expectedTables.users,
          constraints: ["PRIMARY KEY (id)", "UNIQUE (tg_user_id)", "DEFAULT balance = 10000"]
        },
        bets: {
          columns: expectedTables.bets,
          constraints: ["PRIMARY KEY (id)", "FOREIGN KEY (user_id) REFERENCES users(id)", "CHECK (choice IN ('S','R','G'))"]
        },
        purchases: {
          columns: expectedTables.purchases,
          constraints: ["PRIMARY KEY (id)", "FOREIGN KEY (user_id) REFERENCES users(id)", "UNIQUE (tg_payment_id)"]
        },
        stocks: {
          columns: expectedTables.stocks,
          constraints: ["PRIMARY KEY (id)", "UNIQUE (symbol)"]
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Schema check failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}