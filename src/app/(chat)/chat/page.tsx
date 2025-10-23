'use client'

import { 
  Chat, 
  ChatHeader, 
  ChatMessages, 
  ChatMessage, 
  ChatInput,
  ChatMessageSkeletonList,
  TypingMessage,
} from '@/components/chat'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useChatStore } from '@/lib/store/chat'
import { generateResponse } from './actions'
import { useState } from 'react'
import { useFakeLoading } from '@/hooks/use-fake-loading'
import MessageSpinner from '@/components/elements/message-spinner'

export default function ChatPage() {
  const messages   = useChatStore(s => s.messages)
  const input      = useChatStore(s => s.input)
  const setInput   = useChatStore(s => s.setInput)
  const addMessage = useChatStore(s => s.addMessage)
  const scrollRef  = useScrollToBottom(messages.length)
  const [intent, setIntent] = useState<string | null>(null)
  const [distortion, setDistortion] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<string | null>(null)
  const isLoading = useFakeLoading(1500)
  
  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    addMessage(text, 'You')

    // Call the server action (this runs on the server)
    const { reply } = await generateResponse(text, intent!, distortion!, prompt!)
    addMessage(reply, 'Pebbles')
  }

  return (
    <Chat>      
      <ChatHeader />
      <ChatMessages>
        {isLoading 
          ? <ChatMessageSkeletonList count={5} />
          : messages.map(m => <ChatMessage key={m.id} msg={m} />)
        }
        <TypingMessage>
          <MessageSpinner />
        </TypingMessage>
        <div ref={scrollRef} />
      </ChatMessages>
      <ChatInput value={input} onChange={setInput} onSubmit={handleSend} />
    </Chat>
  )
}
