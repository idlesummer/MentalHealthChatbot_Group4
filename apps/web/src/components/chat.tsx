import { Send, Trash2 } from 'lucide-react'
import MessageSpinner from '@/components/elements/message-spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useChatMessagesStore } from '@/lib/store/chat-messages'
import { cn, formatTimestamp } from '@/lib/utils'

import type { KeyboardEvent, PropsWithChildren } from 'react'
import type { Message } from '@rainev/cogni'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { usePromptStateStore } from '@/lib/blueprints/promptStore'

export function Chat({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col mx-auto h-full max-w-5xl bg-background shadow-sm rounded-2xl">
      {children}
    </div>
  )
}

export function ChatHeader() {
  // TODO: Temporary
  const clearMessages = useChatMessagesStore(s => s.clearMessages)
  const promptTechnique = usePromptStateStore((s) => s.promptTechnique)
  const setPromptTechnique = usePromptStateStore(s => s.setPromptTechnique)
  return (
    <div className="flex flex-row items-center pt-4 px-8 space-x-4">
      <Avatar className="h-10 w-10 bg-muted border-2 border-green-400">
        <AvatarImage src="/avatars/pebbles.svg" />
        <AvatarFallback>P</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold">Pebbles the Pibble</h1>
        <p className="text-xs text-green-400">Online</p>
      </div>

      <Select
        value={promptTechnique}
        onValueChange={(value: string) =>
          setPromptTechnique(value as typeof promptTechnique)
        }
      >
        <SelectTrigger className="w-44 ml-auto">
          <SelectValue placeholder="Prompt technique" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="few-shot">Few-shot</SelectItem>
          <SelectItem value="chain-of-thought">Chain-of-thought</SelectItem>
          <SelectItem value="persona">Persona-based</SelectItem>
          <SelectItem value="plan-and-solve">Plan-and-solve</SelectItem>
          {/* <SelectItem value="plan-and-solve">Plan &amp; Solve</SelectItem> */}
        </SelectContent>
      </Select>

      <Button
        variant="secondary"
        size="icon"
        onClick={clearMessages}
        className="ml-auto rounded-full"
      >
        <Trash2 />
      </Button>
    </div>
  )
}

export function ChatMessages({ children }: PropsWithChildren) {
  return (
    <div className="flex-1 h-full overflow-y-auto scroll-smooth px-4 py-8 space-y-4">
      {children}
    </div>
  )
}

type ChatMessageProps = {
  className?: string
  msg?: Message
}

export function ChatMessage({ msg, className }: ChatMessageProps) {
  const isUser = msg?.user === 'You'
  const hasText = !!(msg?.text && msg?.text.trim().length > 0)

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse', className)}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-muted">
          <AvatarImage src="/avatars/pebbles.svg" />
          <AvatarFallback>{msg?.user[0]}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-1', isUser && 'items-end')}>
        <div className={cn(
          'px-3 py-2 max-w-200 rounded-lg',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none',
        )}>
          <div className="text-sm whitespace-pre-wrap wrap-break-word">
            {hasText
              ? msg.text
              : <MessageSpinner />}
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {msg ? formatTimestamp(msg.ts) : 'Typing…'}
        </span>
      </div>
    </div>
  )
}

type ChatInputProps = {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void | Promise<void>
}

export function ChatInput({ value, onChange, onSubmit }: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    onSubmit()
  }
  return (
    <div className="p-0">
      <div className="px-3 pb-6 w-full">
        <form
          onSubmit={e => { e.preventDefault(); onSubmit() }}
          className="flex gap-2"
        >
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 resize-none min-h-4 max-h-96"
          />
          <Button variant="outline" type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export function ChatMessageSkeleton({ isUser }: { isUser: boolean }) {
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar skeleton */}
      {!isUser && <Skeleton className="h-8 w-8 rounded-full" />}

      <div className={cn('flex flex-col gap-1', isUser && 'items-end')}>
        {/* Bubble skeleton */}
        <Skeleton className={cn(
          'px-3 py-2 w-[20rem] rounded-lg',
          isUser
            ? 'bg-primary/10 rounded-br-none'
            : 'bg-muted/60 rounded-bl-none',
        )}>
          {/* Simulate multiple lines of text */}
          <Skeleton className="h-3 w-70 mb-2 rounded-full" />
          <Skeleton className="h-3 w-40 mb-2 rounded-full" />
          <Skeleton className="h-3 w-50 rounded-full" />
        </Skeleton>

        {/* Timestamp skeleton */}
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function ChatMessageSkeletonList({ count }: { count: number }) {
  return (
    Array.from({ length: count }).map((_, i) => (
      <ChatMessageSkeleton key={i} isUser={!!(i % 2)} />
    ))
  )
}
