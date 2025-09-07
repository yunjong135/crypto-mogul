const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.snail-race.com"

interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const result = await response.json()
    if (!result.ok) {
      throw new Error(result.error || "API request failed")
    }

    return result.data
  }

  async init(params: { tg_user_id: string; username: string; initData?: string }) {
    return this.request("/api/init", {
      method: "POST",
      headers: {
        "x-tg-user-id": params.tg_user_id,
      },
      body: JSON.stringify(params),
    })
  }

  async balance(tg_user_id: string): Promise<{ balance: number }> {
    return this.request(`/api/balance`, {
      headers: {
        "x-tg-user-id": tg_user_id,
      },
    })
  }

  async bet(tg_user_id: string, choice: "S" | "R" | "G", amount: number) {
    return this.request("/api/bet", {
      method: "POST",
      headers: {
        "x-tg-user-id": tg_user_id,
      },
      body: JSON.stringify({ choice, amount }),
    })
  }

  async reveal(tg_user_id: string, bet_id: string) {
    return this.request("/api/reveal", {
      method: "POST",
      headers: {
        "x-tg-user-id": tg_user_id,
      },
      body: JSON.stringify({ bet_id }),
    })
  }

  payments = {
    createInvoice: async (stars: number, tg_user_id: string): Promise<{ invoice_link: string }> => {
      return this.request("/payments/invoice", {
        method: "POST",
        headers: {
          "x-tg-user-id": tg_user_id,
        },
        body: JSON.stringify({ stars }),
      })
    },

    confirm: async (params: { tg_user_id: string; tg_payment_id: string; stars_amount: number }): Promise<{
      ok: boolean
      balance_after: number
    }> => {
      return this.request("/payments/confirm", {
        method: "POST",
        headers: {
          "x-tg-user-id": params.tg_user_id,
        },
        body: JSON.stringify(params),
      })
    },
  }

  stocks = {
    list: async (): Promise<Stock[]> => {
      return this.request("/stocks/list")
    },

    quote: async (symbol: string): Promise<Stock> => {
      return this.request(`/stocks/quote?symbol=${symbol}`)
    },
  }

  trade = {
    buy: async (tg_user_id: string, params: { symbol: string; qty: number }) => {
      return this.request("/trade/buy", {
        method: "POST",
        headers: {
          "x-tg-user-id": tg_user_id,
        },
        body: JSON.stringify(params),
      })
    },

    sell: async (tg_user_id: string, params: { symbol: string; qty: number }) => {
      return this.request("/trade/sell", {
        method: "POST",
        headers: {
          "x-tg-user-id": tg_user_id,
        },
        body: JSON.stringify(params),
      })
    },
  }

  async portfolio(tg_user_id: string): Promise<Portfolio> {
    return this.request("/portfolio", {
      headers: {
        "x-tg-user-id": tg_user_id,
      },
    })
  }

  async rankingTop(n = 100) {
    return this.request(`/ranking/top?n=${n}`)
  }

  tickets = {
    mine: async (tg_user_id: string): Promise<Ticket[]> => {
      return this.request("/lottery/my", {
        headers: {
          "x-tg-user-id": tg_user_id,
        },
      })
    },
  }
}

export const api = new ApiClient()

export interface Stock {
  symbol: string
  name: string
  price: number
  volatility: number
  dividend_yield: number
  last_price_at?: string
}

export interface Position {
  symbol: string
  qty: number
  avg_price: number
  mkt_value?: number
  pnl?: number
}

export interface Portfolio {
  cash: number
  positions: Position[]
  equity: number
  total_value: number
}

export interface Ticket {
  id: string
  reason: string
  expires_at: string
  is_used: boolean
}
