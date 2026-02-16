'use server'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine } from '@rainev/cogni'
import type { Intent, PromptTechnique, Message } from '@rainev/cogni'
import nodemailer from 'nodemailer'
import { SessionExportPayload } from '@/lib/store/session-data'

// All functions that call APIs is will be defined here

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

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
  messages: Message[],
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


export async function sendDataSMTP(payload: SessionExportPayload) {
  const exportedBy = (payload.exportedBy || '').trim();
  if (!exportedBy) throw new Error('Name is required');
  if (!Array.isArray(payload.records )|| !payload.records.length) {
    throw new Error('No Records Exists.');
  }

  const transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true', // true for 465
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
