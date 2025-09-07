"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useToast } from "@/hooks/use-toast"

interface Stock {
  symbol: string
  name: string
  price: string // Updated to match backend API response format
  dividend_yield: string // Updated to match backend API response format
  updated_at: string // Added updated_at field from backend
  style?: "growth" | "dividend" // Made optional since backend doesn't provide this
  change?: number
  changePercent?: number
  priceAnimation?: "up" | "down" | null
}

interface HistoryPoint {
  ts: string
  price: string // Updated to match backend API response format
}

interface StocksListProps {
  tgUserId: number | null
  compact?: boolean
  onTradeComplete?: () => void
}

export function StocksList({ tgUserId, compact = false, onTradeComplete }: StocksListProps) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [tradeAmount, setTradeAmount] = useState<number>(1)
  const [showChart, setShowChart] = useState(false)
  const [chartStock, setChartStock] = useState<string | null>(null)
  const [chartData, setChartData] = useState<HistoryPoint[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const { toast } = useToast()

  const fetchStocks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("https://api.snail-race.com/stocks/list", { cache: "no-store" })

      if (!response.ok) {
        throw new Error("API connection failed")
      }

      const data = await response.json()

      setStocks((prevStocks) => {
        return data.map((newStock: Stock) => {
          const prevStock = prevStocks.find((s) => s.symbol === newStock.symbol)
          let priceAnimation: "up" | "down" | null = null

          const newPrice = Number.parseFloat(newStock.price)
          const prevPrice = prevStock ? Number.parseFloat(prevStock.price) : newPrice

          if (prevStock && prevPrice !== newPrice) {
            priceAnimation = newPrice > prevPrice ? "up" : "down"
          }

          const dividendYield = Number.parseFloat(newStock.dividend_yield)
          const style = dividendYield > 0 ? "dividend" : "growth"

          return {
            ...newStock,
            style,
            priceAnimation,
          }
        })
      })
    } catch (err) {
      console.error("Error fetching stocks:", err)
      setError("API connection failed")
      toast({
        title: "API Connection Failed",
        description: "Unable to connect to the stock market API. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStockHistory = async (symbol: string) => {
    try {
      setChartLoading(true)
      const response = await fetch(
        `https://api.snail-race.com/stocks/history?symbol=${symbol}&minutes=4320&limit=1000`,
        { cache: "no-store" },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch stock history")
      }

      const data = await response.json()
      setChartData(data)
    } catch (err) {
      console.error("Error fetching stock history:", err)
      toast({
        title: "Error",
        description: "Failed to load stock history.",
        variant: "destructive",
      })
    } finally {
      setChartLoading(false)
    }
  }

  const handleStockClick = (symbol: string) => {
    if (selectedStock === symbol) {
      setSelectedStock(null)
    } else {
      setSelectedStock(symbol)
    }
  }

  const handleShowChart = (symbol: string) => {
    setChartStock(symbol)
    setShowChart(true)
    fetchStockHistory(symbol)
  }

  const handleTrade = async (symbol: string, action: "buy" | "sell") => {
    if (!tgUserId) {
      toast({
        title: "Error",
        description: "User ID not available",
        variant: "destructive",
      })
      return
    }

    try {
      const endpoint =
        action === "buy" ? "https://api.snail-race.com/trade/buy" : "https://api.snail-race.com/trade/sell"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tg-user-id": `u-${tgUserId}`,
        },
        body: JSON.stringify({
          symbol,
          qty: tradeAmount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${action} stock`)
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: `Successfully ${action === "buy" ? "bought" : "sold"} ${tradeAmount} shares of ${symbol}. New balance: $${result.new_balance?.toLocaleString() || "N/A"}`,
      })

      onTradeComplete?.()
      fetchStocks()
      setSelectedStock(null)
      setTradeAmount(1)
    } catch (err) {
      console.error(`Error ${action}ing stock:`, err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to ${action} stock`,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchStocks()

    const interval = setInterval(fetchStocks, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setStocks((prev) => prev.map((stock) => ({ ...stock, priceAnimation: null })))
    }, 500)

    return () => clearTimeout(timer)
  }, [stocks])

  const displayStocks = compact ? stocks.slice(0, 3) : stocks

  if (loading && stocks.length === 0) {
    return (
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">{compact ? "Quick Trade" : "Stock Market"}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <span className="ml-2 text-gray-400">Loading stocks...</span>
        </div>
      </Card>
    )
  }

  if (error && stocks.length === 0) {
    return (
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">{compact ? "Quick Trade" : "Stock Market"}</h3>
        <div className="text-center py-8 text-gray-400">
          <p>API connection failed</p>
          <Button onClick={fetchStocks} variant="outline" size="sm" className="mt-2 bg-transparent">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-4 bg-gray-800 border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">{compact ? "Quick Trade" : "Stock Market"}</h3>
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>}
        </div>

        <div className="space-y-2">
          {displayStocks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>API connection failed</p>
            </div>
          ) : (
            displayStocks.map((stock) => (
              <div
                key={stock.symbol}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedStock === stock.symbol
                    ? "bg-blue-900 border-blue-600"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                } ${
                  stock.priceAnimation === "up"
                    ? "animate-price-up"
                    : stock.priceAnimation === "down"
                      ? "animate-price-down"
                      : ""
                }`}
                onClick={() => handleStockClick(stock.symbol)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-white">{stock.symbol}</div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          stock.style === "growth" ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                        }`}
                      >
                        {stock.style}
                      </span>
                    </div>
                    {!compact && <div className="text-sm text-gray-400">{stock.name}</div>}
                    {Number.parseFloat(stock.dividend_yield) > 0 && (
                      <div className="text-xs text-blue-400">
                        Dividend: {Number.parseFloat(stock.dividend_yield).toFixed(2)}%
                      </div>
                    )}
                    {!compact && (
                      <div className="text-xs text-gray-500">
                        Updated: {new Date(stock.updated_at).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">${Number.parseFloat(stock.price).toFixed(2)}</div>
                    {stock.change !== undefined && (
                      <div className={`text-sm ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change.toFixed(2)} ({stock.changePercent?.toFixed(2)}%)
                      </div>
                    )}
                  </div>
                  {!compact && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShowChart(stock.symbol)
                      }}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      📈
                    </Button>
                  )}
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
                        Buy ${(Number.parseFloat(stock.price) * tradeAmount).toFixed(2)}
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
            ))
          )}
        </div>
      </Card>

      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">{chartStock} - Price History (Last 3 Days)</DialogTitle>
          </DialogHeader>

          <div className="h-96">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <span className="ml-2 text-gray-400">Loading chart...</span>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="ts"
                    stroke="#9CA3AF"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${Number.parseFloat(value).toFixed(2)}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#F3F4F6" }}
                    formatter={(value: string) => [`$${Number.parseFloat(value).toFixed(2)}`, "Price"]}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    filter="drop-shadow(0 0 6px #10B981)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No chart data available</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
