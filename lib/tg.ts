export function initTG() {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp
    tg.ready()
    tg.expand()
    return tg
  }
  return null
}

export function getTG() {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

export function getTelegramUser() {
  if (typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user
  }
  return null
}

export function showAlert(message: string) {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message)
  } else {
    alert(message)
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void
        expand(): void
        initDataUnsafe?: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
        }
        showAlert(message: string): void
      }
    }
  }
}
