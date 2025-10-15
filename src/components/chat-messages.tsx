'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: {
    id: number
    user: string
    message: string
    time: string
  }
}

export function ChatMessages({ children }: React.PropsWithChildren) {
  return (
    <ScrollArea className="h-full px-5 overflow-hidden">
      <div className="space-y-4 py-5">
        {children}
      </div>
    </ScrollArea>
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
          <p className="text-sm">{message.message}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {message.time}
        </span>
      </div>
    </div>
  )
}
