import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const sampleStocks = [
  { symbol: "SNAIL", name: "Snail Racing Corp", price: 125.50, change_24h: 2.30, change_percent_24h: 1.87, volatility: 15.2, dividend_yield: 2.1 },
  { symbol: "RACE", name: "Race Track Inc", price: 89.75, change_24h: -1.25, change_percent_24h: -1.37, volatility: 22.8, dividend_yield: 1.5 },
  { symbol: "SPEED", name: "Speed Demon Ltd", price: 156.20, change_24h: 4.80, change_percent_24h: 3.17, volatility: 18.5, dividend_yield: 2.8 },
  { symbol: "TURBO", name: "Turbo Snail Co", price: 78.90, change_24h: 0.45, change_percent_24h: 0.57, volatility: 12.3, dividend_yield: 3.2 },
  { symbol: "FAST", name: "Fast Track Corp", price: 203.15, change_24h: -3.20, change_percent_24h: -1.55, volatility: 25.1, dividend_yield: 1.8 },
  { symbol: "SLOW", name: "Slow & Steady Inc", price: 45.60, change_24h: 0.80, change_percent_24h: 1.78, volatility: 8.9, dividend_yield: 4.5 }
]

export async function POST() {
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

    // Check if stocks table exists
    const { error: tableCheckError } = await supabase
      .from('stocks')
      .select('*')
      .limit(1)

    if (tableCheckError) {
      return NextResponse.json({
        ok: false,
        error: "Stocks table does not exist",
        details: tableCheckError.message,
        suggestion: "Run the SQL migration to create the stocks table first"
      }, { status: 400 })
    }

    // Clear existing stocks
    const { error: deleteError } = await supabase
      .from('stocks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.warn("Could not clear existing stocks:", deleteError.message)
    }

    // Insert sample stocks
    const { data, error } = await supabase
      .from('stocks')
      .insert(sampleStocks)
      .select()

    if (error) {
      return NextResponse.json({
        ok: false,
        error: "Failed to insert sample stocks",
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: "Sample stocks seeded successfully",
      count: data?.length || 0,
      stocks: data
    })

  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Seed operation failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
