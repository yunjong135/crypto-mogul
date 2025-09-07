"use client"

import { useState, useEffect } from "react"
import { api, type Ticket } from "@/lib/api"

interface TicketsPanelProps {
  tgUserId: string
}

export function TicketsPanel({ tgUserId }: TicketsPanelProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      if (!tgUserId) return
      try {
        const result = await api.tickets.mine(tgUserId)
        setTickets(result)
      } catch (error) {
        console.error("Failed to fetch tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [tgUserId])

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const getDaysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <h3 className="text-lg font-bold mb-4">🎫 My Lottery Tickets</h3>

      {tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No tickets yet</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const expired = isExpired(ticket.expires_at)
            const daysLeft = getDaysLeft(ticket.expires_at)

            return (
              <div
                key={ticket.id}
                className={`p-4 border rounded-lg ${
                  ticket.is_used
                    ? "bg-gray-50 border-gray-300"
                    : expired
                      ? "bg-red-50 border-red-300"
                      : "bg-green-50 border-green-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{ticket.reason}</div>
                    <div className="text-sm text-gray-600">ID: {ticket.id.slice(0, 8)}...</div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        ticket.is_used
                          ? "text-gray-500"
                          : expired
                            ? "text-red-600"
                            : daysLeft <= 1
                              ? "text-orange-600"
                              : "text-green-600"
                      }`}
                    >
                      {ticket.is_used
                        ? "USED"
                        : expired
                          ? "EXPIRED"
                          : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        Game money is for in-app activities (racing entry, stock purchases, etc.) and is NOT directly exchangeable for
        cash or lottery. Lottery tickets are non-transferable and expire in 7 days.
      </div>
    </div>
  )
}
