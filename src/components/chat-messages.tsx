'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
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

      {/* Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarFallback>{message.user[0]}</AvatarFallback>
      </Avatar>

      {/* Text message */}
      <div className={cn('flex flex-col gap-1', isUser && 'items-end')}>
        <div className={cn(
          'rounded-lg px-3 py-2 max-w-75',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
        )}>
          {/* TODO: Allow text to display as-is */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.text}
          </p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground">
          {message.ts}
        </span>
      </div>
    </div>
  )
}

export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-muted text-muted-foreground">
          <Skeleton className="h-8 w-8 rounded-full" />
        </AvatarFallback>
      </Avatar>

      {/* Text message */}
      <div className={cn('flex flex-col gap-1', isUser && 'items-end')}>
        <Skeleton
          className={cn(
            'rounded-lg px-3 py-2 w-75 space-y-1',
            isUser ? 'bg-primary/10' : 'bg-muted/50',
          )}
        >
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-4 w-[70%]" />
        </Skeleton>

        {/* Timestamp skeleton */}
        <Skeleton className="h-3.5 w-12" />
      </div>
    </div>
  )
}

export function ChatMessageSkeletonList({ count } : { count: number }) {
  return (
    Array.from({ length: count }).map((_, i) => (
      <ChatMessageSkeleton key={i} isUser={!!(i % 2)} />
    ))
  )
}
