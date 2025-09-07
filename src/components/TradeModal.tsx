"use client"

import { useState } from "react"
import { api, type Stock } from "@/lib/api"

interface TradeModalProps {
  stock: Stock
  tgUserId: string
  onClose: () => void
  onTradeComplete: () => void
}

export function TradeModal({ stock, tgUserId, onClose, onTradeComplete }: TradeModalProps) {
  const [mode, setMode] = useState<"BUY" | "SELL">("BUY")
  const [qty, setQty] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  const estimatedCost = qty * stock.price

  const handleTrade = async () => {
    setLoading(true)
    try {
      if (mode === "BUY") {
        await api.trade.buy(tgUserId, { symbol: stock.symbol, qty })
      } else {
        await api.trade.sell(tgUserId, { symbol: stock.symbol, qty })
      }
      onTradeComplete()
    } catch (error) {
      console.error("Trade failed:", error)
      alert("Trade failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Trade {stock.symbol}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600">{stock.name}</div>
          <div className="text-lg font-bold">${stock.price.toFixed(2)}</div>
        </div>

        <div className="flex mb-4">
          <button
            onClick={() => setMode("BUY")}
            className={`flex-1 py-2 px-4 rounded-l-lg font-medium ${
              mode === "BUY" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setMode("SELL")}
            className={`flex-1 py-2 px-4 rounded-r-lg font-medium ${
              mode === "SELL" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            SELL
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            min="1"
            className="w-full p-2 border rounded-lg font-mono"
          />
        </div>

        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Estimated {mode === "BUY" ? "Cost" : "Proceeds"}:</span>
            <span className="font-mono font-bold">${estimatedCost.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleTrade}
          disabled={loading || qty <= 0}
          className={`w-full py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            mode === "BUY" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {loading ? "Processing..." : `${mode} ${qty} shares`}
        </button>
      </div>
    </div>
  )
}
