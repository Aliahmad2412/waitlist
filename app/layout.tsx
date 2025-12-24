import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Anchored - Waitlist',
  description: 'Join the waitlist for Anchored by Rochelle Trow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

