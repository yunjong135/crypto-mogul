import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  tg_user_id: string
  username: string
  balance: number
  snail_accumulated: number
  created_at: string
}

interface Bet {
  id: string
  user_id: string
  choice: "S" | "R" | "G"
  amount: number
  nonce: number
  commit_hash: string
  server_seed?: string
  winner?: "S" | "R" | "G"
  payout: number
  revealed: boolean
  started_at: string
  resolved_at?: string
}

interface Purchase {
  id: string
  user_id: string
  stars_amount: number
  game_money: number
  tg_payment_id: string
  created_at: string
}

export const BASE = "/api/snail" // All API calls go through internal proxy

// Stock Trading APIs
export async function fetchStocks() {
  const r = await fetch(`${BASE}/stocks/list`, { cache: "no-store" })
  if (!r.ok) throw new Error("Failed to fetch stocks")
  return r.json()
}

export async function fetchHistory(symbol: string, params?: { limit?: number; minutes?: number }) {
  const qs = new URLSearchParams()
  if (params?.limit) qs.set("limit", String(params.limit))
  if (params?.minutes) qs.set("minutes", String(params.minutes))
  const r = await fetch(`${BASE}/stocks/history?symbol=${encodeURIComponent(symbol)}&${qs.toString()}`, {
    cache: "no-store",
  })
  if (!r.ok) throw new Error("Failed to fetch history")
  return r.json()
}

export async function fetchPortfolio(tgUserId: string) {
  const r = await fetch(`${BASE}/portfolio`, {
    headers: { "x-tg-user-id": tgUserId, "cache-control": "no-store" },
  })
  if (!r.ok) throw new Error("Failed to fetch portfolio")
  return r.json()
}

export async function tradeBuy(tgUserId: string, body: { symbol: string; qty: number }) {
  const r = await fetch(`${BASE}/trade/buy`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-tg-user-id": tgUserId },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error("Failed to buy")
  return r.json()
}

export async function tradeSell(tgUserId: string, body: { symbol: string; qty: number }) {
  const r = await fetch(`${BASE}/trade/sell`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-tg-user-id": tgUserId },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error("Failed to sell")
  return r.json()
}

// Snail Racing Game APIs
export async function gameInit(tgUserId: string, payload: { tg_user_id: string; username: string }) {
  const r = await fetch(`${BASE}/game/init`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-tg-user-id": tgUserId },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error("Failed to init")
  return r.json()
}

export async function gameBalance(tgUserId: string) {
  const r = await fetch(`${BASE}/game/balance`, {
    headers: { "x-tg-user-id": tgUserId, "cache-control": "no-store" },
  })
  if (!r.ok) throw new Error("Failed to fetch balance")
  return r.json()
}

export async function gameBet(tgUserId: string, body: { choice: "S" | "R" | "G"; amount: number }) {
  const r = await fetch(`${BASE}/game/bet`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-tg-user-id": tgUserId },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error("Failed to bet")
  return r.json()
}

export async function gameReveal(tgUserId: string, body: { bet_id: string }) {
  const r = await fetch(`${BASE}/game/reveal`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-tg-user-id": tgUserId },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error("Failed to reveal")
  return r.json()
}

export async function gameHealth() {
  const r = await fetch(`${BASE}/game/health`, { cache: "no-store" })
  if (!r.ok) throw new Error("Failed to check health")
  return r.json()
}

export const initUser = async (tgUserId: string, username: string) => {
  try {
    const result = await gameInit(tgUserId, { tg_user_id: tgUserId, username })
    return { ok: true, user: result }
  } catch (error) {
    console.error("Init user error:", error)
    return { ok: false, error: "Failed to initialize user" }
  }
}

export const getBalance = async (tgUserId: string) => {
  try {
    const result = await gameBalance(tgUserId)
    return { ok: true, user: result }
  } catch (error) {
    console.error("Get balance error:", error)
    return { ok: false, error: "Failed to get balance" }
  }
}

export const placeBet = async (tgUserId: string, choice: "S" | "R" | "G", amount: number) => {
  try {
    const result = await gameBet(tgUserId, { choice, amount })
    return { ok: true, bet: result, commit_hash: result.commit_hash }
  } catch (error) {
    console.error("Place bet error:", error)
    return { ok: false, error: "Failed to place bet" }
  }
}

export const revealBet = async (tgUserId: string, betId: string) => {
  try {
    const result = await gameReveal(tgUserId, { bet_id: betId })
    return { ok: true, ...result }
  } catch (error) {
    console.error("Reveal bet error:", error)
    return { ok: false, error: "Failed to reveal bet" }
  }
}

export const purchaseStars = async (tgUserId: string, starsAmount: number, paymentId: string) => {
  try {
    const supabase = createClient()

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("tg_user_id", tgUserId)
      .single()

    if (userError || !user) {
      return { ok: false, error: "User not found" }
    }

    // Calculate game money (1 star = 100 game money)
    const gameMoney = starsAmount * 100

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        stars_amount: starsAmount,
        game_money: gameMoney,
        tg_payment_id: paymentId,
      })
      .select()
      .single()

    if (purchaseError) {
      console.error("Error creating purchase:", purchaseError)
      return { ok: false, error: purchaseError.message }
    }

    // Update user balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: user.balance + gameMoney })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating balance:", updateError)
      return { ok: false, error: updateError.message }
    }

    return { ok: true, purchase, new_balance: user.balance + gameMoney }
  } catch (error) {
    console.error("Purchase stars error:", error)
    return { ok: false, error: "Failed to process purchase" }
  }
}

export const getLeaderboard = async () => {
  try {
    const supabase = createClient()

    const { data: leaderboard, error } = await supabase
      .from("leaderboard_view")
      .select("*")
      .order("snail_accumulated", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return { ok: false, error: error.message }
    }

    return { ok: true, leaderboard }
  } catch (error) {
    console.error("Get leaderboard error:", error)
    return { ok: false, error: "Failed to get leaderboard" }
  }
}

export const getRaceProgression = async (betId: string) => {
  try {
    const supabase = createClient()

    // Get bet details
    const { data: bet, error: betError } = await supabase.from("bets").select("*").eq("id", betId).single()

    if (betError || !bet) {
      return { ok: false, error: "Bet not found" }
    }

    // Generate the same winner as revealBet would
    const hash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(bet.server_seed + bet.nonce))
      .then((buffer) =>
        Array.from(new Uint8Array(buffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      )

    const hashValue = Number.parseInt(hash.substring(0, 8), 16)
    const winners = ["S", "R", "G"]
    const winner = winners[hashValue % 3] as "S" | "R" | "G"

    // Generate realistic race progression that leads to this winner
    const progression = generateRaceProgression(winner, bet.server_seed, bet.nonce)

    return {
      ok: true,
      winner,
      progression,
    }
  } catch (error) {
    console.error("Get race progression error:", error)
    return { ok: false, error: "Failed to get race progression" }
  }
}

function generateRaceProgression(winner: "S" | "R" | "G", serverSeed: string, nonce: number) {
  const snails = ["S", "R", "G"]
  const winnerIndex = snails.indexOf(winner)

  // Use server seed to generate consistent random progression
  const seedHash = serverSeed + nonce.toString()
  let seedIndex = 0

  const getSeededRandom = () => {
    const char = seedHash.charCodeAt(seedIndex % seedHash.length)
    seedIndex++
    return (char % 100) / 100
  }

  const progression = []
  const positions = [0, 0, 0] // Starting positions for S, R, G

  for (let frame = 0; frame < 10; frame++) {
    const timeProgress = frame / 9 // 0 to 1

    // Each snail moves with some randomness, but winner is guaranteed to be ahead at the end
    for (let i = 0; i < 3; i++) {
      if (frame < 8) {
        const baseSpeed = 0.08 + getSeededRandom() * 0.02 // 8-10% per frame, similar speeds
        positions[i] = Math.min(positions[i] + baseSpeed, 0.8) // Cap at 80% for first 8 seconds
      } else {
        if (i === winnerIndex) {
          // Winner speeds up dramatically in final 2 seconds
          const winnerSpeed = 0.15 + getSeededRandom() * 0.05 // 15-20% per frame
          positions[i] = Math.min(positions[i] + winnerSpeed, 1)
        } else {
          // Non-winners move much slower in final stretch
          const slowSpeed = 0.03 + getSeededRandom() * 0.02 // 3-5% per frame
          positions[i] = Math.min(positions[i] + slowSpeed, 0.95)
        }
      }
    }

    if (frame === 9) {
      positions[winnerIndex] = 1
      for (let i = 0; i < 3; i++) {
        if (i !== winnerIndex) {
          positions[i] = Math.min(positions[i], 0.95)
        }
      }
    }

    progression.push({
      time: frame,
      positions: [...positions],
    })
  }

  return progression
}

// Legacy API object for backward compatibility
export const api = {
  init: (p: { tg_user_id: string; username?: string }) => initUser(p.tg_user_id, p.username || ""),
  balance: (tgUserId: string) => getBalance(tgUserId),
  bet: (tgUserId: string, choice: "S" | "R" | "G", amount: number) => placeBet(tgUserId, choice, amount),
  reveal: (tgUserId: string, bet_id: string) => revealBet(tgUserId, bet_id),
  starsWebhook: (p: { tg_user_id: string; stars_amount: number; tg_payment_id: string }) =>
    purchaseStars(p.tg_user_id, p.stars_amount, p.tg_payment_id),
  raceProgression: (betId: string) => getRaceProgression(betId),
}
