"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { getTG } from "@/lib/tg"

interface PurchaseStarsProps {
  tgUserId: string
  onBalanceUpdate: () => void
}

const STAR_TIERS = [
  { stars: 1, price: "$0.99", bonus: 100 },
  { stars: 5, price: "$4.99", bonus: 550 },
  { stars: 10, price: "$9.99", bonus: 1200 },
  { stars: 100, price: "$99.99", bonus: 15000 },
  { stars: 1000, price: "$999.99", bonus: 200000 },
]

export function PurchaseStars({ tgUserId, onBalanceUpdate }: PurchaseStarsProps) {
  const [loading, setLoading] = useState<number | null>(null)

  const handlePurchase = async (stars: number) => {
    setLoading(stars)
    try {
      const { invoice_link } = await api.payments.createInvoice(stars, tgUserId)

      const tg = getTG()
      if (tg) {
        tg.openInvoice(invoice_link, async (status) => {
          if (status === "paid") {
            try {
              await api.payments.confirm({
                tg_user_id: tgUserId,
                tg_payment_id: "auto", // This would come from Telegram
                stars_amount: stars,
              })
              onBalanceUpdate()
            } catch (error) {
              console.error("Payment confirmation failed:", error)
            }
          }
        })
      } else {
        // Fallback for development
        window.open(invoice_link, "_blank")
      }
    } catch (error) {
      console.error("Purchase failed:", error)
      alert("Purchase failed. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <h3 className="text-lg font-bold mb-4">⭐ Purchase Game Money</h3>

      <div className="space-y-3">
        {STAR_TIERS.map((tier) => (
          <div
            key={tier.stars}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <div className="font-bold">
                {tier.stars} ⭐ → ${tier.bonus.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{tier.price}</div>
            </div>
            <button
              onClick={() => handlePurchase(tier.stars)}
              disabled={loading === tier.stars}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 transition-colors"
            >
              {loading === tier.stars ? "Processing..." : "Buy"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        Game money is for in-app activities (racing entry, stock purchases, etc.) and is NOT directly exchangeable for
        cash or lottery. Lottery tickets are non-transferable and expire in 7 days.
      </div>
    </div>
  )
}
