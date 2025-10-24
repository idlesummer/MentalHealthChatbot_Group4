import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ChatInputState = {
  input: string
  setInput: (v: string) => void
  clearInput: () => void
}

export const useChatInputStore = create<ChatInputState>()(
  persist(
    (set) => ({
      input: '',
      setInput: input => set({ input }),
      clearInput: () => set({ input: '' }),
    }),
    {
      name: 'chat-input-store',
      // partialize: (state) => ({ input: state.input }),  // only save input
    },
  ),
)
