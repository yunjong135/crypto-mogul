"use client"

import { useState, useEffect } from "react"
import { getTG } from "@/lib/tg"
import { api } from "@/lib/api"

export function useSnailUser() {
  const [tgUserId, setTgUserId] = useState<string>("")
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const refreshBalance = async () => {
    if (!tgUserId) return
    try {
      const result = await api.balance(tgUserId)
      setBalance(result.balance)
    } catch (error) {
      console.error("Failed to refresh balance:", error)
    }
  }

  useEffect(() => {
    const initUser = async () => {
      const tg = getTG()
      let userId = ""
      let username = ""

      if (tg?.initDataUnsafe?.user) {
        userId = tg.initDataUnsafe.user.id.toString()
        username = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name || ""
      } else {
        // Fallback for development
        userId = "dev_user_123"
        username = "dev_user"
      }

      setTgUserId(userId)

      try {
        await api.init({
          tg_user_id: userId,
          username,
          initData: tg?.initData,
        })
        await refreshBalance()
      } catch (error) {
        console.error("Failed to initialize user:", error)
      } finally {
        setLoading(false)
      }
    }

    initUser()
  }, [])

  return {
    tgUserId,
    balance,
    refreshBalance,
    loading,
  }
}
