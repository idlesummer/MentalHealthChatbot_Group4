import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message } from '@/lib/types'

type ChatMessagesState = {
  messages: Message[]
  addMessage: (msg: Message) => void
  clear: () => void
}

export const useChatMessagesStore = create<ChatMessagesState>()(
  persist(
    (set, get) => ({
      messages: [],
      addMessage: msg => set({ messages: [...get().messages, msg] }),
      clear: () => set({ messages: [] }),
    }),
    {
      name: 'chat-messages-store',
      version: 1,
    },
  ),
)
