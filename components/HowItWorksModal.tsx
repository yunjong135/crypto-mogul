"use client"

interface HowItWorksModalProps {
  onClose: () => void
}

export default function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">🐌 How It Works</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🎮 Game Rules</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Choose one of three snails: S, R, or G</li>
                <li>Place your bet (minimum 1 game money)</li>
                <li>Watch the 20-second race</li>
                <li>Win 2.5x your bet if your snail wins!</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">💫 Telegram Stars</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Purchase game money using Telegram Stars</li>
                <li>Secure payment through Telegram</li>
                <li>Instant balance updates</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🔒 Provably Fair</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Each race uses cryptographic verification</li>
                <li>Commit hash shown before race starts</li>
                <li>Server seed and nonce revealed after</li>
                <li>You can verify results independently</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🏆 Leaderboard</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Earn SNAIL tokens for every 100 game money</li>
                <li>Compete with other players</li>
                <li>Real-time updates</li>
                <li>Withdrawals coming soon!</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200"
          >
            Got it! 🐌
          </button>
        </div>
      </div>
    </div>
  )
}
