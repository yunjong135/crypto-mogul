"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Ticket {
  id: string
  type: string
  purchaseDate: Date
  expiryDate: Date
  status: "active" | "expired" | "used"
  value: number
}

interface TicketsPanelProps {
  tgUserId: number | null
}

export function TicketsPanel({ tgUserId }: TicketsPanelProps) {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "T001",
      type: "Lucky Draw",
      purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "active",
      value: 100,
    },
    {
      id: "T002",
      type: "Bonus Ticket",
      purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      status: "active",
      value: 50,
    },
  ])

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleUseTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: "used" as const } : ticket)),
    )
    setSelectedTicket(null)
    console.log(`Used ticket: ${ticketId}`)
  }

  const handlePurchaseTicket = () => {
    const newTicket: Ticket = {
      id: `T${String(tickets.length + 1).padStart(3, "0")}`,
      type: "Lucky Draw",
      purchaseDate: new Date(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "active",
      value: 100,
    }
    setTickets((prev) => [...prev, newTicket])
    console.log("Purchased new ticket")
  }

  const activeTickets = tickets.filter((t) => t.status === "active")
  const expiredTickets = tickets.filter((t) => t.status === "expired" || t.status === "used")

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Lottery Tickets</h3>
        <Button onClick={handlePurchaseTicket} className="bg-yellow-600 hover:bg-yellow-700 text-white" size="sm">
          Buy Ticket (100 coins)
        </Button>
      </div>

      {/* Active Tickets */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-white mb-3">Active Tickets ({activeTickets.length})</h4>
        {activeTickets.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>No active tickets</p>
            <p className="text-sm">Purchase tickets to participate in lottery draws</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTickets.map((ticket) => {
              const daysLeft = getDaysUntilExpiry(ticket.expiryDate)
              return (
                <div
                  key={ticket.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedTicket === ticket.id
                      ? "bg-yellow-900 border-yellow-600"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white">{ticket.type}</div>
                      <div className="text-sm text-gray-400">ID: {ticket.id}</div>
                      <div className="text-sm text-gray-400">Expires: {formatDate(ticket.expiryDate)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-400">${ticket.value}</div>
                      <div className={`text-sm ${daysLeft <= 1 ? "text-red-400" : "text-green-400"}`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : "Expires today"}
                      </div>
                    </div>
                  </div>

                  {selectedTicket === ticket.id && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUseTicket(ticket.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Use Ticket
                        </Button>
                        <div className="text-xs text-gray-400 flex items-center">
                          Non-transferable • Expires in 7 days
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Expired/Used Tickets */}
      {expiredTickets.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-400 mb-3">Expired/Used Tickets ({expiredTickets.length})</h4>
          <div className="space-y-2">
            {expiredTickets.map((ticket) => (
              <div key={ticket.id} className="p-3 bg-gray-900 rounded-lg opacity-60">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-400">{ticket.type}</div>
                    <div className="text-sm text-gray-500">ID: {ticket.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 capitalize">{ticket.status}</div>
                    <div className="text-sm text-gray-500">{formatDate(ticket.expiryDate)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
