'use server'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, CrisisDetector, INTENT_LABELS } from '@rainev/cogni'
import type { Intent, PromptTechnique, Message, CrisisClassification } from '@rainev/cogni'

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o-mini',
  temperature: 0.2,
})

const engine = new CogniEngine(model)
const crisisDetector = new CrisisDetector(model)

// -----------------------------------------------------------------------------
// Rolling session context (LLM-powered, runs after every turn)
// -----------------------------------------------------------------------------

const SESSION_CONTEXT_SCHEMA = z.object({
  sessionContext: z.string().describe(
    'A concise rolling summary of the CBT session so far. Include only meaningful CBT content — skip greetings and small talk. Format: one line per completed stage (e.g. "Situation: Client described failing a math exam"). End with the current stage and what is being explored.',
  ),
})

const SESSION_CONTEXT_PROMPT = [
  'You are a CBT session note-taker. Your job is to maintain a concise, rolling context summary of the session.',
  'Only record meaningful CBT content — ignore greetings, pleasantries, or messages that do not advance the CBT process.',
  'If the user message is just a greeting (e.g. "Hello", "Hi", "Hey"), do NOT record it as a situation or any CBT stage.',
  'Format each completed stage on one line: "Stage Name: concise summary".',
  'End with the current stage and what is being explored.',
  'Keep the entire summary under 200 words.',
  'If nothing meaningful has been established yet, return "Session started. No CBT content established yet."',
].join(' ')

const contextSummarizer = model.withStructuredOutput(SESSION_CONTEXT_SCHEMA)

async function generateSessionContext(
  previousContext: string,
  currentIntent: Intent,
  nextIntent: Intent,
  userMessage: string,
  assistantReply: string,
): Promise<string> {
  const prompt = [
    previousContext ? `Previous session context:\n${previousContext}\n` : '',
    `Current stage: ${currentIntent} (${INTENT_LABELS[currentIntent]})`,
    `Next stage: ${nextIntent} (${INTENT_LABELS[nextIntent]})`,
    `User message: "${userMessage}"`,
    `Assistant reply: "${assistantReply}"`,
    '',
    'Update the session context to include this turn (only if it contains meaningful CBT content).',
  ].join('\n')

  try {
    const result = await contextSummarizer.invoke([
      { role: 'system', content: SESSION_CONTEXT_PROMPT },
      { role: 'user', content: prompt },
    ])
    return result.sessionContext
  } catch (err) {
    console.error('[SessionContext] Failed to generate context:', err)
    return previousContext
  }
}

// -----------------------------------------------------------------------------
// Main response action
// -----------------------------------------------------------------------------

export async function generateResponse(
  message: string,
  intent: Intent,
  technique: PromptTechnique,
  messages: Message[],
  sessionContext?: string,
) {
  // Step 0: Crisis detection gate
  const crisis = await crisisDetector.classify(message)

  if (CrisisDetector.requiresIntervention(crisis.risk)) {
    console.log('[CrisisDetector] Intervention triggered:', crisis)
    const safeReply = CrisisDetector.getSafeResponse(crisis.category)

    return {
      reply: safeReply,
      identifiedIntent: intent,
      distortion: undefined,
      crisis,
      sessionContext: sessionContext ?? '',
    }
  }

  // Step 1+: Normal CBT pipeline (pass session context for continuity)
  const result = await engine.respond({
    message,
    intent,
    conversation: messages,
    technique,
    sessionContext,
  })

  console.log('Cogni Response:', result)
  console.log('Next Intent:', result.nextIntent)
  if (result.distortion) {
    console.log('Detected Distortion:', result.distortion)
  }

  // Step 2: Generate updated session context for the next turn
  const updatedContext = await generateSessionContext(
    sessionContext ?? '',
    intent,
    result.nextIntent,
    message,
    result.reply,
  )

  return {
    reply: result.reply,
    identifiedIntent: result.nextIntent,
    distortion: result.distortion,
    crisis: { risk: 'LOW', category: 'none', reasoning: '' } as CrisisClassification,
    sessionContext: updatedContext,
  }
}
