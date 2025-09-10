import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Snail Racing Game',
  description: 'A fun snail racing game for Telegram Mini App',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
