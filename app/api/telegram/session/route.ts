import { NextResponse } from "next/server"
import { verifyInitData, parseInitData } from "@/lib/verifyTelegramInitData"

export async function POST(req: Request) {
  try {
    const { initData } = await req.json()
    const botToken = process.env.TELEGRAM_BOT_TOKEN!
    const cookieName = process.env.COOKIE_NAME || "tgid"

    if (!initData || !botToken) {
      return NextResponse.json({ ok: false, error: "missing initData or bot token" }, { status: 400 })
    }

    const ok = verifyInitData(initData, botToken)
    if (!ok) {
      return NextResponse.json({ ok: false, error: "invalid initData" }, { status: 401 })
    }

    const data = parseInitData(initData)
    // initDataUnsafe.user는 JSON 문자열로 들어옴
    const user = data.user ? JSON.parse(data.user) : null
    const telegramId = user?.id?.toString()
    if (!telegramId) {
      return NextResponse.json({ ok: false, error: "no telegram user id" }, { status: 400 })
    }

    // HttpOnly 쿠키에 저장 (7일 예시)
    const res = NextResponse.json({ ok: true })
    res.cookies.set(cookieName, telegramId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 })
  }
}
