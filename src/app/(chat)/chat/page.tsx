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
  const scrollRef  = useScrollToBottom(messages.length)
  const [intent, setIntent] = useState<string | null>("I1");
  const [distortion, setDistortion] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);

  
  const handleSend = async () => {
    if (!input.trim()) return
    addMessage(input, 'You')
    console.log("MESSAGES: ", messages);
    // Call the server action (this runs on the server)
    const { reply, identifiedIntent } = await generateResponse(input, intent!, distortion!, prompt!, messages);
    addMessage(reply, 'Pebbles')
    setIntent(identifiedIntent);
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
