"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface LeaderboardEntry {
  rank: number
  username: string
  snail_accumulated: number
  last_play: string | null
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    fetchLeaderboard()

    // Subscribe to realtime updates
    const subscription = supabase
      .channel("leaderboard_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard_view" }, () => {
        fetchLeaderboard()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("leaderboard_view")
        .select("*")
        .order("snail_accumulated", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Leaderboard fetch error:", error)
        return
      }

      const formattedData =
        data?.map((entry, index) => ({
          rank: index + 1,
          username: entry.username || `User${entry.tg_user_id?.slice(-4)}`,
          snail_accumulated: entry.snail_accumulated || 0,
          last_play: entry.last_play,
        })) || []

      setLeaderboard(formattedData)
    } catch (error) {
      console.error("Leaderboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">🏆 Leaderboard</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No players yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600 pb-2 border-b">
            <span>Rank</span>
            <span>Player</span>
            <span>SNAIL</span>
            <span>Last Play</span>
          </div>

          {leaderboard.map((entry) => (
            <div
              key={`${entry.rank}-${entry.username}`}
              className={`grid grid-cols-4 gap-2 text-sm py-2 px-2 rounded-lg ${
                entry.rank <= 3 ? "bg-yellow-50 border border-yellow-200" : "hover:bg-gray-50"
              }`}
            >
              <span className="font-semibold">
                {entry.rank === 1 && "🥇"}
                {entry.rank === 2 && "🥈"}
                {entry.rank === 3 && "🥉"}
                {entry.rank > 3 && `#${entry.rank}`}
              </span>
              <span className="truncate font-medium">{entry.username}</span>
              <span className="font-semibold text-green-600">
                {Math.floor(entry.snail_accumulated / 100).toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">{formatDate(entry.last_play)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
