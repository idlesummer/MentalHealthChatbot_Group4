import { create } from 'zustand'
import { type PromptTechnique } from '@rainev/cogni'

interface PromptState {
    promptTechnique: PromptTechnique
    setPromptTechnique: (technique: PromptTechnique) => void
}

export const usePromptStateStore = create<PromptState> ((set) => ({
    promptTechnique: 'default',
    setPromptTechnique: (promptTechnique) => set({ promptTechnique }),
}))
