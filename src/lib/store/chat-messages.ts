import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message } from '@/lib/types'

type ChatMessagesState = {
  messages: Message[]
  addMessage: (text: string, user: string) => void
  clearMessages: () => void
}

export const useChatMessagesStore = create<ChatMessagesState>()(
  persist(
    (set, get) => ({
      messages: [{ 
        id: '1', 
        user: 'Pebbles', 
        text: 'Hey, hows it going?', 
        ts: Date.now(),
      }],
      addMessage: (text, user) => {
        const id = crypto.randomUUID()
        const ts = Date.now()
        const msg = { id, user, text, ts }
        set({ messages: [...get().messages, msg] })
      },
      clearMessages: () => {
        set({ messages: [] })
      },
    }),
    {
      name: 'chat-messages-store',
    },
  ),
)
