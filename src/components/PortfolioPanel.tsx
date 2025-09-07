"use client"

import { useState, useEffect } from "react"
import { api, type Portfolio } from "@/lib/api"

interface PortfolioPanelProps {
  tgUserId: string
}

export function PortfolioPanel({ tgUserId }: PortfolioPanelProps) {
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
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">💼 Portfolio</h3>
        <button
          onClick={refreshPortfolio}
          disabled={loading}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {loading ? "⟳" : "↻"}
        </button>
      </div>

      {portfolio && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Cash</div>
              <div className="font-mono font-bold text-green-600">${portfolio.cash.toLocaleString()}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Equity</div>
              <div className="font-mono font-bold text-blue-600">${portfolio.equity.toLocaleString()}</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm text-gray-600">Total</div>
              <div className="font-mono font-bold text-yellow-600">${portfolio.total_value.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Positions</h4>
            {portfolio.positions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No positions yet</div>
            ) : (
              portfolio.positions.map((position) => (
                <div key={position.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-bold">{position.symbol}</div>
                    <div className="text-sm text-gray-600">
                      {position.qty} shares @ ${position.avg_price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold">${position.mkt_value?.toLocaleString() || "0"}</div>
                    <div className={`text-sm ${(position.pnl || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {(position.pnl || 0) >= 0 ? "+" : ""}${position.pnl?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
