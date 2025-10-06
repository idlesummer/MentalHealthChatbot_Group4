'use client'

import { useState, useRef } from 'react'
import { ArrowUpIcon, PaperclipIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MultimodalInput({
  input,
  setInput,
  onSend,
}: {
  input: string
  setInput: (val: string) => void
  onSend: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSend()
      }}
      className="w-full rounded-xl border border-border bg-background p-3 shadow-xs transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
    >
      <div className="flex items-center gap-2">
        {/* File button */}
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-1 rounded-lg hover:bg-accent"
          onClick={() => fileInputRef.current?.click()}
        >
          <PaperclipIcon size={14} />
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={e => {
            if (e.target.files?.length) {
              console.log('File selected:', e.target.files[0])
            }
          }}
        />

        {/* Textarea */}
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 resize-none border-0 bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
          rows={1}
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
