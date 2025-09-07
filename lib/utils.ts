import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand("copy")
      textArea.remove()
      return success
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

export const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} 💰`
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
