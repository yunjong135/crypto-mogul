"use client"

import { useState, useEffect } from "react"
import { api, type Stock } from "@/lib/api"

export function StocksTickerMarquee() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({})

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
    if (!prevPrice) return "neutral"
    return stock.price > prevPrice ? "up" : stock.price < prevPrice ? "down" : "neutral"
  }

  return (
    <div className="bg-black text-white py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex">
        {stocks.map((stock, index) => {
          const change = getPriceChange(stock)
          return (
            <div
              key={`${stock.symbol}-${index}`}
              className={`inline-flex items-center mx-6 font-mono text-sm transition-all duration-300 ${
                change === "up" ? "text-green-400" : change === "down" ? "text-red-400" : "text-white"
              }`}
            >
              <span className="font-bold">{stock.symbol}</span>
              <span className="mx-2">${stock.price.toFixed(2)}</span>
              <span className="text-xs">{change === "up" ? "▲" : change === "down" ? "▼" : "●"}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
