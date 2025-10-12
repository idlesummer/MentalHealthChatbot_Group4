'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function ChatPage() {
const messages = [
  { sender: 'bot', message: 'Hello there! I\'m Aidora, your mental health companion. 🌱\n\nBefore we begin, I just want to remind you that this chat is a safe, judgment-free space. You can share whatever you feel comfortable talking about — I\'m here to listen and support you. How are you feeling today?' },
  { sender: 'user', message: 'Honestly, I\'ve been feeling overwhelmed lately. There\'s just a lot happening — school, family, and everything in between. Sometimes it feels like I\'m trying to balance too many things at once, and I don\'t even know where to start fixing it.' },
  { sender: 'bot', message: 'That sounds really heavy. 😔 It takes a lot of courage to admit that you\'re struggling — and I want you to know that it\'s completely okay to feel that way.\n\nWhen responsibilities pile up, our minds can start to feel cluttered. One helpful first step could be identifying which parts are within your control, and which ones might not be.\n\nWould you like me to guide you through a short grounding or reflection exercise to help clear your thoughts?' },
  { sender: 'user', message: 'Yeah, that sounds nice. I\'ve been trying to do breathing exercises before, but I always get distracted halfway through. Maybe something simpler could work.' },
  { sender: 'bot', message: 'Absolutely! Let\'s start small. 😊\n\nTry this: take a slow, deep breath in through your nose — count to 4. Then slowly exhale through your mouth — count to 4 again. As you breathe, imagine each exhale releasing some of that tension you\'ve been carrying. We\'ll do this together for a few moments.\n\nYou can repeat this as many times as you need throughout the day.' },
  { sender: 'user', message: 'It actually helps a bit. My shoulders feel less tense now. I think I underestimate how much stress builds up physically.' },
  { sender: 'bot', message: 'Exactly — we often forget how the body and mind are connected. 🧘‍♀️ When your body relaxes, your thoughts start to flow more clearly. Would you like to explore what\'s been bothering you the most lately? Maybe we can sort through it together.' },
  { sender: 'user', message: 'Sure. I guess it\'s mostly about feeling behind everyone else. Some of my classmates already have plans, internships, or achievements. I keep comparing myself and wondering if I\'m doing enough.' },
  { sender: 'bot', message: 'Comparison can be so draining. It\'s natural to look at others, but remember — your path is uniquely yours. 🌿 You can only walk one step at a time, and those small steps still count. Let\'s try reframing that thought. Instead of “I\'m behind,” maybe try “I\'m growing at my own pace.” How does that feel to you?' },
  { sender: 'user', message: 'It feels... lighter, I guess. Like I\'m giving myself permission to slow down a bit. But it\'s still hard not to feel pressure when everyone seems to have it all figured out.' },
  { sender: 'bot', message: 'That makes complete sense. It\'s hard when the world moves so fast — especially online, where everyone shares their highlights. But remember, progress isn\'t always visible. You\'re doing meaningful things right now by taking care of yourself and reflecting on how you feel.' },
  { sender: 'user', message: 'You\'re right. I guess I need to stop scrolling and start focusing on what I can control instead. Maybe I\'ll start journaling again.' },
  { sender: 'bot', message: 'That\'s a wonderful idea! ✍️ Journaling can help release thoughts that otherwise stay trapped in your head. If you\'d like, I can share a few daily prompts to help you start.' },
  { sender: 'user', message: 'Yes, please! I\'d love that.' },
  { sender: 'bot', message: 'Here are three simple ones to begin with:\n\n1️⃣ What\'s one thing I\'m grateful for today?\n2️⃣ What emotion did I feel the most today, and why?\n3️⃣ What\'s one small thing I can do tomorrow to take care of myself?\n\nThese may seem simple, but answering them regularly can bring so much clarity over time.' },
  { sender: 'user', message: 'I\'ll try doing that tonight. Thank you, Aidora. This feels like a nice reset — like I\'m breathing properly again for the first time in days.' },
  { sender: 'bot', message: 'I\'m really glad to hear that. 🌸 You\'ve done a lot of emotional work today — take the rest of the evening to rest and be gentle with yourself. You deserve peace.' },
  { sender: 'user', message: 'I will. Thanks again for listening.' },
  { sender: 'bot', message: 'Always here for you. 💬 Come back anytime you need to talk or take a moment to breathe.' },
]


  return (
    <main className="flex flex-col flex-1 p-4">
      <div className="flex flex-col gap-4">
        {messages.map((msg, i) => {
          const isUser = msg.sender === 'user'
          return (
            <div
              key={i}
              className={cn(
                'flex items-end gap-3 whitespace-pre-wrap',
                isUser ? 'justify-end' : 'justify-start'
              )}
            >
              {!isUser && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/avatars/bot.svg" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-lg px-4 py-2 text-sm leading-relaxed shadow-sm',
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted text-foreground rounded-bl-none'
                )}
              >
                {msg.message}
              </div>
              {isUser && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/avatars/user.svg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
