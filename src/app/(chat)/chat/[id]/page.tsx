'use client'

import { useEffect, useState } from 'react'
import { ChatHeader } from '@/components/chat-header'
import { ChatMessage, ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useChatStore, useMessages } from '@/stores/chat'

export default function ScrollAreaChat() {
  // actions + state
  const send = useChatStore(s => s.send)
  // const receive = useChatStore(s => s.receive)
  const loadInitial = useChatStore(s => s.loadInitial)
  const isLoading = useChatStore(s => s.isLoading)
  const storeMessages = useMessages()

  const [input, setInput] = useState('')
  const endRef = useScrollToBottom(storeMessages.length)

  // Load initial messages once
  useEffect(() => {
    loadInitial()
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
          <p className="p-5 text-center">Loading messages...</p>
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

      <ChatInput value={input} onChange={setInput} onSend={handleSend} />
    </>
  )
}
