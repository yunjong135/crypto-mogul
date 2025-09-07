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

export const initUser = async (tgUserId: string, username: string) => {
  try {
    const supabase = createClient()

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("tg_user_id", tgUserId)
      .single()

    if (existingUser) {
      return { ok: true, user: existingUser }
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        tg_user_id: tgUserId,
        username: username || `User${tgUserId.slice(-4)}`,
        balance: 1000, // Starting balance
        snail_accumulated: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating user:", insertError)
      return { ok: false, error: insertError.message }
    }

    return { ok: true, user: newUser }
  } catch (error) {
    console.error("Init user error:", error)
    return { ok: false, error: "Failed to initialize user" }
  }
}

export const getBalance = async (tgUserId: string) => {
  try {
    const supabase = createClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("tg_user_id", tgUserId).single()

    if (error) {
      console.error("Error fetching balance:", error)
      return { ok: false, error: error.message }
    }

    return { ok: true, user }
  } catch (error) {
    console.error("Get balance error:", error)
    return { ok: false, error: "Failed to get balance" }
  }
}

export const placeBet = async (tgUserId: string, choice: "S" | "R" | "G", amount: number) => {
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

    if (user.balance < amount) {
      return { ok: false, error: "Insufficient balance" }
    }

    // Generate nonce and commit hash for provably fair
    const nonce = Date.now()
    const serverSeed = Math.random().toString(36).substring(2, 15)
    const commitHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(serverSeed + nonce))
      .then((buffer) =>
        Array.from(new Uint8Array(buffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      )

    // Create bet
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .insert({
        user_id: user.id,
        choice,
        amount,
        nonce,
        commit_hash: commitHash,
        server_seed: serverSeed,
        payout: 0,
        revealed: false,
      })
      .select()
      .single()

    if (betError) {
      console.error("Error creating bet:", betError)
      return { ok: false, error: betError.message }
    }

    // Update user balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: user.balance - amount })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating balance:", updateError)
      return { ok: false, error: updateError.message }
    }

    return { ok: true, bet, commit_hash: commitHash }
  } catch (error) {
    console.error("Place bet error:", error)
    return { ok: false, error: "Failed to place bet" }
  }
}

export const revealBet = async (tgUserId: string, betId: string) => {
  try {
    const supabase = createClient()

    // Get bet and user
    const { data: bet, error: betError } = await supabase.from("bets").select("*, users(*)").eq("id", betId).single()

    if (betError || !bet) {
      return { ok: false, error: "Bet not found" }
    }

    if (bet.revealed) {
      return { ok: false, error: "Bet already revealed" }
    }

    // Generate race result using server seed and nonce
    const hash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(bet.server_seed + bet.nonce))
      .then((buffer) =>
        Array.from(new Uint8Array(buffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      )

    // Use first 8 characters of hash to determine winner
    const hashValue = Number.parseInt(hash.substring(0, 8), 16)
    const winners = ["S", "R", "G"]
    const winner = winners[hashValue % 3] as "S" | "R" | "G"

    const isWin = bet.choice === winner
    const payout = isWin ? bet.amount * 2.5 : 0

    // Update bet
    const { error: updateBetError } = await supabase
      .from("bets")
      .update({
        winner,
        payout,
        revealed: true,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", betId)

    if (updateBetError) {
      console.error("Error updating bet:", updateBetError)
      return { ok: false, error: updateBetError.message }
    }

    // Update user balance and snail_accumulated
    const newBalance = bet.users.balance + payout
    const newSnailAccumulated = bet.users.snail_accumulated + bet.amount

    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        balance: newBalance,
        snail_accumulated: newSnailAccumulated,
      })
      .eq("id", bet.user_id)

    if (updateUserError) {
      console.error("Error updating user:", updateUserError)
      return { ok: false, error: updateUserError.message }
    }

    return {
      ok: true,
      winner,
      payout,
      server_seed: bet.server_seed,
      is_win: isWin,
    }
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
