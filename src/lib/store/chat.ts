import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message } from '@/lib/types'

type ChatState = {
  messages: Message[]
  input: string
  setInput: (v: string) => void
  addMessage: (text: string, from?: string) => void
  clear: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [{ id: '1', user: 'Pebbles',  text: 'Hey, hows it going?', ts: Date.now() - 600000 }],
      input: '',
      setInput: input => set({ input }),
      addMessage: (text, user = 'You') => {
        const now = Date.now()
        const msg: Message = { id: crypto.randomUUID(), user, text, ts: now }
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
