import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Message = {
  id: string
  user: string
  message: string
  time: string
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
        { id: '1', user: 'Alex',  message: 'Hey team! How\'s the project going?', time: '10:00 AM' },
        { id: '2', user: 'You',   message: 'Going great! Just finished the API integration', time: '10:02 AM' },
        { id: '3', user: 'Sarah', message: 'Nice work! I\'m wrapping up the UI components', time: '10:03 AM' },
      ],
      input: '',
      setInput: input => set({ input }),
      addMessage: (text, user = 'You') => {
        const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        const msg: Message = { id: crypto.randomUUID(), user, message: text, time: now }
        set({ messages: [...get().messages, msg], input: '' })
      },
      clear: () => {
        set({ messages: [], input: '' })
        localStorage.removeItem('chat-store')
      },
    }),
    { name: 'chat-store' },
  ),
)
