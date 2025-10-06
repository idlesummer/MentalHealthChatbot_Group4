'use client'

import { useState } from 'react'
import { ChatHeader } from '@/components/chat-header'
import { Messages } from '@/components/messages'

export function Chat() {
  // === State ===
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([{ role: 'assistant', text: 'Hi! How can I help you today?' }])

  const [input, setInput] = useState('')

  // === Handlers ===
  const handleSend = () => {
    if (!input.trim()) return

    const newUserMessage = { role: 'user' as const, text: input }
    setMessages(prev => [...prev, newUserMessage])
    setInput('')

    // Mock assistant reply (replace with API call later)
    setTimeout(() => {
      const reply = { role: 'assistant' as const, text: 'This is a demo response.' }
      setMessages(prev => [...prev, reply])
    }, 600)
  }

  // === Render ===
  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      {/* Header */}
      <ChatHeader
        chatId="local"
        isReadonly={false}
        selectedVisibilityType="public"
      />

      {/* Messages */}
      <Messages messages={messages} />

      {/* Input */}
      <div className="sticky bottom-0 mx-auto flex w-full max-w-4xl gap-2 border-t bg-background px-2 pb-3 md:px-4 md:pb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Send
        </button>
      </div>
    </div>
  )
}
