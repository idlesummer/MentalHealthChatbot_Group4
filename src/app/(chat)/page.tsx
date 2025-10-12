'use client'

import { useEffect, useRef, useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Send } from 'lucide-react'
import React from 'react'

const initialMessages = [
  { user: 'bot', time: '8:00 PM', message: 'Hello there! I\'m Aidora, your mental health companion. 🌱\n\nBefore we begin, I just want to remind you that this chat is a safe, judgment-free space. You can share whatever you feel comfortable talking about — I\'m here to listen and support you. How are you feeling today?' },
  { user: 'user', time: '8:02 PM', message: 'Honestly, I\'ve been feeling overwhelmed lately. There\'s just a lot happening — school, family, and everything in between. Sometimes it feels like I\'m trying to balance too many things at once, and I don\'t even know where to start fixing it.' },
  { user: 'bot', time: '8:04 PM', message: 'That sounds really heavy. 😔 It takes a lot of courage to admit that you\'re struggling — and I want you to know that it\'s completely okay to feel that way.\n\nWhen responsibilities pile up, our minds can start to feel cluttered. One helpful first step could be identifying which parts are within your control, and which ones might not be.\n\nWould you like me to guide you through a short grounding or reflection exercise to help clear your thoughts?' },
  { user: 'user', time: '8:06 PM', message: 'Yeah, that sounds nice. I\'ve been trying to do breathing exercises before, but I always get distracted halfway through. Maybe something simpler could work.' },
  { user: 'bot', time: '8:07 PM', message: 'Absolutely! Let\'s start small. 😊\n\nTry this: take a slow, deep breath in through your nose — count to 4. Then slowly exhale through your mouth — count to 4 again. As you breathe, imagine each exhale releasing some of that tension you\'ve been carrying. We\'ll do this together for a few moments.\n\nYou can repeat this as many times as you need throughout the day.' },
  { user: 'user', time: '8:10 PM', message: 'It actually helps a bit. My shoulders feel less tense now. I think I underestimate how much stress builds up physically.' },
  { user: 'bot', time: '8:11 PM', message: 'Exactly — we often forget how the body and mind are connected. 🧘‍♀️ When your body relaxes, your thoughts start to flow more clearly. Would you like to explore what\'s been bothering you the most lately? Maybe we can sort through it together.' },
  { user: 'user', time: '8:13 PM', message: 'Sure. I guess it\'s mostly about feeling behind everyone else. Some of my classmates already have plans, internships, or achievements. I keep comparing myself and wondering if I\'m doing enough.' },
  { user: 'bot', time: '8:15 PM', message: 'Comparison can be so draining. It\'s natural to look at others, but remember — your path is uniquely yours. 🌿 You can only walk one step at a time, and those small steps still count. Let\'s try reframing that thought. Instead of “I\'m behind,” maybe try “I\'m growing at my own pace.” How does that feel to you?' },
  { user: 'user', time: '8:17 PM', message: 'It feels... lighter, I guess. Like I\'m giving myself permission to slow down a bit. But it\'s still hard not to feel pressure when everyone seems to have it all figured out.' },
  { user: 'bot', time: '8:18 PM', message: 'That makes complete sense. It\'s hard when the world moves so fast — especially online, where everyone shares their highlights. But remember, progress isn\'t always visible. You\'re doing meaningful things right now by taking care of yourself and reflecting on how you feel.' },
  { user: 'user', time: '8:20 PM', message: 'You\'re right. I guess I need to stop scrolling and start focusing on what I can control instead. Maybe I\'ll start journaling again.' },
  { user: 'bot', time: '8:21 PM', message: 'That\'s a wonderful idea! ✍️ Journaling can help release thoughts that otherwise stay trapped in your head. If you\'d like, I can share a few daily prompts to help you start.' },
  { user: 'user', time: '8:22 PM', message: 'Yes, please! I\'d love that.' },
  { user: 'bot', time: '8:23 PM', message: 'Here are three simple ones to begin with:\n\n1️⃣ What\'s one thing I\'m grateful for today?\n2️⃣ What emotion did I feel the most today, and why?\n3️⃣ What\'s one small thing I can do tomorrow to take care of myself?\n\nThese may seem simple, but answering them regularly can bring so much clarity over time.' },
  { user: 'user', time: '8:26 PM', message: 'I\'ll try doing that tonight. Thank you, Aidora. This feels like a nice reset — like I\'m breathing properly again for the first time in days.' },
  { user: 'bot', time: '8:28 PM', message: 'I\'m really glad to hear that. 🌸 You\'ve done a lot of emotional work today — take the rest of the evening to rest and be gentle with yourself. You deserve peace.' },
  { user: 'user', time: '8:30 PM', message: 'I will. Thanks again for listening.' },
  { user: 'bot', time: '8:31 PM', message: 'Always here for you. 💬 Come back anytime you need to talk or take a moment to breathe.' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])



  const sendMessage = () => {
    if (input.trim()) {
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
  }


  return (
    <div className="w-full">
      <ScrollArea className="h-full p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, id) => (
            <div
              key={id}
              className={`flex gap-3 ${msg.user === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {msg.user[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col gap-1 ${msg.user === 'user' ? 'items-end' : ''}`}>
                <div className={`rounded-lg px-3 py-2 max-w-[250px] ${
                  msg.user === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-3">
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
