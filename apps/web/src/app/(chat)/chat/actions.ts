'use server'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, type Intent, type PromptTechnique } from '@rainev/cogni'

// All functions that call APIs is will be defined here

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o-mini',
  temperature: 0.2,
})

// Initialize the Cogni engine
const engine = new CogniEngine(model)

export async function generateResponse(
  message: string,
  intent: Intent,
  technique: PromptTechnique,
  messages: any[],
) {
  // Call the cogni engine with the user's message
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
  }
}
