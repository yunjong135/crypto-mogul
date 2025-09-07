"use client"

import { useState, useEffect } from "react"
import { revealBet, getRaceProgression } from "@/lib/api"
import { getTelegramUser } from "@/lib/telegram"

interface RaceAnimationProps {
  tgUserId: number | null
  betId: string
  commit: string
  revealMs: number
  onRevealed: (result: any) => void
}

const RACE_DURATION_MS = 10000

function RaceAnimation({ tgUserId, betId, commit, revealMs, onRevealed }: RaceAnimationProps) {
  const [countdown, setCountdown] = useState(RACE_DURATION_MS / 1000)
  const [isRevealing, setIsRevealing] = useState(false)
  const [raceProgression, setRaceProgression] = useState<any>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!tgUserId || !betId) return

    console.log("[v0] Race starting, fetching progression for bet:", betId)
    setCountdown(RACE_DURATION_MS / 1000)
    setCurrentFrame(0)

    const fetchProgression = async () => {
      try {
        const progressionResponse = await getRaceProgression(betId)
        console.log("[v0] Race progression response:", progressionResponse)
        if (progressionResponse.ok) {
          setRaceProgression(progressionResponse.progression)
          console.log("[v0] Race progression set:", progressionResponse.progression)
        } else {
          console.error("[v0] Failed to get race progression:", progressionResponse)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch race progression:", error)
      }
    }

    fetchProgression()

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCountdown = prev - 1
        const frameIndex = Math.max(0, Math.min(9, 10 - Math.ceil(newCountdown)))
        setCurrentFrame(frameIndex)

        console.log("[v0] Countdown:", newCountdown, "Frame:", frameIndex)

        if (newCountdown <= 0) {
          console.log("[v0] Race finished, revealing results")
          clearInterval(timer)
          handleReveal()
          return 0
        }
        return newCountdown
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [tgUserId, betId])

  const handleReveal = async () => {
    if (!tgUserId || !betId) {
      console.error("[v0] No user ID or bet ID for reveal")
      return
    }

    console.log("[v0] Starting reveal for bet:", betId)
    setIsRevealing(true)

    try {
      const response = await revealBet(tgUserId.toString(), betId)
      console.log("[v0] Reveal response:", response)

      if (response.ok) {
        console.log("[v0] Race complete, calling onRevealed")
        setResult(response)
        onRevealed(response)
      } else {
        console.error("[v0] Reveal failed:", response)
      }
    } catch (error) {
      console.error("[v0] Reveal failed:", error)
    } finally {
      setIsRevealing(false)
    }
  }

  const getCurrentPositions = () => {
    if (!raceProgression || currentFrame >= raceProgression.length) {
      console.log("[v0] No race progression or invalid frame, using fallback positions")
      const progress = Math.min(currentFrame / 9, 1)
      return [
        progress * 0.8 + Math.random() * 0.1,
        progress * 0.8 + Math.random() * 0.1,
        progress * 0.8 + Math.random() * 0.1,
      ]
    }
    const positions = raceProgression[currentFrame]?.positions || [0, 0, 0]
    console.log("[v0] Current positions for frame", currentFrame, ":", positions)
    return positions
  }

  const positions = getCurrentPositions()

  const getSnailImage = (snailType: string) => {
    switch (snailType) {
      case "S":
        return "/images/snail-s.png"
      case "R":
        return "/images/snail-r.png"
      case "G":
        return "/images/snail-g.png"
      default:
        return "/images/snail-s.png"
    }
  }

  if (!isClient) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (result) {
    const won = result.choice === result.winner
    const payout = result.payout || 0

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">🏁 Race Results</h2>

        <div className="text-center space-y-4">
          <div className={`text-6xl ${won ? "animate-bounce" : ""}`}>{won ? "🎉" : "😔"}</div>

          <div>
            <p className="text-lg font-semibold">
              Winner: <span className="text-2xl font-bold text-green-600">Snail {result.winner}</span>
            </p>
            <p className="text-sm text-gray-600">Your choice: Snail {result.choice}</p>
          </div>

          {won ? (
            <div className="bg-green-100 border border-green-300 rounded-xl p-4">
              <p className="text-green-800 font-bold text-lg">🎊 Congratulations! You won!</p>
              <p className="text-green-700">Payout: +{payout.toLocaleString()} game money</p>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-300 rounded-xl p-4">
              <p className="text-red-800 font-bold">Better luck next time!</p>
              <p className="text-red-700">Lost: -{result.amount.toLocaleString()} game money</p>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Race Again 🐌
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">🏁 Snail Race in Progress</h2>

      {betData && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Your bet: {betData.amount.toLocaleString()} on Snail {betData.choice}
          </p>
        </div>
      )}

      <div className="race-track mb-6">
        <div className="space-y-4">
          {["S", "R", "G"].map((snail, index) => (
            <div key={snail} className="relative">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Snail {snail}</span>
                <span>🏁</span>
              </div>
              <div className="h-12 bg-gray-100 rounded-full relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-green-200 to-green-100"></div>
                <div
                  className="absolute top-1 h-10 w-10 transition-all duration-1000 ease-linear"
                  style={{
                    left: `${Math.max(4, Math.min(85, positions[index] * 85 + 4))}%`,
                  }}
                >
                  <img
                    src={getSnailImage(snail) || "/placeholder.svg"}
                    alt={`Snail ${snail}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        {isRevealing ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-blue-600 font-semibold">Revealing results...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">{countdown}s</div>
            <p className="text-gray-600">Race finishing soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { RaceAnimation }
