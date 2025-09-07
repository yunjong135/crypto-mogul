import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()
  
  try {
    const supabase = await createClient()
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1)
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      console.error("Database health check failed:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: error.message,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }
    
    // Log slow queries
    if (responseTime > 300) {
      console.warn(`Slow database query detected: ${responseTime}ms`)
    }
    
    return NextResponse.json({
      status: "healthy",
      message: "Database connection successful",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SNAILSUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SNAILSUPABASE_ANON_KEY
      }
    })
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("Database health check exception:", error)
    
    return NextResponse.json(
      {
        status: "error",
        message: "Database health check failed with exception",
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}