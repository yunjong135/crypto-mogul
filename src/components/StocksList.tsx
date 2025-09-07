"use client"

import { useState, useEffect } from "react"
import { api, type Stock } from "@/lib/api"
import { TradeModal } from "./TradeModal"

interface StocksListProps {
  tgUserId: string
  compact?: boolean
  onTradeComplete?: () => void
}

export function StocksList({ tgUserId, compact = false, onTradeComplete }: StocksListProps) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({})
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const newStocks = await api.stocks.list()

        // Track price changes
        const newPrevPrices: Record<string, number> = {}
        stocks.forEach((stock) => {
          newPrevPrices[stock.symbol] = stock.price
        })
        setPrevPrices(newPrevPrices)

        setStocks(newStocks)
      } catch (error) {
        console.error("Failed to fetch stocks:", error)
      }
    }

    fetchStocks()
    const interval = setInterval(fetchStocks, 5000)
    return () => clearInterval(interval)
  }, [])

  const getPriceChange = (stock: Stock) => {
    const prevPrice = prevPrices[stock.symbol]
    if (!prevPrice) return { direction: "neutral", percent: 0 }
    const percent = ((stock.price - prevPrice) / prevPrice) * 100
    return {
      direction: stock.price > prevPrice ? "up" : stock.price < prevPrice ? "down" : "neutral",
      percent,
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <h3 className="text-lg font-bold mb-4">📈 Live Stocks</h3>

        <div className={`space-y-2 ${compact ? "max-h-64 overflow-y-auto" : ""}`}>
          {stocks.map((stock) => {
            const change = getPriceChange(stock)
            return (
              <div
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1">
                  <div className="font-bold">{stock.symbol}</div>
                  {!compact && <div className="text-sm text-gray-600">{stock.name}</div>}
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-bold transition-all duration-300 ${
                      change.direction === "up"
                        ? "text-green-600"
                        : change.direction === "down"
                          ? "text-red-600"
                          : "text-gray-900"
                    }`}
                  >
                    ${stock.price.toFixed(2)}
                  </div>
                  {change.direction !== "neutral" && (
                    <div className={`text-xs ${change.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                      {change.direction === "up" ? "▲" : "▼"} {Math.abs(change.percent).toFixed(2)}%
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    Trade
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          tgUserId={tgUserId}
          onClose={() => setSelectedStock(null)}
          onTradeComplete={() => {
            setSelectedStock(null)
            onTradeComplete?.()
          }}
        />
      )}
    </>
  )
}
