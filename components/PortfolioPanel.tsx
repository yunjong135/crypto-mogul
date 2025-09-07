"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface Holding {
  symbol: string
  shares: number
  avgPrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
}

interface PortfolioPanelProps {
  tgUserId: number | null
}

export function PortfolioPanel({ tgUserId }: PortfolioPanelProps) {
  const [holdings, setHoldings] = useState<Holding[]>([
    {
      symbol: "SNAIL",
      shares: 10,
      avgPrice: 120.0,
      currentPrice: 125.5,
      totalValue: 1255.0,
      gainLoss: 55.0,
      gainLossPercent: 4.58,
    },
    {
      symbol: "RACE",
      shares: 5,
      avgPrice: 95.0,
      currentPrice: 89.75,
      totalValue: 448.75,
      gainLoss: -26.25,
      gainLossPercent: -5.53,
    },
  ])

  const [portfolioValue, setPortfolioValue] = useState(0)
  const [totalGainLoss, setTotalGainLoss] = useState(0)

  useEffect(() => {
    // Calculate portfolio totals
    const totalValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0)
    const totalGL = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0)

    setPortfolioValue(totalValue)
    setTotalGainLoss(totalGL)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setHoldings((prev) =>
        prev.map((holding) => {
          const newPrice = holding.currentPrice + (Math.random() - 0.5) * 2
          const newTotalValue = holding.shares * newPrice
          const newGainLoss = newTotalValue - holding.shares * holding.avgPrice
          const newGainLossPercent = (newGainLoss / (holding.shares * holding.avgPrice)) * 100

          return {
            ...holding,
            currentPrice: newPrice,
            totalValue: newTotalValue,
            gainLoss: newGainLoss,
            gainLossPercent: newGainLossPercent,
          }
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [holdings.length])

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Portfolio</h3>

      {/* Portfolio Summary */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">${portfolioValue.toFixed(2)}</div>
          <div className={`text-sm ${totalGainLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toFixed(2)} Today
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="space-y-3">
        {holdings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No holdings yet</p>
            <p className="text-sm">Start trading to build your portfolio</p>
          </div>
        ) : (
          holdings.map((holding) => (
            <div key={holding.symbol} className="p-3 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-white">{holding.symbol}</div>
                  <div className="text-sm text-gray-400">{holding.shares} shares</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">${holding.totalValue.toFixed(2)}</div>
                  <div className={`text-sm ${holding.gainLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {holding.gainLoss >= 0 ? "+" : ""}${holding.gainLoss.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Avg: ${holding.avgPrice.toFixed(2)}</span>
                <span>Current: ${holding.currentPrice.toFixed(2)}</span>
                <span className={holding.gainLossPercent >= 0 ? "text-green-400" : "text-red-400"}>
                  {holding.gainLossPercent >= 0 ? "+" : ""}
                  {holding.gainLossPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
