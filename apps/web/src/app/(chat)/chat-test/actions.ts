'use server'

import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, SessionSummaryGenerator } from '@rainev/cogni'
import type { Intent, PromptTechnique, Message, SessionStageRecord } from '@rainev/cogni'

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o-mini',
  temperature: 0.2,
})

const engine = new CogniEngine(model)
const summaryGenerator = new SessionSummaryGenerator()

export async function generateResponse(
  message: string,
  intent: Intent,
  technique: PromptTechnique,
  messages: Message[],
) {
  const result = await engine.respond({
    message,
    intent,
    conversation: messages,
    technique,
  })

  return {
    reply: result.reply,
    identifiedIntent: result.nextIntent,
    distortion: result.distortion,
  }
}

export async function generateSessionSummary(
  records: SessionStageRecord[],
  technique: PromptTechnique | 'mixed',
) {
  return summaryGenerator.generate(records, technique)
}
