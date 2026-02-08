import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Intent, SessionStageRecord, CognitiveDistortionClassification, PromptTechnique } from '@rainev/cogni'

type SessionDataState = {
  records: SessionStageRecord[]
  technique: PromptTechnique
  currentIntent: Intent
  setTechnique: (t: PromptTechnique) => void
  setCurrentIntent: (intent: Intent) => void
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
  persist(
    (set, get) => ({
      records: [],
      technique: 'default',
      currentIntent: 'I1',
      setTechnique: (technique) => set({ technique }),
      setCurrentIntent: (intent) => set({ currentIntent: intent }),
      recordTurn: ({ intent, userMessage, assistantReply, nextIntent, distortion }) => {
        const record: SessionStageRecord = {
          intent,
          userMessage,
          assistantReply,
          distortion,
          nextIntent,
          timestamp: Date.now(),
        }
        set({ records: [...get().records, record], currentIntent: nextIntent })
      },
      clearSession: () => set({ records: [], currentIntent: 'I1' }),
    }),
    {
      name: 'session-data-store',
    },
  ),
)
