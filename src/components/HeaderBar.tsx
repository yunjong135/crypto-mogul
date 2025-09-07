"use client"

import { useState, useEffect } from "react"
import { api, type Portfolio } from "@/lib/api"

interface HeaderBarProps {
  tgUserId: string
}

export function HeaderBar({ tgUserId }: HeaderBarProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshPortfolio = async () => {
    if (!tgUserId) return
    setLoading(true)
    try {
      const result = await api.portfolio(tgUserId)
      setPortfolio(result)
    } catch (error) {
      console.error("Failed to fetch portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshPortfolio()
  }, [tgUserId])

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <h1 className="text-xl font-bold">🐌 Snail Racing</h1>

      <div className="flex items-center gap-4">
        {portfolio && (
          <div className="flex items-center gap-3 text-sm font-mono">
            <div className="text-green-400">Cash: ${portfolio.cash.toLocaleString()}</div>
            <div className="text-blue-400">Equity: ${portfolio.equity.toLocaleString()}</div>
            <div className="text-yellow-400 font-bold">Total: ${portfolio.total_value.toLocaleString()}</div>
          </div>
        )}

        <button
          onClick={refreshPortfolio}
          disabled={loading}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "⟳" : "↻"}
        </button>
      </div>
    </div>
  )
}
