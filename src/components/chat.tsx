import { Send, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatStore } from '@/lib/store/chat'
import { cn, formatTimestamp } from '@/lib/utils'
import type { Message } from '@/lib/types'

type ChatMessageProps = {
  msg: Message
  className?: string
}

type ChatInputProps = {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void | Promise<void>
}

export function Chat({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-col mx-auto h-full max-w-5xl bg-background shadow-sm rounded-2xl">
      {children}
    </div>
  )
}

export function ChatHeader() {
  // TODO: Temporary
  const clear = useChatStore(s => s.clear)
  return (
    <div className="flex flex-row items-center py-4 px-8 space-x-4 border-b">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/avatars/pebbles.svg" />
        <AvatarFallback>P</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold">Pebbles the Pibble</h1>
        <p className="text-xs text-green-500">Online</p>
      </div>
      <Button
        variant="secondary"
        size="icon"
        onClick={clear}
        className="ml-auto rounded-full" 
      >
        <Trash2 />
      </Button>
    </div>
  )
}

export function ChatMessages({ children }: React.PropsWithChildren) {
  return (
    <div className="flex-1 h-full overflow-y-auto scroll-smooth px-4 py-8 space-y-4">
      {children}
    </div>
  )
}

export function ChatMessage({ msg, className }: ChatMessageProps) {
  const isUser = msg.user === 'You'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse', className)}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/avatars/pebbles.svg" />
          <AvatarFallback>{msg.user[0]}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-1', isUser && 'items-end')}>
        <div className={cn(
          'rounded-lg px-3 py-2 max-w-[50rem]', 
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground',
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTimestamp(msg.ts)}
        </span>
      </div>
    </div>
  )
}

export function ChatInput({ value, onChange, onSubmit }: ChatInputProps) {
  return (
    <div className="p-0">
      <div className="border-t p-3 w-full">
        <form
          onSubmit={e => { e.preventDefault(); onSubmit() }}
          className="flex gap-2"
        >
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
