import type { PropsWithChildren } from 'react'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pebbles',
  description: 'Chat with Pebbles!',
}

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" className={geist.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
