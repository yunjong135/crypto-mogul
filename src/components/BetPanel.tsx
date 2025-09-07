"use client"

import { useState } from "react"
import { api } from "@/lib/api"

interface BetPanelProps {
  tgUserId: string
  balance: number
  onBetPlaced: (betData: { betId: string; commit_hash: string; reveal_after_ms: number }) => void
  onBalanceUpdate: () => void
}

export function BetPanel({ tgUserId, balance, onBetPlaced, onBalanceUpdate }: BetPanelProps) {
  const [amount, setAmount] = useState<number>(10)
  const [selectedSnail, setSelectedSnail] = useState<"S" | "R" | "G" | null>(null)
  const [loading, setLoading] = useState(false)

  const handleBet = async () => {
    if (!selectedSnail || amount <= 0 || amount > balance) return

    setLoading(true)
    try {
      const result = await api.bet(tgUserId, selectedSnail, amount)
      onBetPlaced({
        betId: result.bet_id,
        commit_hash: result.commit_hash,
        reveal_after_ms: result.reveal_after_ms,
      })
      onBalanceUpdate()
      setSelectedSnail(null)
    } catch (error) {
      console.error("Bet failed:", error)
      alert("Bet failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <h3 className="text-lg font-bold mb-4">Place Your Bet</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1"
          max={balance}
          className="w-full p-2 border rounded-lg font-mono"
        />
        <div className="text-xs text-gray-500 mt-1">Balance: ${balance.toLocaleString()}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Choose Snail</label>
        <div className="flex gap-2">
          {(["S", "R", "G"] as const).map((snail) => (
            <button
              key={snail}
              onClick={() => setSelectedSnail(snail)}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                selectedSnail === snail ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">{snail === "S" ? "🟠" : snail === "R" ? "🔵" : "🟢"}</div>
              <div className="font-bold">{snail}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleBet}
        disabled={!selectedSnail || amount <= 0 || amount > balance || loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {loading ? "Placing Bet..." : `Bet $${amount} on ${selectedSnail || "?"}`}
      </button>
    </div>
  )
}
