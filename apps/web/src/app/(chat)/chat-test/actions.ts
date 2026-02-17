'use server'

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, CrisisDetector, SessionSummaryGenerator, INTENT_LABELS } from '@rainev/cogni'
import type { Intent, PromptTechnique, Message, SessionStageRecord, StageSummaries, MoodRating, CrisisClassification } from '@rainev/cogni'

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

/** Generate an updated session context after a turn */
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
// Mood extraction via LLM
// -----------------------------------------------------------------------------

const MOOD_RATING_SCHEMA = z.object({
  score: z.number().describe('The numeric mood score the client gave'),
  scale: z.number().describe('The scale the rating was on (e.g. 10 if "out of 10", 100 if "out of 100")'),
})

const MOOD_EXTRACTOR_PROMPT = [
  'You are analyzing a CBT session transcript to extract a mood rating.',
  'The therapist asked the client to rate their mood on a numeric scale.',
  'Extract the exact numeric score the client provided and the scale it was on.',
  'For example: if the client said "9" and the therapist asked on a 1-10 scale, return score=9, scale=10.',
  'If the therapist asked on a 1-100 scale, return score and scale=100.',
  'Look at the therapist\'s question to determine the scale, then the client\'s answer for the score.',
].join(' ')

const moodExtractor = model.withStructuredOutput(MOOD_RATING_SCHEMA)

async function extractMoodRating(record: SessionStageRecord): Promise<MoodRating | undefined> {
  try {
    const transcript = [
      `Therapist (asking for mood rating): ${record.assistantReply}`,
      `Client response: ${record.userMessage}`,
    ].join('\n')

    const result = await moodExtractor.invoke([
      { role: 'system', content: MOOD_EXTRACTOR_PROMPT },
      { role: 'user', content: transcript },
    ])
    return { score: result.score, scale: result.scale }
  } catch {
    return undefined
  }
}

// -----------------------------------------------------------------------------
// Public action
// -----------------------------------------------------------------------------

export async function generateSessionSummary(
  records: SessionStageRecord[],
  technique: PromptTechnique | 'mixed',
) {
  // Collect first I3 and I7 records for mood extraction
  const i3Record = records.find(r => r.intent === 'I3')
  const i7Record = records.find(r => r.intent === 'I7')

  // Run stage summarization and mood extraction in parallel
  const [llmSummaries, preMood, postMood] = await Promise.all([
    summarizeStages(records),
    i3Record ? extractMoodRating(i3Record) : undefined,
    i7Record ? extractMoodRating(i7Record) : undefined,
  ])

  const moodRatings = (preMood || postMood)
    ? { pre: preMood, post: postMood }
    : undefined

  return summaryGenerator.generate(records, technique, {
    stageSummaries: llmSummaries,
    moodRatings,
  })
}
