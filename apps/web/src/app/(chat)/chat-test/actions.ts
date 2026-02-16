'use server'

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, CrisisDetector, SessionSummaryGenerator, INTENT_LABELS } from '@rainev/cogni'
import type { Intent, PromptTechnique, Message, SessionStageRecord, StageSummaries, CrisisClassification } from '@rainev/cogni'

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o-mini',
  temperature: 0.2,
})

const engine = new CogniEngine(model)
const crisisDetector = new CrisisDetector(model)
const summaryGenerator = new SessionSummaryGenerator()

export async function generateResponse(
  message: string,
  intent: Intent,
  technique: PromptTechnique,
  messages: Message[],
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
    }
  }

  // Step 1+: Normal CBT pipeline
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
    crisis: { risk: 'LOW', category: 'none', reasoning: '' } as CrisisClassification,
  }
}

// -----------------------------------------------------------------------------
// Stage summarization via LLM
// -----------------------------------------------------------------------------

/** Schema for the LLM stage summaries response — dynamically built from visited intents */
function buildStageSummariesSchema(intents: Intent[]) {
  const descriptions: Record<Intent, string> = {
    I1: 'Concise clinical summary of the situation',
    I2: 'Concise clinical summary of the automatic thought',
    I3: 'Concise clinical summary of the initial mood rating',
    I4: 'Concise clinical summary of evidence supporting the thought',
    I5: 'Concise clinical summary of evidence against the thought',
    I6: 'Concise clinical summary of the alternative thought',
    I7: 'Concise clinical summary of the mood re-rating',
    I8: 'Concise clinical summary of the coping strategy',
  }

  const shape: Record<string, z.ZodString> = {}
  for (const intent of intents) {
    shape[intent] = z.string().describe(descriptions[intent])
  }
  return z.object(shape)
}

const STAGE_SUMMARIZER_PROMPT = [
  'You are a clinical note writer summarizing a CBT session for a therapist.',
  'For each stage of the session, write a concise 1-sentence clinical summary.',
  'Preserve all key details (names, numbers, specific thoughts) — be lossless but concise.',
  'Write in third person (e.g. "Client described..." not "I described...").',
  'Do NOT add interpretation. Summarize only what the client actually said.',
].join(' ')

/** Call the LLM to generate concise clinical summaries per stage */
async function summarizeStages(records: SessionStageRecord[]): Promise<StageSummaries> {
  // Collect unique intents that were visited
  const stagesByIntent = new Map<Intent, SessionStageRecord>()
  for (const r of records) {
    if (!stagesByIntent.has(r.intent)) stagesByIntent.set(r.intent, r)
  }

  const visitedIntents = [...stagesByIntent.keys()]
  if (visitedIntents.length === 0) return {}

  const transcript = [...stagesByIntent.entries()]
    .map(([intent, r]) => [
      `--- ${intent}: ${INTENT_LABELS[intent]} ---`,
      `Client: ${r.userMessage}`,
      `Therapist: ${r.assistantReply}`,
    ].join('\n'))
    .join('\n\n')

  // Build schema with only the visited intents (all required)
  const schema = buildStageSummariesSchema(visitedIntents)
  const summarizer = model.withStructuredOutput(schema)
  const result = await summarizer.invoke([
    { role: 'system', content: STAGE_SUMMARIZER_PROMPT },
    { role: 'user', content: transcript },
  ])

  return result as StageSummaries
}

// -----------------------------------------------------------------------------
// Public action
// -----------------------------------------------------------------------------

export async function generateSessionSummary(
  records: SessionStageRecord[],
  technique: PromptTechnique | 'mixed',
) {
  // Step 1: Get LLM-generated stage summaries
  const llmSummaries = await summarizeStages(records)

  // Step 2: Generate the full summary with LLM summaries baked in
  return summaryGenerator.generate(records, technique, { stageSummaries: llmSummaries })
}
