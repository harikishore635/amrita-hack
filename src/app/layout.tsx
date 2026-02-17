import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PensionChain - Secure Your Future',
  description: 'Blockchain pension system for India\'s 450 million informal workers. Start with just ₹10/day.',
  keywords: ['pension', 'blockchain', 'retirement', 'informal workers', 'India', 'DeFi'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}