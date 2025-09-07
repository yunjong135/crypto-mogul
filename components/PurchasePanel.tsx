"use client"

import { purchaseStars } from "@/lib/api"
import { getTelegramUser } from "@/lib/telegram"

interface PurchasePanelProps {
  onPurchaseComplete: () => void
}

const STAR_PACKAGES = [
  { stars: 1, money: 100, emoji: "⭐" },
  { stars: 5, money: 600, emoji: "⭐" },
  { stars: 10, money: 1000, emoji: "⭐" },
  { stars: 100, money: 12000, emoji: "⭐" },
  { stars: 1000, money: 130000, emoji: "⭐" },
]

export default function PurchasePanel({ onPurchaseComplete }: PurchasePanelProps) {
  const handlePurchase = async (stars: number) => {
    try {
      const telegramUser = getTelegramUser()

      // TODO: Replace with actual Telegram Stars payment in production
      if (window.Telegram?.WebApp) {
        // Production: Use Telegram Stars API
        console.log("TODO: Implement Telegram Stars payment")
        // window.Telegram.WebApp.openInvoice(...)
      } else {
        // Development: Mock payment
        const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const response = await purchaseStars(telegramUser.id, stars, mockPaymentId)
        if (response.ok) {
          onPurchaseComplete()
          alert(`Mock purchase successful! Added ${response.added} game money`)
        }
      }
    } catch (error) {
      console.error("Purchase failed:", error)
      alert("Purchase failed. Please try again.")
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">💫 Purchase Game Money</h2>

      <div className="grid grid-cols-2 gap-3">
        {STAR_PACKAGES.map((pkg) => (
          <button
            key={pkg.stars}
            onClick={() => handlePurchase(pkg.stars)}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <div className="text-sm">
              {pkg.stars}
              {pkg.emoji}
            </div>
            <div className="text-xs opacity-90">= {pkg.money.toLocaleString()}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
