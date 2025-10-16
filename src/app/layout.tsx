import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pebbles',
  description: 'Chat with Pebbles!',
}

export default function RootLayout({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
