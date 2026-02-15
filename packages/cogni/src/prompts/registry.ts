/**
 * Prompt Technique Registry
 *
 * Central registry mapping prompt engineering techniques to their
 * intent configurations for the CBT pipeline.
 */

import { CHAIN_OF_THOUGHT_PROMPTS } from './chain-of-thought'
import { FEW_SHOT_PROMPTS } from './few-shot'
import { PERSONA_PROMPTS } from './persona'
import { PLAN_AND_SOLVE_PROMPTS } from './plan-and-solve'
import { PEBBLES_PROMPTS } from './pebbles'
import type { PromptRegistry, PromptTechnique } from './types'

/**
 * Registry of all available prompt techniques mapped to their intent configurations.
 *
 * The 'default' technique uses null (no custom prompts).
 * All other techniques provide full intent maps (I1-I8) with role and system prompts.
 */
export const PROMPT_REGISTRY: PromptRegistry = {
  'default':          null,
  'few-shot':         FEW_SHOT_PROMPTS,
  'chain-of-thought': CHAIN_OF_THOUGHT_PROMPTS,
  'persona':          PERSONA_PROMPTS,
  'plan-and-solve':   PLAN_AND_SOLVE_PROMPTS,
  'pebbles':          PEBBLES_PROMPTS
} as const

/** List of available prompt technique names */
export const PROMPT_TECHNIQUES = Object.keys(PROMPT_REGISTRY) as readonly PromptTechnique[]

/** Export individual prompt technique maps for direct access */
export {
  PERSONA_PROMPTS,
  FEW_SHOT_PROMPTS,
  CHAIN_OF_THOUGHT_PROMPTS,
  PLAN_AND_SOLVE_PROMPTS,
  PEBBLES_PROMPTS
}
