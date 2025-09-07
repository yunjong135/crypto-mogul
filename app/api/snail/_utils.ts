export const runtime = "nodejs" as const
export const dynamic = "force-dynamic" as const

export async function passthrough(req: Request, path: string) {
  const API = process.env.NEXT_PUBLIC_API_BASE ?? "https://api.snail-race.com"

  const inHeaders = new Headers(req.headers)
  const headers = new Headers()

  const xUser = inHeaders.get("x-tg-user-id")
  if (xUser) headers.set("x-tg-user-id", xUser)
  const ct = inHeaders.get("content-type")
  if (ct) headers.set("content-type", ct)

  const qIndex = req.url.indexOf("?")
  const search = qIndex >= 0 ? req.url.slice(qIndex) : ""
  const url = `${API}${path}${search}`

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer()
  }

  const r = await fetch(url, init)
  const buf = await r.arrayBuffer()

  return new Response(buf, {
    status: r.status,
    headers: { "content-type": r.headers.get("content-type") ?? "application/json" },
  })
}
