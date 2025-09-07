"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface StocksListProps {
  tgUserId: number | null
  compact?: boolean
  onTradeComplete?: () => void
}

export function StocksList({ tgUserId, compact = false, onTradeComplete }: StocksListProps) {
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: "SNAIL", name: "Snail Corp", price: 125.5, change: 2.3, changePercent: 1.87 },
    { symbol: "RACE", name: "Racing Inc", price: 89.75, change: -1.25, changePercent: -1.37 },
    { symbol: "SPEED", name: "Speed Tech", price: 234.8, change: 5.6, changePercent: 2.44 },
    { symbol: "SHELL", name: "Shell Games", price: 67.2, change: 0.8, changePercent: 1.2 },
    { symbol: "TRACK", name: "Track Systems", price: 156.9, change: -3.1, changePercent: -1.94 },
  ])

  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [tradeAmount, setTradeAmount] = useState<number>(1)

  useEffect(() => {
    // Simulate real-time price updates
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((stock) => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: (Math.random() - 0.5) * 5,
          changePercent: (Math.random() - 0.5) * 3,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleTrade = (symbol: string, action: "buy" | "sell") => {
    console.log(`${action.toUpperCase()} ${tradeAmount} shares of ${symbol}`)
    onTradeComplete?.()
    setSelectedStock(null)
    setTradeAmount(1)
  }

  const displayStocks = compact ? stocks.slice(0, 3) : stocks

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">{compact ? "Quick Trade" : "Stock Market"}</h3>

      <div className="space-y-2">
        {displayStocks.map((stock) => (
          <div
            key={stock.symbol}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              selectedStock === stock.symbol
                ? "bg-blue-900 border-blue-600"
                : "bg-gray-700 border-gray-600 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedStock(selectedStock === stock.symbol ? null : stock.symbol)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{stock.symbol}</div>
                {!compact && <div className="text-sm text-gray-400">{stock.name}</div>}
              </div>
              <div className="text-right">
                <div className="font-bold text-white">${stock.price.toFixed(2)}</div>
                <div className={`text-sm ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>

            {selectedStock === stock.symbol && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    min="1"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number.parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 bg-gray-600 text-white rounded text-sm"
                  />
                  <span className="text-gray-400 text-sm">shares</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleTrade(stock.symbol, "buy")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Buy ${(stock.price * tradeAmount).toFixed(2)}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTrade(stock.symbol, "sell")}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    Sell
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
