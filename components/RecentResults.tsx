"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface GameResult {
  winner: string
  resolved_at: string
}

interface SnailStats {
  S: number
  R: number
  G: number
  total: number
}

export default function RecentResults() {
  const [stats, setStats] = useState<SnailStats>({ S: 0, R: 0, G: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    fetchRecentResults()

    // Subscribe to realtime updates for new bets
    const subscription = supabase
      .channel("recent_results_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bets" }, () => {
        fetchRecentResults()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchRecentResults = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("bets")
        .select("winner, resolved_at")
        .not("winner", "is", null)
        .not("resolved_at", "is", null)
        .order("resolved_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Recent results fetch error:", error)
        return
      }

      const newStats = { S: 0, R: 0, G: 0, total: data?.length || 0 }

      data?.forEach((result: GameResult) => {
        if (result.winner === "S" || result.winner === "R" || result.winner === "G") {
          newStats[result.winner as keyof typeof newStats]++
        }
      })

      setStats(newStats)
    } catch (error) {
      console.error("Recent results error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPercentage = (count: number) => {
    if (stats.total === 0) return 0
    return Math.round((count / stats.total) * 100)
  }

  const getStrokeOffset = (percentage: number, startPercentage = 0) => {
    const circumference = 2 * Math.PI * 45
    const offset = circumference - (percentage / 100) * circumference
    const rotation = (startPercentage / 100) * circumference
    return { offset, rotation }
  }

  const sPercentage = getPercentage(stats.S)
  const rPercentage = getPercentage(stats.R)
  const gPercentage = getPercentage(stats.G)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">📊 Recent Results</h2>
      <p className="text-sm text-gray-600 text-center mb-6">Last {stats.total} games</p>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading results...</p>
        </div>
      ) : stats.total === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No games played yet!</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />

              {/* S snail segment (orange) */}
              {sPercentage > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="10"
                  strokeDasharray={`${(sPercentage / 100) * 283} 283`}
                  strokeDashoffset="0"
                  className="transition-all duration-500"
                />
              )}

              {/* R snail segment (blue) */}
              {rPercentage > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="10"
                  strokeDasharray={`${(rPercentage / 100) * 283} 283`}
                  strokeDashoffset={`-${(sPercentage / 100) * 283}`}
                  className="transition-all duration-500"
                />
              )}

              {/* G snail segment (green) */}
              {gPercentage > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="10"
                  strokeDasharray={`${(gPercentage / 100) * 283} 283`}
                  strokeDashoffset={`-${((sPercentage + rPercentage) / 100) * 283}`}
                  className="transition-all duration-500"
                />
              )}
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="text-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
              <div className="font-bold text-lg text-gray-800">{sPercentage}%</div>
              <div className="text-sm text-gray-600">S ({stats.S})</div>
            </div>

            <div className="text-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto mb-2"></div>
              <div className="font-bold text-lg text-gray-800">{rPercentage}%</div>
              <div className="text-sm text-gray-600">R ({stats.R})</div>
            </div>

            <div className="text-center">
              <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-2"></div>
              <div className="font-bold text-lg text-gray-800">{gPercentage}%</div>
              <div className="text-sm text-gray-600">G ({stats.G})</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
