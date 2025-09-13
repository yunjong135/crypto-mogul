interface HeaderBarProps {
  tgUserId: number | null
}

export function HeaderBar({ tgUserId }: HeaderBarProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/snail-racing-logo.png" alt="Snail Racing Game" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-bold text-white">Snail Racing</h1>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">User ID: {tgUserId || "Guest"}</div>
        </div>
      </div>
    </div>
  )
}
