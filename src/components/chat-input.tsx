'use client'

import { useRef } from 'react'
import { ArrowUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ChatInput({
  input,
  setInput,
  onSend,
}: {
  input: string
  setInput: (val: string) => void
  onSend: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSend()
        inputRef.current?.focus()
      }}
      className="w-full rounded-xl border border-border bg-background p-3 shadow-xs transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
    >
      <div className="flex items-center gap-2">
        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 rounded-lg border-none bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
        />

        {/* Send button */}
        <Button
          type="submit"
          disabled={!input.trim()}
          className="size-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ArrowUpIcon size={14} />
        </Button>
      </div>
    </form>
  )
}
