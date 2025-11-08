import { create } from "zustand"

export type PromptTechnique = 
  | "default"
  | "few-shot"
  | "chain-of-thought"
  | "persona"
  | "plan-and-solve"

interface PromptState {
    promptTechnique: PromptTechnique
    setPromptTechnique: (technique: PromptTechnique) => void
}

export const usePromptStateStore = create<PromptState> ((set) => ({
    promptTechnique: "default",
    setPromptTechnique: (promptTechnique) => set({ promptTechnique }),
}))