'use client'

import { useState } from 'react'
import { ChatHeader } from '@/components/chat-header'
import { ChatMessage, ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'

const initialMessages = [
  { id: 1, user: 'Pebble', text: 'Hi there! I\'m Pebble, your mental health companion 🌱 How are you feeling today?', ts: '9:00 AM' },
  { id: 2, user: 'You', text: 'Hey Pebble. Honestly, I\'ve been feeling really stressed lately.', ts: '9:01 AM' },
  { id: 3, user: 'Pebble', text: 'I\'m really glad you reached out. Stress can be heavy — what\'s been weighing on your mind the most?', ts: '9:02 AM' },
  { id: 4, user: 'You', text: 'Mostly school and deadlines. It feels like everything\'s piling up.', ts: '9:03 AM' },
  { id: 5, user: 'Pebble', text: 'That sounds overwhelming 😔 When things stack up like that, our minds can feel cluttered. Have you had any breaks recently?', ts: '9:04 AM' },
  { id: 6, user: 'You', text: 'Not really. I just keep pushing through, even when I\'m exhausted.', ts: '9:05 AM' },
  { id: 7, user: 'Pebble', text: 'That takes a lot of strength. Sometimes resting isn\'t giving up — it\'s recharging so you can keep going. What helps you relax, even a little?', ts: '9:06 AM' },
  { id: 8, user: 'You', text: 'I usually listen to music or draw when I can.', ts: '9:07 AM' },
  { id: 9, user: 'Pebble', text: 'Those are wonderful outlets 🎨🎧 Creative expression can really help release built-up tension. What kind of music do you turn to when you\'re stressed?', ts: '9:08 AM' },
  { id: 10, user: 'You', text: 'Mostly calm instrumentals or lofi. It helps me focus.', ts: '9:09 AM' },
  { id: 11, user: 'Pebble', text: 'That\'s a great choice. Music like that can help slow your breathing and calm your thoughts. Would you like to try a short grounding exercise together?', ts: '9:10 AM' },
  { id: 12, user: 'You', text: 'Sure, I\'d like that.', ts: '9:11 AM' },
  { id: 13, user: 'Pebble', text: 'Alright 🌿 Try to notice your breathing. Inhale deeply through your nose… hold for a moment… and exhale slowly through your mouth. Let your shoulders relax as you do.', ts: '9:12 AM' },
  { id: 14, user: 'You', text: 'That actually helped a bit.', ts: '9:14 AM' },
  { id: 15, user: 'Pebble', text: 'I\'m really glad to hear that 😊 Sometimes small moments of calm can remind us that we can still find peace, even in busy times.', ts: '9:15 AM' },
  { id: 16, user: 'You', text: 'Yeah… I guess I just forget to pause sometimes.', ts: '9:16 AM' },
  { id: 17, user: 'Pebble', text: 'That\'s completely normal. You\'re doing your best — and that\'s enough. Maybe we can set a tiny reminder for short breaks during your study sessions?', ts: '9:17 AM' },
  { id: 18, user: 'You', text: 'That might actually help me a lot.', ts: '9:18 AM' },
  { id: 19, user: 'Pebble', text: 'Great! Try starting with a 5-minute pause every hour — stretch, breathe, hydrate. You\'ll be surprised how much it helps your focus.', ts: '9:19 AM' },
  { id: 20, user: 'You', text: 'Thanks, Pebble. I feel lighter after talking with you.', ts: '9:20 AM' },
]

export default function ScrollAreaChat() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const endRef = useScrollToBottom(messages.length)

  const handleSend = (text: string) => {
    if (!text.trim()) return
    const newMessage = {
      id: messages.length + 1,
      user: 'You',
      text,
      ts: new Date().toLocaleTimeString('en-US', {
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
      <ChatInput value={input} onChange={setInput} onSend={handleSend} />
    </>
  )
}

// 'use client'

// import { useEffect, useState } from 'react'
// import { useMe, useMessages, useChatStore } from '@/stores/chat' // ← adjust path

// export default function ChatPage() {
//   const me = useMe()
//   const setMe = useChatStore(s => s.setMe)
//   const send = useChatStore(s => s.send)
//   const receive = useChatStore(s => s.receive)
//   const messages = useMessages()

//   // Identify "me" (matches your seed's 'from' value)
//   useEffect(() => {
//     if (!me) setMe('You')
//   }, [me, setMe])

//   const [text, setText] = useState('')

//   const onSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!text.trim()) return
//     send(text.trim())
//     setText('')
//     // scroll-to-bottom logic if you add a ref
//   }

//   const fmt = (ts: number) =>
//     new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

//   return (
//     <div className="mx-auto max-w-md h-[100dvh] flex flex-col border rounded-lg">
//       <header className="p-3 border-b font-medium">Pebble Chat</header>

//       <main className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
//         {messages.map(m => (
//           <div
//             key={m.id}
//             className={`max-w-[80%] rounded-lg p-2 text-sm ${
//               m.from === me
//                 ? 'ml-auto bg-blue-600 text-white'
//                 : 'mr-auto bg-white border'
//             }`}
//             title={fmt(m.ts)}
//           >
//             <div className="opacity-70 text-[10px] mb-0.5">{m.from}</div>
//             <div>{m.text}</div>
//             <div className="opacity-70 text-[10px] mt-1 text-right">{fmt(m.ts)}</div>
//           </div>
//         ))}
//       </main>

//       <form onSubmit={onSubmit} className="p-3 border-t flex gap-2">
//         <input
//           value={text}
//           onChange={e => setText(e.target.value)}
//           placeholder="Type a message…"
//           className="flex-1 rounded border px-3 py-2"
//         />
//         <button
//           type="submit"
//           className="rounded bg-blue-600 text-white px-3 py-2"
//         >
//           Send
//         </button>
//         <button
//           type="button"
//           onClick={() => receive('Pebble', 'Here’s a gentle reminder to breathe. 🌿')}
//           className="rounded border px-3 py-2"
//           title="Fake an incoming message"
//         >
//           Fake
//         </button>
//       </form>
//     </div>
//   )
// }
