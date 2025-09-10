"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import HeaderBar from "./HeaderBar"

export default function HeaderBarContainer() {
  const [balance, setBalance] = useState(0)
  const [snailAccumulated, setSnailAccumulated] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let sub: ReturnType<typeof supabase.channel> | null = null

    const run = async () => {
      // ✅ 현재 로그인된 유저 가져오기
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("getUser error:", userError)
        setLoading(false)
        return
      }

      if (!user) {
        console.warn("No logged-in user found")
        setLoading(false)
        return
      }

      // 최초 데이터 가져오기
      await fetchAssets(user.id)

      // 실시간 구독 (선택)
      sub = supabase
        .channel("user_assets_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_assets",
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchAssets(user.id)
        )
        .subscribe()
    }

    run()

    return () => {
      if (sub) sub.unsubscribe()
    }
  }, [])

  const fetchAssets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_assets")
        .select("balance, snail_accumulated")
        .eq("user_id", userId)
        .single()

      if (error) throw error
      setBalance(Number(data.balance) || 0)
      setSnailAccumulated(Number(data.snail_accumulated) || 0)
    } catch (e) {
      console.error("fetchAssets error:", e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  return <HeaderBar balance={balance} snailAccumulated={snailAccumulated} />
}

if (!user) {
  return <div className="p-6 text-center">Please log in to see your SNAIL balance 🐌</div>
}
