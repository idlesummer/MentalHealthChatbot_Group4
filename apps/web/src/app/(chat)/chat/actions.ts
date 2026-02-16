'use server'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, CrisisDetector } from '@rainev/cogni'
import type { Intent, PromptTechnique, Message, CrisisClassification } from '@rainev/cogni'

// All functions that call APIs is will be defined here

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o-mini',
  temperature: 0.2,
})

// Initialize the Cogni engine and crisis detector
const engine = new CogniEngine(model)
const crisisDetector = new CrisisDetector(model)

export async function generateResponse(
  message: string,
  intent: Intent,
  technique: PromptTechnique,
  messages: Message[],
) {
  // Step 0: Crisis detection gate — screen the message before CBT processing
  const crisis = await crisisDetector.classify(message)

  if (CrisisDetector.requiresIntervention(crisis.risk)) {
    console.log('[CrisisDetector] Intervention triggered:', crisis)
    const safeReply = CrisisDetector.getSafeResponse(crisis.category)

    return {
      reply: safeReply,
      identifiedIntent: intent, // stay on the same intent
      distortion: undefined,
      crisis,
    }
  }

  // Step 1+: Normal CBT pipeline
  const result = await engine.respond({
    message,
    intent,
    conversation: messages,
    technique,
  })

  console.log('Cogni Response:', result)
  console.log('Next Intent:', result.nextIntent)
  if (result.distortion) {
    console.log('Detected Distortion:', result.distortion)
  }

  return {
    reply: result.reply,
    identifiedIntent: result.nextIntent,
    distortion: result.distortion,
    crisis: { risk: 'LOW', category: 'none', reasoning: '' } as CrisisClassification,
  }
}
