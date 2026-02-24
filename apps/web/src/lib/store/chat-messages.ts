import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message } from '@rainev/cogni'

type ChatMessagesState = {
  messages: Message[]
  addMessage: (text: string, user: string) => void
  clearMessages: () => void
}

const initialMessage = (): Message => ({
   id: crypto.randomUUID(),
   user: 'Pebbles',
   text: 'Hi, I\'m Pebbles! I am a Mental Health CBT Chatbot! I\'m here to guide you through a structured process designed to help you reflect on your thoughts and feelings. \n\nBefore we get started, I just want to remind you that while I’m here to assist, I’m not a real therapist, and this experience is not a replacement for professional therapy. This is a single-session CBT experience, and we’ll focus on one specific situation or scenario that you’d like to explore. \n\nTo get started, it would be helpful if you could briefly share a little bit about yourself. You don’t need to go into too much detail--just let me know anything that’s currently on your mind, how your day’s been, or any thoughts or feelings you’d like to share. This will help me guide you through the session in a way that’s most relevant for you.', 
  ts: Date.now(),
})

export const useChatMessagesStore = create<ChatMessagesState>()(
  persist(
    (set, get) => ({
      messages: [initialMessage()],
      addMessage: (text, user) => {
        const id = crypto.randomUUID()
        const ts = Date.now()
        const msg = { id, user, text, ts }
        set({ messages: [...get().messages, msg] })
      },
      clearMessages: () => {
        set({ messages: [initialMessage()] })
      },
    }),
    {
      name: 'chat-messages-store',
    },
  ),
)
