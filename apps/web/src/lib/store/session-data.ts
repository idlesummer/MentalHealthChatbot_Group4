import { create } from 'zustand'
import type { Intent, SessionStageRecord, CognitiveDistortionClassification, PromptTechnique } from '@rainev/cogni'

type SessionDataState = {
  records: SessionStageRecord[]
  technique: PromptTechnique
  setTechnique: (t: PromptTechnique) => void
  recordTurn: (input: {
    intent: Intent
    userMessage: string
    assistantReply: string
    nextIntent: Intent
    distortion: CognitiveDistortionClassification | undefined
  }) => void
  clearSession: () => void
}

export const useSessionDataStore = create<SessionDataState>()(
  (set, get) => ({
    records: [],
    technique: 'default',
    setTechnique: (technique) => set({ technique }),
    recordTurn: ({ intent, userMessage, assistantReply, nextIntent, distortion }) => {
      const record: SessionStageRecord = {
        intent,
        userMessage,
        assistantReply,
        distortion,
        nextIntent,
        timestamp: Date.now(),
      }
      set({ records: [...get().records, record] })
    },
    clearSession: () => set({ records: [] }),
  }),
)
