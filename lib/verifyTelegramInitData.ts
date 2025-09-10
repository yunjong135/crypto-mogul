import crypto from "crypto"

function getSecretKey(botToken: string) {
  return crypto.createHash("sha256").update(botToken).digest()
}

export function parseInitData(initData: string) {
  const params = new URLSearchParams(initData)
  const data: Record<string, string> = {}
  for (const [k, v] of params.entries()) data[k] = v
  return data
}

// Telegram 공식문서 방식 서명검증
export function verifyInitData(initData: string, botToken: string) {
  const data = parseInitData(initData)
  const hash = data.hash
  if (!hash) return false

  // hash 제외한 key=val 정렬
  const entries = Object.entries(data)
    .filter(([k]) => k !== "hash")
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n")

  const secretKey = getSecretKey(botToken)
  const hmac = crypto.createHmac("sha256", secretKey).update(entries).digest("hex")
  return hmac === hash
}
