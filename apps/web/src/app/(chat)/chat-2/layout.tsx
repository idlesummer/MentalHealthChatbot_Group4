import type { PropsWithChildren } from 'react'

export default function Chat2Layout({ children }: PropsWithChildren) {
  return (
    <div className="bg-muted h-screen overflow-hidden">
      {children}
    </div>
  )
}
