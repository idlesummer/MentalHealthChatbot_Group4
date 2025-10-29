'use client'

import { useState } from 'react'
import { 
  Chat, 
  ChatHeader, 
  ChatMessages, 
  ChatMessage, 
  ChatInput,
  ChatMessageSkeletonList,
} from '@/components/chat'
import { useFakeLoading } from '@/hooks/use-fake-loading'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useChatInputStore } from '@/lib/store/chat-input'
import { useChatMessagesStore } from '@/lib/store/chat-messages'
import { delay, rand } from '@/lib/utils'
import { generateResponse } from './actions'

export default function ChatPage() {
  // Stores
  const { input, setInput, clearInput } = useChatInputStore()
  const { messages, addMessage } = useChatMessagesStore()

  // UI Hooks
  const [isTyping, setIsTyping] = useState(false)
  const isLoading = useFakeLoading(1500)
  const scrollRef = useScrollToBottom([messages, isLoading, isTyping])

  // Local State
  const [intent, setIntent] = useState<string | null>('I1')
  const [prompt] = useState<string | null>(null)
  
  // Send handler
  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    addMessage(input, 'You')
    clearInput()
    await delay(rand(1000, 4000))

    setIsTyping(true)
    const { reply, identifiedIntent } = await generateResponse(input, intent!, prompt!, messages)
    setIsTyping(false)

    addMessage(reply, 'Pebbles')
    setIntent(await identifiedIntent)
  }

  return (
    <Chat>      
      <ChatHeader />
      <ChatMessages>
        {isLoading 
          ? <ChatMessageSkeletonList count={5} />
          : messages.map(m => <ChatMessage key={m.id} msg={m} />)}
        {isTyping && <ChatMessage />}
        <div ref={scrollRef} />
      </ChatMessages>
      <ChatInput value={input} onChange={setInput} onSubmit={handleSend} />
    </Chat>
  )
}
