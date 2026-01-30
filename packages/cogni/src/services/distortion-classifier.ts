/**
 * DistortionClassifier Service
 *
 * Responsible for detecting cognitive distortions in user messages.
 * Identifies cognitive distortions using the 10 cognitive distortions defined in CBT,
 * plus 'none' for cases where no distortion is present.
 */

import { z } from 'zod'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { Runnable } from '@langchain/core/runnables'

/** Union of all supported cognitive distortion names */
export type CognitiveDistortion = keyof typeof COGNITIVE_DISTORTIONS

/** Result from cognitive distortion classification */
export interface CognitiveDistortionClassification {
  distortion: CognitiveDistortion
  confidence: number
  rationale: string
}

/** Descriptions of the 10 cognitive distortions (plus 'none') */
export const COGNITIVE_DISTORTIONS = {
  'none':                     'No cognitive distortion detected.',
  'all-or-nothing thinking':  'Seeing things as all good or all bad - no gray area.',
  'overgeneralization':       'Taking one event and applying it broadly (\'I always mess things up\').',
  'mental filtering':         'Focusing only on the negative and ignoring the positive.',
  'discounting the positive': 'Rejecting positive experiences by insisting they don\'t count.',
  'jumping to conclusions':   'Making negative interpretations without evidence.',
  'catastrophizing':          'Exaggerating the importance of problems or imagining the worst-case scenario.',
  'emotional reasoning':      'Believing that negative feelings reflect reality (\'I feel it, so it must be true\').',
  'should statements':        'Using rigid rules on yourself or others (\'I should always do well\').',
  'labeling':                 'Assigning global negative labels to yourself or others (\'I\'m a failure\').',
  'personalization & blame':  'Blaming yourself for things outside your control, or blaming others excessively.',
} as const

/** All cognitive distortion keys (derived from COGNITIVE_DISTORTIONS) */
export const COGNITIVE_DISTORTION_KEYS = Object.keys(COGNITIVE_DISTORTIONS) as readonly CognitiveDistortion[]

/** System prompt for cognitive distortion detection */
const DISTORTION_DETECTION_SYSTEM_PROMPT = [
  'You are a CBT assistant.',
  'Classify the user\'s text into exactly one cognitive distortion from the provided list.',
  'If several apply, pick the best single fit.',
  'If there aren\'t any that fit, choose \'none\'.',
  'Return JSON matching the schema exactly.',
].join(' ')

/** Precomputed distortion options string */
const DISTORTION_OPTIONS = COGNITIVE_DISTORTION_KEYS.map(k => `- ${k}: ${COGNITIVE_DISTORTIONS[k]}`).join('\n')

/** Schema for cognitive distortion classification */
const cognitiveDistortionSchema = z.object({
  distortion: z.enum(COGNITIVE_DISTORTION_KEYS),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
})

/** Service for detecting cognitive distortions */
export class DistortionClassifier {
  private classifier: Runnable
  constructor(model: BaseChatModel) {
    // Create structured output model for distortion classification
    this.classifier = model.withStructuredOutput(cognitiveDistortionSchema)
  }

  /** Classify cognitive distortions in a user message */
  async classify(message: string) {
    const classification: CognitiveDistortionClassification = await this.classifier.invoke([
      { role: 'system', content: DISTORTION_DETECTION_SYSTEM_PROMPT },
      { role: 'user', content: `Options:\n${DISTORTION_OPTIONS}\n\nUser text:\n'''${message}'''` },
    ])
    return classification
  }
}
