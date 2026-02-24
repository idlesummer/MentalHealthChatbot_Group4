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
    'I hear you, and I want you to know that what you’re feeling matters. ' +
    'If you are in immediate danger or might harm yourself, please call your local emergency number right now or go to the nearest emergency department.\n\n' +
    '- National Center for Mental Health (NCMH) Crisis Hotline — 0917-057-1553 (24/7 support) or GLOBE/ TM: 0917-899-8727 (USAP)\n' +
    '- Hopeline PH — PLDT: (02)-8804-4673 or GLOBE: 0917-558-4673 or SMART: 0918-873-4673 \n' +
    '- Find A Helpline - Philippines — a comprehensive list of crisis resources: https://findahelpline.com/countries/ph\n\n' +
    'You don’t have to go through this alone. A trained counselor can support you right now.',

  self_harm:
    'I’m really sorry you’re going through this. Your safety is the most important thing right now. ' +
    'If you are in immediate danger, please call your local emergency number or go to the nearest emergency department.\n\n' +
    '- National Center for Mental Health (NCMH) Crisis Hotline — 0917-057-1553 (24/7 support) or GLOBE/ TM: 𝟎𝟗𝟏𝟕-𝟖𝟗𝟗-𝟖𝟕𝟐𝟕 (USAP))\n' +
    '- Hopeline PH — PLDT: (02)-8804-4673 or GLOBE: 0917-558-4673 or SMART: 0918-873-4673 \n' +
    '- Find A Helpline - Philippines — a comprehensive list of crisis resources: https://findahelpline.com/countries/ph\n\n' +
    'If you can, please reach out to someone you trust or a professional who can help.',

  harm_to_others:
    'It sounds like things are really intense right now. If there is immediate danger, please contact your local emergency services right away.\n\n' +
    '- National Center for Mental Health (NCMH) Crisis Hotline — 0917-057-1553 (24/7 support) or GLOBE/ TM: 𝟎𝟗𝟏𝟕-𝟖𝟗𝟗-𝟖𝟕𝟐𝟕 (USAP))\n' +
    '- Hopeline PH — PLDT: (02)-8804-4673 or GLOBE: 0917-558-4673 or SMART: 0918-873-4673 \n' +
    '- Find A Helpline - Philippines — a comprehensive list of crisis resources: https://findahelpline.com/countries/ph\n\n' +
    'Talking to a mental health professional or crisis counselor can help you work through this safely.',

  abuse_or_violence:
    'Thank you for trusting me with something so difficult. You deserve to be safe. ' +
    'If you are in immediate danger, please call your local emergency number right now.\n\n' +
    '- National Center for Mental Health (NCMH) Crisis Hotline — 0917-057-1553 (24/7 support) or GLOBE/ TM: 𝟎𝟗𝟏𝟕-𝟖𝟗𝟗-𝟖𝟕𝟐𝟕 (USAP))\n' +
    '- Hopeline PH — PLDT: (02)-8804-4673 or GLOBE: 0917-558-4673 or SMART: 0918-873-4673 \n' +
    '- Find A Helpline - Philippines — a comprehensive list of crisis resources: https://findahelpline.com/countries/ph\n\n' +
    'You are not alone, and this is not your fault.',

  severe_distress:
    'I can tell you’re going through something overwhelming right now. It’s okay to ask for help. ' +
    'If you are in immediate danger, please call your local emergency number or go to the nearest emergency department.\n\n' +
    '- National Center for Mental Health (NCMH) Crisis Hotline — 0917-057-1553 (24/7 support) or GLOBE/ TM: 𝟎𝟗𝟏𝟕-𝟖𝟗𝟗-𝟖𝟕𝟐𝟕 (USAP))\n' +
    '- Hopeline PH — PLDT: (02)-8804-4673 or GLOBE: 0917-558-4673 or SMART: 0918-873-4673 \n' +
    '- Find A Helpline - Philippines — a comprehensive list of crisis resources: https://findahelpline.com/countries/ph\n\n' +
    'If you can, consider reaching out to someone you trust or a professional who can support you through this moment.',
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
