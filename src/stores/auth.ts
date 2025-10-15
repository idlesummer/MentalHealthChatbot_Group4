'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  userId: string | null
  setUser: (id: string | null) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      setUser: (id) => set({ userId: id }),
      signOut: () => set({ userId: null }),
    }),
    { name: 'auth-store' },
  ),
)
