import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: Request) {
  const cookieName = process.env.COOKIE_NAME || "tgid"
  const url = new URL(req.url)
  const telegramIdFromQuery = url.searchParams.get("telegram_id") // 디버그용(선택)

  // 쿠키에서 tgid 꺼내기
  const cookieHeader = req.headers.get("cookie") || ""
  const cookies = Object.fromEntries(cookieHeader.split(/; */).map(c => c.split("=") as [string, string]))
  const telegramId = telegramIdFromQuery || cookies[cookieName]

  if (!telegramId) {
    return NextResponse.json({ ok: false, error: "no telegram id" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 서버에서만 사용
  )

  // 없으면 생성, 있으면 조회
  const { data: row, error } = await supabase
    .from("user_assets")
    .select("balance, snail_accumulated")
    .eq("telegram_id", telegramId)
    .single()

  if (error && error.code === "PGRST116") {
    // 레코드가 없으면 만들고 기본값 반환
    const { data: inserted, error: insertErr } = await supabase
      .from("user_assets")
      .insert({ telegram_id: telegramId })
      .select("balance, snail_accumulated")
      .single()

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, balance: Number(inserted.balance), snailAccumulated: Number(inserted.snail_accumulated) })
  }

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, balance: Number(row!.balance), snailAccumulated: Number(row!.snail_accumulated) })
}
