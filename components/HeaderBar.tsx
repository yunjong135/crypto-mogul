interface HeaderBarProps {
  balance: number
  snailAccumulated: number
}

export default function HeaderBar({ balance, snailAccumulated }: HeaderBarProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-sm text-gray-300">Balance</div>
          <div className="text-xl font-bold text-yellow-400">{balance.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-300">Snail Points</div>
          <div className="text-xl font-bold text-green-400">{snailAccumulated.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
