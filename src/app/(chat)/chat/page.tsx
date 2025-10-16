'use client'

import { useState } from 'react'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { Chat, ChatHeader, ChatMessages, ChatMessage, ChatInput } from '@/components/chat'

const initialMessages = [
  { id: 1, user: 'Alex', message: 'Hey team! How\'s the project going?', time: '10:00 AM' },
  { id: 2, user: 'You', message: 'Going great! Just finished the API integration', time: '10:02 AM' },
  { id: 3, user: 'Sarah', message: 'Nice work! I\'m wrapping up the UI components', time: '10:03 AM' },
  { id: 4, user: 'You', message: 'Perfect, should we sync up later today?', time: '10:05 AM' },
  { id: 5, user: 'Alex', message: 'Sounds good. How about 2 PM?', time: '10:06 AM' },
  { id: 6, user: 'Sarah', message: 'Works for me! 👍', time: '10:07 AM' },
  { id: 7, user: 'You', message: 'Great, see you both then', time: '10:08 AM' },
  { id: 8, user: 'Alex', message: 'Just pushed my changes to the staging branch', time: '11:30 AM' },
  { id: 9, user: 'Sarah', message: 'Reviewing now...', time: '11:32 AM' },
  { id: 10, user: 'You', message: 'I\'ll test it after lunch', time: '11:35 AM' },
]

export default function ScrollAreaChat() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const scrollRef = useScrollToBottom(messages.length)

  const sendMessage = () => {
    if (!input.trim()) return
    const newMessage = {
      id: messages.length + 1,
      user: 'You',
      message: input,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    }
    setMessages([...messages, newMessage])
    setInput('')
  }

  const handleSend = () => {
    sendMessage()
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
