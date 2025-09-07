"use client"

import { useState, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import { xorshift32, seedFromHex } from "@/lib/seeded"

interface RaceAnimationProps {
  tgUserId: string
  betId: string
  commit: string
  revealMs: number
  onRevealed: (result: any) => void
}

export function RaceAnimation({ tgUserId, betId, commit, revealMs, onRevealed }: RaceAnimationProps) {
  const [countdown, setCountdown] = useState(20)
  const [positions, setPositions] = useState({ S: 0, R: 0, G: 0 })
  const [phase, setPhase] = useState<"countdown" | "racing" | "finished">("countdown")
  const [result, setResult] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const rng = xorshift32(seedFromHex(commit, "race"))

    const startRace = () => {
      setPhase("racing")
      let elapsed = 0

      intervalRef.current = setInterval(() => {
        elapsed += 100

        if (elapsed < 18000) {
          // Phase A: Random walk to 80-92%
          setPositions((prev) => ({
            S: Math.min(92, prev.S + rng() * 2),
            R: Math.min(92, prev.R + rng() * 2),
            G: Math.min(92, prev.G + rng() * 2),
          }))
        } else if (elapsed >= 18000 && !result) {
          // Call reveal
          api.reveal(tgUserId, betId).then((revealResult) => {
            setResult(revealResult)
            onRevealed(revealResult)
          })
        } else if (result && elapsed < 20000) {
          // Phase B: Winner finishes first
          setPositions((prev) => {
            const winner = result.winner
            const progress = (elapsed - 18000) / 2000

            return {
              S: winner === "S" ? 92 + 8 * progress : prev.S + rng() * 0.5,
              R: winner === "R" ? 92 + 8 * progress : prev.R + rng() * 0.5,
              G: winner === "G" ? 92 + 8 * progress : prev.G + rng() * 0.5,
            }
          })
        } else if (elapsed >= 20000) {
          setPhase("finished")
          clearInterval(intervalRef.current!)
        }
      }, 100)
    }

    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          startRace()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(countdownInterval)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [betId, commit, tgUserId])

  if (phase === "countdown") {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 mb-4">{countdown}</div>
          <div className="text-lg">Race starting...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-4">🏁 Race in Progress</h3>

        <div className="space-y-3">
          {(["S", "R", "G"] as const).map((snail) => (
            <div key={snail} className="flex items-center gap-3">
              <div className="w-8 text-center">{snail === "S" ? "🟠" : snail === "R" ? "🔵" : "🟢"}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    snail === "S" ? "bg-orange-500" : snail === "R" ? "bg-blue-500" : "bg-green-500"
                  }`}
                  style={{ width: `${positions[snail]}%` }}
                />
                <div className="absolute right-2 top-0 h-full flex items-center text-xs font-bold text-white">
                  {positions[snail].toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium">
            Winner: <span className="font-bold">{result.winner}</span>
          </div>
          {result.is_win && <div className="text-green-600 font-bold">You won ${result.payout}!</div>}
        </div>
      )}

      <FairnessPanel commit={commit} result={result} />
    </div>
  )
}

function FairnessPanel({ commit, result }: { commit: string; result: any }) {
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-2">🔒 Provably Fair</h4>
      <div className="text-xs space-y-1">
        <div>
          Commit: <code className="bg-gray-200 px-1 rounded">{commit.slice(0, 16)}...</code>
        </div>
        {result && (
          <>
            <div>
              Server Seed: <code className="bg-gray-200 px-1 rounded">{result.server_seed?.slice(0, 16)}...</code>
            </div>
            <div>
              Nonce: <code className="bg-gray-200 px-1 rounded">{result.nonce}</code>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
