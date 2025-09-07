"use client"

import { useState } from "react"
import { copyToClipboard } from "@/lib/utils"

interface FairnessPanelProps {
  betData: any
  result: any
}

export default function FairnessPanel({ betData, result }: FairnessPanelProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleCopy = async (text: string, type: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  if (!betData && !result) {
    return null
  }

  return (
    <div className="bg-gray-50 rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">🔒 Provably Fair</h2>

      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          This game uses cryptographic proof to ensure fair results that cannot be manipulated.
        </p>
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
        >
          {showAdvanced ? "Hide Technical Details" : "Show Technical Details"}
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-4 text-sm">
          {betData && !result && (
            <div>
              <p className="font-semibold text-gray-700 mb-2">Commit Hash:</p>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-2 rounded-lg border text-xs font-mono flex-1 break-all">
                  {betData.commit_hash}
                </code>
                <button
                  onClick={() => handleCopy(betData.commit_hash, "commit")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200"
                >
                  {copied === "commit" ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {result && (
            <>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Server Seed:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 rounded-lg border text-xs font-mono flex-1 break-all">
                    {result.server_seed}
                  </code>
                  <button
                    onClick={() => handleCopy(result.server_seed, "seed")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200"
                  >
                    {copied === "seed" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-2">Nonce:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 rounded-lg border text-xs font-mono flex-1">{result.nonce}</code>
                  <button
                    onClick={() => handleCopy(result.nonce.toString(), "nonce")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200"
                  >
                    {copied === "nonce" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-semibold text-blue-800 mb-2">Verification Rule:</p>
                <code className="text-xs text-blue-700 block">
                  winner = CHOICES[HMAC_SHA256(server_seed, bet_id) % 3]
                  <br />
                  commit = SHA256(server_seed + ':' + nonce)
                </code>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
