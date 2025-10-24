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
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useChatStore } from '@/lib/store/chat'
import { useChatInputStore } from '@/lib/store/chat-input'
import { generateResponse } from './actions'
import { useFakeLoading } from '@/hooks/use-fake-loading'
import { delay, rand } from '@/lib/utils'

export default function ChatPage() {
  const input = useChatInputStore(s => s.input)
  const setInput = useChatInputStore(s => s.setInput)
  const clearInput = useChatInputStore(s => s.clear)

  const messages = useChatStore(s => s.messages)
  const addMessage = useChatStore(s => s.addMessage)
  const isLoading = useFakeLoading(1500)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef  = useScrollToBottom([messages, isLoading, isTyping])
  
  const [intent, setIntent] = useState<string | null>(null)
  const [distortion, setDistortion] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<string | null>(null)
  
  const handleSend = async () => {
    clearInput()
    const text = input.trim()
    if (!text) return
    addMessage(text, 'You')

    await delay(rand(1000, 4000))
    setIsTyping(true)
    const { reply } = await generateResponse(text, intent!, distortion!, prompt!)
    setIsTyping(false)
    addMessage(reply, 'Pebbles')
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
