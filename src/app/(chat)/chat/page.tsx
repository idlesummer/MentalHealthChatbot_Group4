'use client'

import { 
  Chat, 
  ChatHeader, 
  ChatMessages, 
  ChatMessage, 
  ChatInput,
} from '@/components/chat'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useChatStore } from '@/lib/store/chat'
import { mockSendMessage } from './actions'

export default function ChatPage() {
  const messages   = useChatStore(s => s.messages)
  const input      = useChatStore(s => s.input)
  const setInput   = useChatStore(s => s.setInput)
  const addMessage = useChatStore(s => s.addMessage)
  const scrollRef  = useScrollToBottom(messages.length)
  
  const handleSend = async () => {
    if (!input.trim()) return
    addMessage(input, 'You')

    // Call the server action (this runs on the server)
    const { reply } = await mockSendMessage(input)
    addMessage(reply, 'Pebbles')
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
