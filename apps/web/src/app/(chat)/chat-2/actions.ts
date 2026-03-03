'use server'

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, CrisisDetector, SessionSummaryGenerator, INTENT_LABELS } from '@rainev/cogni'
import nodemailer from 'nodemailer'
import { SessionExportPayload } from '@/lib/store/session-data'
import type {
  Intent,
  PromptTechnique,
  Message,
  SessionStageRecord,
  StageSummaries,
  CrisisClassification,
} from '@rainev/cogni'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4.1',
  temperature: 0.2,
})

const engine = new CogniEngine(model)
const crisisDetector = new CrisisDetector(model)
const summaryGenerator = new SessionSummaryGenerator()

// ---------------------------------------------------------------------------
// Chat response
// ---------------------------------------------------------------------------

export async function generateResponse(
  message: string,
  intent: Intent,
  technique: PromptTechnique,
  messages: Message[],
) {
  const crisis = await crisisDetector.classify(message)

  if (CrisisDetector.requiresIntervention(crisis.risk)) {
    const safeReply = CrisisDetector.getSafeResponse(crisis.category)
    return {
      reply: safeReply,
      identifiedIntent: intent,
      distortion: undefined,
      crisis,
    }
  }

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

// ---------------------------------------------------------------------------
// Session summary (LLM-enhanced)
// ---------------------------------------------------------------------------

const STAGE_SUMMARIZER_PROMPT = [
  'You are a clinical note writer summarizing a CBT session for a therapist.',
  'For each stage of the session, write a concise 1-sentence clinical summary.',
  'Preserve all key details (names, numbers, specific thoughts) — be lossless but concise.',
  'Write in third person (e.g. "Client described..." not "I described...").',
  'Do NOT add interpretation. Summarize only what the client actually said.',
].join(' ')

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

async function summarizeStages(records: SessionStageRecord[]): Promise<StageSummaries> {
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

  const schema = buildStageSummariesSchema(visitedIntents)
  const summarizer = model.withStructuredOutput(schema)
  const result = await summarizer.invoke([
    { role: 'system', content: STAGE_SUMMARIZER_PROMPT },
    { role: 'user', content: transcript },
  ])

  return result as StageSummaries
}

export async function generateSessionSummary(
  records: SessionStageRecord[],
  technique: PromptTechnique | 'mixed',
) {
  const llmSummaries = await summarizeStages(records)
  return summaryGenerator.generate(records, technique, { stageSummaries: llmSummaries })
}

// ---------------------------------------------------------------------------
// Email export
// ---------------------------------------------------------------------------

export async function sendDataSMTP(payload: SessionExportPayload) {
  const exportedBy = (payload.exportedBy || '').trim()
  if (!exportedBy) throw new Error('Name is required')
  if (!Array.isArray(payload.records) || !payload.records.length) {
    throw new Error('No Records Exists.')
  }

  const transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS'),
    },
  })

  const emailBody = JSON.stringify(
    {
      exportedBy,
      exportedAt: new Date().toISOString(),
      records: payload.records,
    },
    null,
    2,
  )

  const fromEmail = requireEnv('MAIL_FROM_EMAIL')

  await transporter.sendMail({
    from: `"CBT Export — ${exportedBy}" <${fromEmail}>`,
    to: requireEnv('MAIL_TO'),
    subject: `Session Export — ${exportedBy}`,
    text: `CBT session export from ${exportedBy}`,
    attachments: [
      {
        filename: `cbt-session-${exportedBy}-${Date.now()}.json`,
        content: emailBody,
        contentType: 'application/json',
      },
    ],
  })

  return { ok: true }
}
