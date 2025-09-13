"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

interface Stock {
  symbol: string
  price: number
  change: number
  changePercent: number
}

export function StocksTickerMarquee() {
  const [stocks, setStocks] = useState<Stock[]>([])

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data, error } = await supabase
          .from("stocks")
          .select("symbol, price, change_24h, change_percent_24h")
          .order("symbol")

        if (error) throw error

        const stockData =
          data?.map((stock) => ({
            symbol: stock.symbol,
            price: stock.price,
            change: stock.change_24h,
            changePercent: stock.change_percent_24h,
          })) || []

        setStocks(stockData)
      } catch (error) {
        console.error("Error fetching stocks:", error)
        setStocks([
          { symbol: "SNAIL", price: 125.5, change: 2.3, changePercent: 1.87 },
          { symbol: "RACE", price: 89.75, change: -1.25, changePercent: -1.37 },
          { symbol: "FAST", price: 234.8, change: 5.6, changePercent: 2.44 },
          { symbol: "SLOW", price: 45.2, change: 0.8, changePercent: 1.8 },
          { symbol: "SHELL", price: 167.9, change: -3.1, changePercent: -1.81 },
        ])
      }
    }

    fetchStocks()

    const subscription = supabase
      .channel("stocks_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "stocks" }, (payload) => {
        const updatedStock = payload.new as any
        setStocks((prev) =>
          prev.map((stock) =>
            stock.symbol === updatedStock.symbol
              ? {
                  symbol: updatedStock.symbol,
                  price: updatedStock.price,
                  change: updatedStock.change_24h,
                  changePercent: updatedStock.change_percent_24h,
                }
              : stock,
          ),
        )
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300">Live Stock Prices</h3>
      </div>
      <div className="relative overflow-hidden h-12">
        <div className="absolute inset-0 flex items-center">
          <div className="animate-marquee flex space-x-8 whitespace-nowrap">
            {stocks.concat(stocks).map((stock, index) => (
              <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-2 text-sm">
                <span className="font-medium text-white">{stock.symbol}</span>
                <span className="text-gray-300">${stock.price.toFixed(2)}</span>
                <span className={`flex items-center ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {stock.change >= 0 ? "↗" : "↘"}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
