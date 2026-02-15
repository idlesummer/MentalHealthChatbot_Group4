/**
 * Prompt Types
 *
 * Type definitions for the prompt engineering domain.
 * Defines the available techniques and prompt configuration structures.
 */

import type { Intent } from '@/services'

/** Available prompt engineering techniques */
export type PromptTechnique =
  | 'default'
  | 'few-shot'
  | 'chain-of-thought'
  | 'persona'
  | 'plan-and-solve'
  | 'pebbles'

/** Configuration for a specific intent prompt */
export type IntentPromptConfig = {
  role: string
  system: string
}

/** Map of intent IDs (I1-I8) to their prompt configurations */
export type IntentPromptMap = Record<Intent, IntentPromptConfig>

/** Registry mapping all prompt techniques to their intent configurations */
export type PromptRegistry = Record<PromptTechnique, IntentPromptMap | null>
