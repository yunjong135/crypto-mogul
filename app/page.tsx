"use client"

import { useState, useEffect } from "react"
import { initTG } from "@/lib/tg"
import { useSnailUser } from "@/hooks/useSnailUser"
import { HeaderBar } from "@/components/HeaderBar"
import { StocksTickerMarquee } from "@/components/StocksTickerMarquee"
import { BetPanel } from "@/components/BetPanel"
import { RaceAnimation } from "@/components/RaceAnimation"
import { StocksList } from "@/components/StocksList"
import { PortfolioPanel } from "@/components/PortfolioPanel"
import { TicketsPanel } from "@/components/TicketsPanel"
import { Leaderboard } from "@/components/Leaderboard"
import { PurchaseStars } from "@/components/PurchaseStars"

type Tab = "Racing" | "Stocks" | "Tickets" | "Leaderboard" | "Wallet"

export default function SnailRacingGame() {
  const [activeTab, setActiveTab] = useState<Tab>("Racing")
  const [betData, setBetData] = useState<any>(null)
  const [isRacing, setIsRacing] = useState(false)
  const { tgUserId, balance, refreshBalance, loading } = useSnailUser()

  useEffect(() => {
    initTG()
  }, [])

  const handleBetPlaced = (data: { betId: string; commit_hash: string; reveal_after_ms: number }) => {
    setBetData(data)
    setIsRacing(true)
  }

  const handleRaceRevealed = (result: any) => {
    setIsRacing(false)
    refreshBalance()
  }

  const handleTradeComplete = () => {
    refreshBalance()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Snail Racing Game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <HeaderBar tgUserId={tgUserId} />

        {/* Tab Navigation */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          {(["Racing", "Stocks", "Tickets", "Leaderboard", "Wallet"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white border-b-2 border-blue-400"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "Racing" && (
            <div className="space-y-4">
              {/* Live Stock Ticker */}
              <StocksTickerMarquee />

              {/* Betting Section */}
              {!isRacing && (
                <BetPanel
                  tgUserId={tgUserId}
                  balance={balance}
                  onBetPlaced={handleBetPlaced}
                  onBalanceUpdate={refreshBalance}
                />
              )}

              {/* Race Animation */}
              {isRacing && betData && (
                <RaceAnimation
                  tgUserId={tgUserId}
                  betId={betData.betId}
                  commit={betData.commit_hash}
                  revealMs={betData.reveal_after_ms}
                  onRevealed={handleRaceRevealed}
                />
              )}

              {/* Compact Stocks List */}
              <StocksList tgUserId={tgUserId} compact={true} onTradeComplete={handleTradeComplete} />
            </div>
          )}

          {activeTab === "Stocks" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StocksList tgUserId={tgUserId} onTradeComplete={handleTradeComplete} />
              <PortfolioPanel tgUserId={tgUserId} />
            </div>
          )}

          {activeTab === "Tickets" && (
            <div>
              <TicketsPanel tgUserId={tgUserId} />
            </div>
          )}

          {activeTab === "Leaderboard" && (
            <div>
              <Leaderboard />
            </div>
          )}

          {activeTab === "Wallet" && (
            <div className="space-y-4">
              <PurchaseStars tgUserId={tgUserId} onBalanceUpdate={refreshBalance} />
              <div className="p-4 bg-gray-800 rounded-2xl text-xs text-gray-400">
                Game money is for in-app activities (racing entry, stock purchases, etc.) and is NOT directly
                exchangeable for cash or lottery. Lottery tickets are non-transferable and expire in 7 days.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
