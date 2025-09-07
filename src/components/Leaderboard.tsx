"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

interface LeaderboardEntry {
  rank: number
  username_masked: string
  snail_accumulated: number
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase.from("leaderboard_view").select("*").limit(20)

        if (error) throw error
        setEntries(data || [])
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <h3 className="text-lg font-bold mb-4">🏆 Leaderboard</h3>

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0
                    ? "bg-yellow-500"
                    : index === 1
                      ? "bg-gray-400"
                      : index === 2
                        ? "bg-orange-600"
                        : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              <div className="font-medium">{entry.username_masked}</div>
            </div>
            <div className="font-mono font-bold">🐌 {entry.snail_accumulated.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
