'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatHeader } from '@/components/chat-header'
import { ChatMessage, ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'

const initialMessages = [
  { id: 1, user: 'Pebble', message: 'Hi there! I\'m Pebble, your mental health companion 🌱 How are you feeling today?', time: '9:00 AM' },
  { id: 2, user: 'You', message: 'Hey Pebble. Honestly, I\'ve been feeling really stressed lately.', time: '9:01 AM' },
  { id: 3, user: 'Pebble', message: 'I\'m really glad you reached out. Stress can be heavy — what\'s been weighing on your mind the most?', time: '9:02 AM' },
  { id: 4, user: 'You', message: 'Mostly school and deadlines. It feels like everything\'s piling up.', time: '9:03 AM' },
  { id: 5, user: 'Pebble', message: 'That sounds overwhelming 😔 When things stack up like that, our minds can feel cluttered. Have you had any breaks recently?', time: '9:04 AM' },
  { id: 6, user: 'You', message: 'Not really. I just keep pushing through, even when I\'m exhausted.', time: '9:05 AM' },
  { id: 7, user: 'Pebble', message: 'That takes a lot of strength. Sometimes resting isn\'t giving up — it\'s recharging so you can keep going. What helps you relax, even a little?', time: '9:06 AM' },
  { id: 8, user: 'You', message: 'I usually listen to music or draw when I can.', time: '9:07 AM' },
  { id: 9, user: 'Pebble', message: 'Those are wonderful outlets 🎨🎧 Creative expression can really help release built-up tension. What kind of music do you turn to when you\'re stressed?', time: '9:08 AM' },
  { id: 10, user: 'You', message: 'Mostly calm instrumentals or lofi. It helps me focus.', time: '9:09 AM' },
  { id: 11, user: 'Pebble', message: 'That\'s a great choice. Music like that can help slow your breathing and calm your thoughts. Would you like to try a short grounding exercise together?', time: '9:10 AM' },
  { id: 12, user: 'You', message: 'Sure, I\'d like that.', time: '9:11 AM' },
  { id: 13, user: 'Pebble', message: 'Alright 🌿 Try to notice your breathing. Inhale deeply through your nose… hold for a moment… and exhale slowly through your mouth. Let your shoulders relax as you do.', time: '9:12 AM' },
  { id: 14, user: 'You', message: 'That actually helped a bit.', time: '9:14 AM' },
  { id: 15, user: 'Pebble', message: 'I\'m really glad to hear that 😊 Sometimes small moments of calm can remind us that we can still find peace, even in busy times.', time: '9:15 AM' },
  { id: 16, user: 'You', message: 'Yeah… I guess I just forget to pause sometimes.', time: '9:16 AM' },
  { id: 17, user: 'Pebble', message: 'That\'s completely normal. You\'re doing your best — and that\'s enough. Maybe we can set a tiny reminder for short breaks during your study sessions?', time: '9:17 AM' },
  { id: 18, user: 'You', message: 'That might actually help me a lot.', time: '9:18 AM' },
  { id: 19, user: 'Pebble', message: 'Great! Try starting with a 5-minute pause every hour — stretch, breathe, hydrate. You\'ll be surprised how much it helps your focus.', time: '9:19 AM' },
  { id: 20, user: 'You', message: 'Thanks, Pebble. I feel lighter after talking with you.', time: '9:20 AM' },
]

export default function ScrollAreaChat() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (message: string) => {
    if (!message.trim()) return
    const newMessage = {
      id: messages.length + 1,
      user: 'You',
      message,
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    setMessages(prev => [...prev, newMessage])
    setInput('')
  }

  return (
    <>
      <ChatHeader />
      <ChatMessages>
        {messages.map(m => <ChatMessage key={m.id} message={m} />)}
        <div ref={endRef} />
      </ChatMessages>
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
      />
    </>
  )
}
