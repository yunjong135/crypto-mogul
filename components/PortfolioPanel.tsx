"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Position {
  symbol: string
  name: string
  qty: number
  avg_cost: number
  last_price: number
  market_value: number
  return_rate: number
}

interface PortfolioData {
  ok: boolean
  cash: number
  portfolio_value: number
  cost_basis: number
  pnl: number
  pnl_rate: number
  positions: Position[]
}

interface PortfolioPanelProps {
  tgUserId: number | null
}

export function PortfolioPanel({ tgUserId }: PortfolioPanelProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [stockHistory, setStockHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchPortfolio = async () => {
    if (!tgUserId) {
      setLoading(false)
      return
    }

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setLoading(true)
      setError(null)

      const response = await fetch("https://api.snail-race.com/portfolio", {
        headers: {
          "x-tg-user-id": `u-${tgUserId}`,
        },
        signal: abortControllerRef.current.signal,
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status === 400) {
          toast({
            title: "Login Required",
            description: "Missing x-tg-user-id",
            variant: "destructive",
          })
          return
        }

        if (response.status === 404) {
          // User not found, prompt signup
          toast({
            title: "Account Setup Required",
            description: "Please initialize your account first",
            variant: "destructive",
          })
          // Call POST /api/init here if needed
          return
        }

        if (response.status === 500) {
          throw new Error("Server error")
        }

        throw new Error("Failed to fetch portfolio")
      }

      const data: PortfolioData = await response.json()
      setPortfolioData(data)
    } catch (err: any) {
      if (err.name === "AbortError") {
        return // Request was cancelled
      }

      console.error("Error fetching portfolio:", err)
      setError("Failed to load portfolio")
      toast({
        title: "Error",
        description: "Failed to load portfolio data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStockHistory = async (symbol: string) => {
    setLoadingHistory(true)
    try {
      const response = await fetch(
        `https://api.snail-race.com/stocks/history?symbol=${symbol}&minutes=4320&limit=1000`,
        { cache: "no-store" },
      )
      if (!response.ok) {
        throw new Error("Failed to fetch stock history")
      }
      const data = await response.json()
      setStockHistory(data)
    } catch (err) {
      console.error("Error fetching stock history:", err)
      toast({
        title: "Error",
        description: "Failed to load stock history",
        variant: "destructive",
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()

    const interval = setInterval(() => {
      fetchPortfolio()
    }, 10000) // Refresh every 10 seconds

    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [tgUserId])

  const handlePositionClick = (symbol: string) => {
    setSelectedStock(symbol)
    fetchStockHistory(symbol)
  }

  if (loading) {
    return (
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Portfolio</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <span className="ml-2 text-gray-400">Loading portfolio...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Portfolio</h3>
        <div className="text-center py-8 text-gray-400">
          <p>Failed to load portfolio</p>
          <Button onClick={fetchPortfolio} variant="outline" size="sm" className="mt-2 bg-transparent">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (!tgUserId) {
    return (
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Portfolio</h3>
        <div className="text-center py-8 text-gray-400">
          <p>Please connect your Telegram account</p>
        </div>
      </Card>
    )
  }

  if (!portfolioData) {
    return (
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Portfolio</h3>
        <div className="text-center py-8 text-gray-400">
          <p>No portfolio data available</p>
        </div>
      </Card>
    )
  }

  const sortedPositions = [...portfolioData.positions].sort((a, b) => b.market_value - a.market_value)

  return (
    <>
      <Card className="p-4 bg-gray-800 border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Portfolio</h3>
          <Button onClick={fetchPortfolio} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            🔄
          </Button>
        </div>

        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-400">Cash</div>
              <div className="text-lg font-bold text-white">${portfolioData.cash.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Portfolio Value</div>
              <div className="text-lg font-bold text-white">${portfolioData.portfolio_value.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Cost Basis</div>
              <div className="text-lg font-bold text-white">${portfolioData.cost_basis.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">P&L</div>
              <div className={`text-lg font-bold ${portfolioData.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {portfolioData.pnl >= 0 ? "+" : ""}${portfolioData.pnl.toLocaleString()}
              </div>
              <div className={`text-sm ${portfolioData.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                ({portfolioData.pnl >= 0 ? "+" : ""}
                {(portfolioData.pnl_rate * 100).toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sortedPositions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No positions yet</p>
              <p className="text-sm">Start trading to build your portfolio</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-7 gap-2 text-xs text-gray-400 font-medium px-3 py-2 bg-gray-700 rounded">
                <div>Symbol</div>
                <div>Name</div>
                <div>Qty</div>
                <div>Avg Cost</div>
                <div>Last Price</div>
                <div>Market Value</div>
                <div>Return %</div>
              </div>

              {sortedPositions.map((position) => (
                <div
                  key={position.symbol}
                  className="grid grid-cols-7 gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => handlePositionClick(position.symbol)}
                >
                  <div className="font-bold text-white">{position.symbol}</div>
                  <div className="text-sm text-gray-300 truncate">{position.name}</div>
                  <div className="text-sm text-gray-300">{position.qty}</div>
                  <div className="text-sm text-gray-300">${position.avg_cost.toFixed(2)}</div>
                  <div className="text-sm text-gray-300">${position.last_price.toFixed(2)}</div>
                  <div className="font-bold text-white">${position.market_value.toFixed(2)}</div>
                  <div
                    className={`text-sm font-medium ${position.return_rate >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {position.return_rate >= 0 ? "+" : ""}
                    {(position.return_rate * 100).toFixed(2)}%
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedStock} - Price History</DialogTitle>
          </DialogHeader>
          <div className="h-96">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <span className="ml-2 text-gray-400">Loading chart...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="ts"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${Number.parseFloat(value).toFixed(2)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: "#F3F4F6" }}
                    formatter={(value: string) => [`$${Number.parseFloat(value).toFixed(2)}`, "Price"]}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Line type="monotone" dataKey="price" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
