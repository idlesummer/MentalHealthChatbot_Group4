import type { PropsWithChildren } from 'react'

export default function Chat2Layout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen bg-muted overflow-hidden p-4">
      {children}
    </div>
  )
}
