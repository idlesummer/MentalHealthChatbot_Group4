import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Message = {
  id: string
  user: string
  text: string
  ts: number
}

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
      messages: [
        { id: '1', user: 'Alex',  text: "Hey team! How's the project going?", ts: Date.now() - 600000 },
        { id: '2', user: 'You',   text: 'Going great! Just finished the API integration', ts: Date.now() - 580000 },
        { id: '3', user: 'Sarah', text: "Nice work! I'm wrapping up the UI components", ts: Date.now() - 560000 },
      ],
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
