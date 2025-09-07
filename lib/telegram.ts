interface TelegramUser {
  id: string
  username: string
  first_name?: string
  last_name?: string
}

export const getTelegramUser = (): TelegramUser => {
  // Check if running in Telegram WebApp
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp
    const initData = webApp.initDataUnsafe

    if (initData?.user) {
      return {
        id: initData.user.id.toString(),
        username: initData.user.username || `user${initData.user.id}`,
        first_name: initData.user.first_name,
        last_name: initData.user.last_name,
      }
    }
  }

  // Fallback for development/testing
  const stored = localStorage.getItem("mock_telegram_user")
  if (stored) {
    return JSON.parse(stored)
  }

  // Generate mock user for development
  const mockUser = {
    id: `mock_${Date.now()}`,
    username: `testuser${Math.floor(Math.random() * 1000)}`,
    first_name: "Test",
    last_name: "User",
  }

  localStorage.setItem("mock_telegram_user", JSON.stringify(mockUser))
  return mockUser
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            id: number
            username?: string
            first_name?: string
            last_name?: string
          }
        }
        openInvoice?: (url: string) => void
      }
    }
  }
}
