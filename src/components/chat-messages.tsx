'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: {
    id: string
    user: string
    text: string
    ts: string
  }
}

export function ChatMessages({ children }: React.PropsWithChildren) {
  return (
    <div className="h-full px-5 overflow-y-auto">
      <div className="space-y-4 py-5">
        {children}
      </div>
    </div>
  )
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.user === 'You'
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>{message.user[0]}</AvatarFallback>
      </Avatar>
      <div className={cn('flex flex-col gap-1', isUser && 'items-end')}>
        <div className={cn(
          'rounded-lg px-3 py-2 max-w-[250px]',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
        )}>
          <p className="text-sm">{message.text}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {message.ts}
        </span>
      </div>
    </div>
  )
}
