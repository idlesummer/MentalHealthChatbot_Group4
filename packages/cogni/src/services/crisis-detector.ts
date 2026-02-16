/**
 * CrisisDetector Service
 *
 * Screens user messages for crisis-level risk before they enter the CBT pipeline.
 * Returns a risk label (LOW / MED / HIGH) and a category so the caller can
 * short-circuit normal generation and serve a safe, pre-written response when
 * the user may be in immediate danger.
 */

import { z } from 'zod'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { Runnable } from '@langchain/core/runnables'

/** Risk levels returned by the classifier */
export type RiskLevel = 'LOW' | 'MED' | 'HIGH'

/** Categories of crisis the classifier can detect */
export type CrisisCategory =
  | 'none'
  | 'suicidal_ideation'
  | 'self_harm'
  | 'harm_to_others'
  | 'abuse_or_violence'
  | 'severe_distress'

/** Result from crisis detection */
export interface CrisisClassification {
  risk: RiskLevel
  category: CrisisCategory
  reasoning: string
}

/** Zod schema for structured output */
const crisisClassificationSchema = z.object({
  risk: z.enum(['LOW', 'MED', 'HIGH']),
  category: z.enum([
    'none',
    'suicidal_ideation',
    'self_harm',
    'harm_to_others',
    'abuse_or_violence',
    'severe_distress',
  ]),
  reasoning: z.string(),
})

/** System prompt used by the risk classifier */
const CRISIS_DETECTION_SYSTEM_PROMPT = [
  'You are a safety screening classifier for a mental-health chatbot.',
  'Your ONLY job is to assess the risk level of the user\'s message.',
  '',
  'Return ONE of these risk levels:',
  '  HIGH — The user expresses active suicidal intent, a plan to harm themselves or others, or describes ongoing abuse/violence.',
  '  MED  — The user mentions passive suicidal thoughts, self-harm urges without a plan, feelings of hopelessness with no safety, or references to abuse that may still be occurring.',
  '  LOW  — Normal distress, everyday struggles, venting, or no safety concern.',
  '',
  'Return ONE category:',
  '  none               — No safety concern detected.',
  '  suicidal_ideation   — Thoughts of ending one\'s life or wishing to die.',
  '  self_harm           — Urges or actions to hurt oneself (cutting, burning, etc.).',
  '  harm_to_others      — Expressed intent or plan to hurt another person.',
  '  abuse_or_violence   — Disclosure of being abused or witnessing violence.',
  '  severe_distress     — Extreme emotional crisis (panic, dissociation, psychosis-like symptoms).',
  '',
  'Be sensitive but accurate. When in doubt between MED and LOW, prefer MED.',
  'Return JSON matching the schema exactly.',
].join('\n')

/** Safe template responses keyed by category */
export const CRISIS_SAFE_RESPONSES: Record<CrisisCategory, string> = {
  none: '',

  suicidal_ideation:
    'I hear you, and I want you to know that what you\'re feeling matters. ' +
    'Please reach out to someone who can help right now:\n\n' +
    '- **988 Suicide & Crisis Lifeline** — call or text **988** (US)\n' +
    '- **Crisis Text Line** — text **HOME** to **741741**\n' +
    '- **International Association for Suicide Prevention** — https://www.iasp.info/resources/Crisis_Centres/\n\n' +
    'You don\'t have to go through this alone. A trained counselor can talk with you right now.',

  self_harm:
    'I can see you\'re going through a really difficult time. ' +
    'Please consider reaching out to a professional who can support you:\n\n' +
    '- **988 Suicide & Crisis Lifeline** — call or text **988** (US)\n' +
    '- **Crisis Text Line** — text **HOME** to **741741**\n\n' +
    'Your safety is the most important thing right now. You deserve support.',

  harm_to_others:
    'It sounds like things are really intense right now. ' +
    'I\'d encourage you to speak with someone who can help you work through these feelings safely:\n\n' +
    '- **988 Suicide & Crisis Lifeline** — call or text **988** (US)\n' +
    '- **Emergency services** — call **911** if there is immediate danger\n\n' +
    'Talking to a professional can make a real difference.',

  abuse_or_violence:
    'Thank you for trusting me with something so difficult. ' +
    'You deserve to be safe, and there are people who can help:\n\n' +
    '- **National Domestic Violence Hotline** — call **1-800-799-7233** or text **START** to **88788**\n' +
    '- **RAINN (sexual assault)** — call **1-800-656-4673**\n' +
    '- **Childhelp National Child Abuse Hotline** — call **1-800-422-4453**\n\n' +
    'You are not alone, and this is not your fault.',

  severe_distress:
    'I can tell you\'re going through something very overwhelming right now. ' +
    'Please consider talking to someone who can help:\n\n' +
    '- **988 Suicide & Crisis Lifeline** — call or text **988** (US)\n' +
    '- **Crisis Text Line** — text **HOME** to **741741**\n\n' +
    'It\'s okay to ask for help. A counselor can support you through this moment.',
}

/** Service for screening user messages for crisis-level risk */
export class CrisisDetector {
  private classifier: Runnable

  constructor(model: BaseChatModel) {
    this.classifier = model.withStructuredOutput(crisisClassificationSchema)
  }

  /** Classify the risk level of a user message */
  async classify(message: string): Promise<CrisisClassification> {
    const classification: CrisisClassification = await this.classifier.invoke([
      { role: 'system', content: CRISIS_DETECTION_SYSTEM_PROMPT },
      { role: 'user', content: message },
    ])
    return classification
  }

  /** Get the safe response template for a given category */
  static getSafeResponse(category: CrisisCategory): string {
    return CRISIS_SAFE_RESPONSES[category]
  }

  /** Check if a risk level requires intervention (MED or HIGH) */
  static requiresIntervention(risk: RiskLevel): boolean {
    return risk === 'HIGH' || risk === 'MED'
  }
}
