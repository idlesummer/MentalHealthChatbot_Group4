'use client'

import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { Chat, ChatHeader, ChatMessages, ChatMessage, ChatInput } from '@/components/chat'
import { useChatStore } from '@/lib/store/chat'

export default function ScrollAreaChat() {
  const messages = useChatStore(s => s.messages)
  const input = useChatStore(s => s.input)
  const setInput = useChatStore(s => s.setInput)
  const addMessage = useChatStore(s => s.addMessage)
  const scrollRef = useScrollToBottom(messages.length)

  const handleSend = () => {
    if (!input.trim()) return
    addMessage(input, 'You')
  }

  return (
    <Chat>      
      <ChatHeader />
      <ChatMessages>
        {messages.map(m => <ChatMessage key={m.id} msg={m} />)}
        <div ref={scrollRef} />
      </ChatMessages>
      <ChatInput value={input} onChange={setInput} onSubmit={handleSend} />
    </Chat>
  )
}
