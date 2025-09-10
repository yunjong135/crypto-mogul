"use client"

import { useState } from "react"
import { placeBet } from "@/lib/api"
import { getTelegramUser } from "@/lib/telegram"

interface BetPanelProps {
  balance: number
  onBetStart: (betData: any) => void
}

const SNAILS = [
  { id: "S", name: "Speedy", color: "bg-red-500", emoji: "🔴" },
  { id: "R", name: "Racer", color: "bg-blue-500", emoji: "🔵" },
  { id: "G", name: "Glider", color: "bg-green-500", emoji: "🟢" },
]

export default function BetPanel({ balance, onBetStart }: BetPanelProps) {
  const [betAmount, setBetAmount] = useState("")
  const [isPlacingBet, setIsPlacingBet] = useState(false)

  const handleBet = async (choice: string) => {
    const amount = Number.parseInt(betAmount)

    if (!amount || amount <= 0) {
      alert("Please enter a valid bet amount")
      return
    }

    if (amount > balance) {
      alert("Insufficient balance")
      return
    }

    setIsPlacingBet(true)

    try {
      const telegramUser = getTelegramUser()
      const response = await placeBet(telegramUser.id, choice, amount)

      if (response.ok) {
        onBetStart({
          bet_id: response.bet.id,
          commit_hash: response.commit_hash,
          choice,
          amount,
          reveal_after_ms: 10000, // 10 seconds for the race
        })
        setBetAmount("")
      } else {
        alert("Failed to place bet. Please try again.")
      }
    } catch (error) {
      console.error("Bet failed:", error)
      alert("Failed to place bet. Please try again.")
    } finally {
      setIsPlacingBet(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">🎯 Place Your Bet</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Bet Amount</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Enter amount..."
          min="1"
          max={balance}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold"
          disabled={isPlacingBet}
        />
        <p className="text-xs text-gray-500 mt-1 text-center">Max: {balance.toLocaleString()} · Payout: x2.5</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 text-center mb-3">Choose your snail:</p>

        {SNAILS.map((snail) => (
          <button
            key={snail.id}
            onClick={() => handleBet(snail.id)}
            disabled={isPlacingBet || !betAmount}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${snail.color} text-white font-bold shadow-md hover:shadow-lg`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className="text-2xl">{snail.emoji}</div>
              <div>
                <div className="text-lg font-bold">Snail {snail.id}</div>
                <div className="text-sm opacity-90">{snail.name}</div>
              </div>
              <div className="text-2xl">🐌</div>
            </div>
          </button>
        ))}
      </div>

      {isPlacingBet && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Placing bet...</span>
          </div>
        </div>
      )}
    </div>
  )
}
