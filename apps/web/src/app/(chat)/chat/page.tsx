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
// import { delay, rand } from '@/lib/utils'
import { generateResponse } from './actions'
import { type Intent } from '@rainev/cogni'

export default function ChatPage() {
  // Stores
  const { input, setInput, clearInput } = useChatInputStore()
  const { messages, addMessage } = useChatMessagesStore()
  const { promptTechnique } = usePromptStateStore()

  // UI Hooks
  const [isTyping, setIsTyping] = useState(false)
  const isLoading = useFakeLoading(1500)
  const scrollRef = useScrollToBottom([messages, isLoading, isTyping])

  // Local State
  const [intent, setIntent] = useState<Intent>('I1')
  const [sessionContext, setSessionContext] = useState('')

  // Send handler
  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    addMessage(text, 'You')
    clearInput()

    setIsTyping(true)
    const { reply, identifiedIntent, sessionContext: updatedContext } = await generateResponse(
      text,
      intent,
      promptTechnique,
      messages,
      sessionContext,
    )
    console.log('Identified Intent: ', identifiedIntent)
    setIsTyping(false)

    addMessage(reply, 'Pebbles')
    setIntent(identifiedIntent)
    setSessionContext(updatedContext)
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
