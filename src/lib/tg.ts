interface TelegramWebApp {
  ready(): void
  expand(): void
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      username?: string
      first_name?: string
    }
  }
  openInvoice(url: string, callback?: (status: string) => void): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export function getTG(): TelegramWebApp | null {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

export function initTG(): TelegramWebApp | null {
  const tg = getTG()
  if (tg) {
    tg.ready()
    tg.expand()
  }
  return tg
}
