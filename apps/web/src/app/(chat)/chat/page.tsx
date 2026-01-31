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
import { usePromptStateStore } from '@/lib/blueprints/promptStore'
import { delay, rand } from '@/lib/utils'
import { generateResponse } from './actions'
import { Intent } from '@/lib/ai/intent'
import { useEffect } from 'react'

export default function ChatPage() {
  // Stores
  const { input, setInput, clearInput } = useChatInputStore()
  const { messages, addMessage } = useChatMessagesStore()
  const { promptTechnique } = usePromptStateStore()

  // UI Hooks
  const [isTyping, setIsTyping] = useState(false)
  const isLoading = useFakeLoading(1500)
  const scrollRef = useScrollToBottom([messages, isLoading, isTyping])
  const [intentCount, setIntentCount] = useState<Record<Intent, number>>({
    I1: 0,
    I2: 0,
    I3: 0,
    I4: 0,
    I5: 0,
    I6: 0,
    I7: 0,
    I8: 0,
  })

  // Local State
  const [intent, setIntent] = useState<string | null>('I1')
  
  // Send handler
  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    addMessage(input, 'You')
    clearInput()
    await delay(rand(1000, 4000))

    setIsTyping(true)
    const { reply, identifiedIntent } = await generateResponse(input, intent!, promptTechnique, messages)
    console.log('Identified Intent: ', identifiedIntent)
    setIntentCount(prev => ({
      ...prev,
      [identifiedIntent as Intent]: (prev[identifiedIntent as Intent] ?? 0)  + 1,
    }))

    
    setIsTyping(false)

    addMessage(reply, 'Pebbles')
    setIntent(identifiedIntent)
    
  }
  
  useEffect(() => {
    console.log('intentCount changed:', intentCount)
  }, [intentCount])

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
