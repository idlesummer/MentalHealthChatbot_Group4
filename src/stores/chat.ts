'use client'

import { create } from 'zustand'
import { fetchMessages } from '@/lib/db/queries'

export type Message = {
  id: string
  from: string
  text: string
  ts: number
}

type ChatState = {
  me: string
  messages: Message[]
  isLoading: boolean
  hasMore: boolean
  loadMessages: () => Promise<void>
  loadMoreMessages: () => Promise<void> // renamed
  setMe: (id: string) => void
  send: (text: string) => Message
  receive: (from: string, text: string, id?: string, ts?: number) => Message
  clear: () => void
}

const rid = () => crypto.randomUUID()

export const useChatStore = create<ChatState>((set, get) => ({
  // State
  me: 'You',
  messages: [],
  isLoading: true,
  hasMore: true,

  // Actions
  loadMessages: async () => {
    set({ isLoading: true })
    const rows = await fetchMessages({ limit: 20 })
    set({
      messages: rows,
      isLoading: false,
      hasMore: rows.length >= 20,
    })
  },

  loadMoreMessages: async () => {
    const msgs = get().messages
    const oldest = msgs[0]?.ts
    if (!oldest) return get().loadMessages()
    set({ isLoading: true })
    const older = await fetchMessages({ limit: 20, beforeTs: oldest })
    set(s => ({
      messages: [...older, ...s.messages],
      isLoading: false,
      hasMore: older.length >= 20,
    }))
  },

  setMe: id => set({ me: id }),

  send: text => {
    const me = get().me
    if (!me) throw new Error('call setMe first')
    const message = { id: rid(), from: me, text, ts: Date.now() }
    set(s => ({ messages: [...s.messages, message] }))
    return message
  },

  receive: (from, text, id = rid(), ts = Date.now()) => {
    const message = { id, from, text, ts }
    set(s => {
      if (s.messages.some(m => m.id === id)) return s
      return { messages: [...s.messages, message] }
    })
    return message
  },

  clear: () => set({ messages: [] }),
}))

// Selectors
export const useMe = () => useChatStore(s => s.me)
export const useMessages = () => useChatStore(s => s.messages)
