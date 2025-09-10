"use client"

import { useState, useEffect } from "react"
import HeaderBar from "@/components/HeaderBar"
import PurchasePanel from "@/components/PurchasePanel"
import BetPanel from "@/components/BetPanel"
import RaceAnimation from "@/components/RaceAnimation"
import FairnessPanel from "@/components/FairnessPanel"
import RecentResults from "@/components/RecentResults"
import HowItWorksModal from "@/components/HowItWorksModal"
import { initUser, getBalance } from "@/lib/api"
import { getTelegramUser } from "@/lib/telegram"

export default function SnailRacingGame() {
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [snailAccumulated, setSnailAccumulated] = useState(0)
  const [isRacing, setIsRacing] = useState(false)
  const [betData, setBetData] = useState<any>(null)
  const [raceResult, setRaceResult] = useState<any>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      const telegramUser = getTelegramUser() // 반드시 클라에서만 호출됨(useEffect 내부)
      // 서버에 유저 초기화
      const initResponse = await initUser(telegramUser.id, telegramUser.username)
      if (initResponse.ok) {
        setUser(initResponse.user)
        await refreshBalance()
      }
    } catch (error) {
      console.error("Failed to initialize app:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshBalance = async () => {
    try {
      const telegramUser = getTelegramUser()
      const balanceResponse = await getBalance(telegramUser.id)
      if (balanceResponse.ok) {
        setBalance(balanceResponse.user.balance)
        setSnailAccumulated(balanceResponse.user.snail_accumulated)
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error)
    }
  }

  const handleBetStart = (betData: any) => {
    setBetData(betData)
    setRaceResult(null)
    setIsRacing(true)
  }

  const handleRaceComplete = (result: any) => {
    setRaceResult(result)
    setIsRacing(false)
    setBetData(null)
    refreshBalance()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 flex items-center justify-center"
           style={{
             backgroundImage: `
               radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 75% 75%, rgba(22, 163, 74, 0.1) 0%, transparent 50%)
             `,
             backgroundSize: '100px 100px, 80px 80px'
           }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Snail Racing Game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900" 
         style={{
           backgroundImage: `
             radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 75% 75%, rgba(22, 163, 74, 0.1) 0%, transparent 50%),
             linear-gradient(45deg, rgba(34, 197, 94, 0.05) 25%, transparent 25%),
             linear-gradient(-45deg, rgba(22, 163, 74, 0.05) 25%, transparent 25%)
           `,
           backgroundSize: '100px 100px, 80px 80px, 40px 40px, 40px 40px'
         }}>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-center mb-6">
          <img src="/images/snail-racing-logo.png" alt="Snail Racing Game" className="w-64 h-auto" />
        </div>

        <HeaderBar balance={balance} snailAccumulated={snailAccumulated} />

        {!isRacing && !raceResult && <BetPanel balance={balance} onBetStart={handleBetStart} />}

        {(isRacing || raceResult) && (
          <RaceAnimation
            isRacing={isRacing}
            betData={betData}
            result={raceResult}
            onRaceComplete={handleRaceComplete}
          />
        )}

        <PurchasePanel onPurchaseComplete={refreshBalance} />

        <FairnessPanel betData={betData} result={raceResult} />

        <RecentResults />

        <footer className="text-center py-4 space-y-2">
          <p className="text-xs text-gray-400">Made for Telegram Mini App · Stars enabled</p>
          <button
            onClick={() => setShowHowItWorks(true)}
            className="text-xs text-yellow-400 hover:text-yellow-300 underline"
          >
            How it works
          </button>
        </footer>

        {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
      </div>
    </div>
  )
}
