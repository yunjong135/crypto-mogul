"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PurchaseStarsProps {
  tgUserId: number | null
  onBalanceUpdate: () => void
}

interface StarPackage {
  id: string
  stars: number
  coins: number
  bonus?: number
  popular?: boolean
}

export function PurchaseStars({ tgUserId, onBalanceUpdate }: PurchaseStarsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const packages: StarPackage[] = [
    { id: "small", stars: 10, coins: 100 },
    { id: "medium", stars: 50, coins: 550, bonus: 50, popular: true },
    { id: "large", stars: 100, coins: 1200, bonus: 200 },
    { id: "mega", stars: 500, coins: 6500, bonus: 1500 },
  ]

  const handlePurchase = async (pkg: StarPackage) => {
    setLoading(pkg.id)

    try {
      // Simulate Telegram Stars payment
      console.log(`Purchasing ${pkg.coins} coins for ${pkg.stars} Telegram Stars`)

      // In real implementation, this would call Telegram WebApp payment API
      // await window.Telegram.WebApp.openInvoice(invoiceUrl)

      // Mock successful purchase
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Purchase successful!")
      onBalanceUpdate()
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Purchase Game Money</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative p-4 rounded-lg border transition-colors ${
              pkg.popular
                ? "bg-gradient-to-br from-blue-900 to-purple-900 border-blue-500"
                : "bg-gray-700 border-gray-600"
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Most Popular</span>
              </div>
            )}

            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-white">{pkg.coins.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Game Coins</div>
              {pkg.bonus && <div className="text-sm text-green-400">+{pkg.bonus} Bonus!</div>}
            </div>

            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-lg font-semibold text-white">{pkg.stars}</span>
              </div>
              <div className="text-sm text-gray-400">Telegram Stars</div>
            </div>

            <Button
              onClick={() => handlePurchase(pkg)}
              disabled={loading === pkg.id}
              className={`w-full ${
                pkg.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-500"
              } text-white`}
            >
              {loading === pkg.id ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                `Buy for ⭐${pkg.stars}`
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-900 rounded-lg text-xs text-gray-400">
        <p className="mb-2">
          💡 <strong>About Telegram Stars:</strong>
        </p>
        <ul className="space-y-1 ml-4">
          <li>• Secure payment method built into Telegram</li>
          <li>• Game money is for in-app activities only</li>
          <li>• Not exchangeable for cash or real lottery tickets</li>
          <li>• All purchases are final and non-refundable</li>
        </ul>
      </div>
    </Card>
  )
}
