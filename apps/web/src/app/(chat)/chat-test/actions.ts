'use server'

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, SessionSummaryGenerator, INTENT_LABELS } from '@rainev/cogni'
import type { Intent, PromptTechnique, Message, SessionStageRecord, StageSummaries } from '@rainev/cogni'

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

// -----------------------------------------------------------------------------
// Stage summarization via LLM
// -----------------------------------------------------------------------------

/** Schema for the LLM stage summaries response */
const stageSummariesSchema = z.object({
  I1: z.string().optional().describe('Concise clinical summary of the situation'),
  I2: z.string().optional().describe('Concise clinical summary of the automatic thought'),
  I3: z.string().optional().describe('Concise clinical summary of the initial mood rating'),
  I4: z.string().optional().describe('Concise clinical summary of evidence supporting the thought'),
  I5: z.string().optional().describe('Concise clinical summary of evidence against the thought'),
  I6: z.string().optional().describe('Concise clinical summary of the alternative thought'),
  I7: z.string().optional().describe('Concise clinical summary of the mood re-rating'),
  I8: z.string().optional().describe('Concise clinical summary of the coping strategy'),
})

const STAGE_SUMMARIZER_PROMPT = [
  'You are a clinical note writer summarizing a CBT session for a therapist.',
  'For each stage of the session, write a concise 1-sentence clinical summary.',
  'Preserve all key details (names, numbers, specific thoughts) — be lossless but concise.',
  'Write in third person (e.g. "Client described..." not "I described...").',
  'Do NOT add interpretation. Summarize only what the client actually said.',
  'Only include keys for stages that have data.',
].join(' ')

/** Call the LLM to generate concise clinical summaries per stage */
async function summarizeStages(records: SessionStageRecord[]): Promise<StageSummaries> {
  // Build a transcript of what happened at each stage
  const stagesByIntent = new Map<string, SessionStageRecord>()
  for (const r of records) {
    if (!stagesByIntent.has(r.intent)) stagesByIntent.set(r.intent, r)
  }

  const transcript = [...stagesByIntent.entries()]
    .map(([intent, r]) => [
      `--- ${intent}: ${INTENT_LABELS[intent as Intent]} ---`,
      `Client: ${r.userMessage}`,
      `Therapist: ${r.assistantReply}`,
    ].join('\n'))
    .join('\n\n')

  const summarizer = model.withStructuredOutput(stageSummariesSchema)
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
