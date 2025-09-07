interface HeaderBarProps {
  balance: number
  snailAccumulated: number
}

export default function HeaderBar({ balance, snailAccumulated }: HeaderBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">🐌 Snail Racing Game</h1>

      <div className="space-y-2">
        <div className="text-lg font-semibold text-green-600">Balance: {balance.toLocaleString()} 💰</div>

        <div className="text-sm text-gray-600">100 game money = 1 SNAIL (display-only) · Withdrawals later</div>

        <div className="text-xs text-gray-500">Total SNAIL: {Math.floor(snailAccumulated / 100).toLocaleString()}</div>

        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
          <span>Payout x2.5</span>
          <span>·</span>
          <span>Race = 20s</span>
          <span>·</span>
          <span>Snails: S / R / G</span>
        </div>
      </div>
    </div>
  )
}
