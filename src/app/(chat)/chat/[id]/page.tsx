'use client'

import { useEffect, useState } from 'react'
import { ChatHeader } from '@/components/chat-header'
import { ChatMessage, ChatMessages, ChatMessageSkeleton } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useChatStore, useMessages } from '@/stores/chat'

export default function ScrollAreaChat() {
  // actions + state
  const send = useChatStore(s => s.send)
  // const receive = useChatStore(s => s.receive)
  const loadMessages = useChatStore(s => s.loadMessages)
  const isLoading = useChatStore(s => s.isLoading)
  const storeMessages = useMessages()

  const [input, setInput] = useState('')
  const endRef = useScrollToBottom(storeMessages.length)

  // Load initial messages once
  useEffect(() => {
    loadMessages()
  }, [])

  const handleSend = (text: string) => {
    const t = text.trim()
    if (!t) return
    send(t)
    setInput('')
  }

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <>
      <ChatHeader />

      <ChatMessages>
        {isLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <ChatMessageSkeleton key={i} isUser={!!(i % 2)} />
            ))}
          </>
        ) : (
          storeMessages.map(m => (
            <ChatMessage
              key={m.id}
              message={{
                id: m.id,
                user: m.from,
                text: m.text,
                ts: fmtTime(m.ts),
              }}
            />
          ))
        )}
        <div ref={endRef} />
      </ChatMessages>

      <ChatInput 
        value={input} 
        onChange={setInput} 
        onSend={handleSend} 
        disabled={isLoading}
      />
    </>
  )
}
