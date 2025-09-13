"use client"

import { useState, useEffect } from "react"
import { getTelegramUser } from "@/lib/tg"

export function useSnailUser() {
  const [tgUserId, setTgUserId] = useState<number | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initUser = async () => {
      try {
        const tgUser = getTelegramUser()
        if (tgUser) {
          setTgUserId(tgUser.id)
          // Mock balance for now
          setBalance(1000)
        } else {
          // Development fallback
          setTgUserId(123456789)
          setBalance(1000)
        }
      } catch (error) {
        console.error("Failed to initialize user:", error)
        // Fallback for development
        setTgUserId(123456789)
        setBalance(1000)
      } finally {
        setLoading(false)
      }
    }

    initUser()
  }, [])

  const refreshBalance = async () => {
    // Mock refresh - in real app would fetch from API
    console.log("Refreshing balance...")
  }

  return {
    tgUserId,
    balance,
    refreshBalance,
    loading,
  }
}
