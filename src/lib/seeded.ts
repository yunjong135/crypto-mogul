export function xorshift32(seed: number) {
  let x = seed | 0
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return ((x >>> 0) % 1_000_000) / 1_000_000
  }
}

export function seedFromHex(hex: string, salt: string): number {
  const h = (hex + salt)
    .replace(/[^0-9a-f]/gi, "")
    .padEnd(8, "0")
    .slice(0, 8)
  return Number.parseInt(h, 16) || 123456789
}
