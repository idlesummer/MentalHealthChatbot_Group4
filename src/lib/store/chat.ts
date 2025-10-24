import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message } from '@/lib/types'

type ChatState = {
  input: string
  setInput: (v: string) => void
  messages: Message[]
  addMessage: (text: string, user: string) => void
  clear: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      input: '',
      setInput: input => set({ input }),      
      messages: [{ 
        id: '1', 
        user: 'Pebbles', 
        text: 'Hey, hows it going?', 
        ts: Date.now(),
      }],
      addMessage: async (text, user = 'You') => {
        const id = crypto.randomUUID()
        const ts = Date.now()
        const msg = { id, user, text, ts }
        set({ messages: [...get().messages, msg], input: '' })
      },
      clear: () => {
        set({ messages: [], input: '' })
        useChatStore.persist.clearStorage()
      },
    }),
    { name: 'chat-store' },
  ),
)
