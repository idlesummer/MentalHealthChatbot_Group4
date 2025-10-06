'use client'

import { useState } from 'react'
import { ChatHeader } from '@/components/chat-header'
import { Messages } from '@/components/messages'
import { ChatInput } from '@/components/chat-input'

export function Chat() {
  // === State ===
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([])

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
        <ChatInput input={input} setInput={setInput} onSend={handleSend} />
      </div>
    </div>
  )
}
