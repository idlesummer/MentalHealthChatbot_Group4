/**
 * Prompt Module - Barrel Export
 *
 * Central export point for all prompt-related functionality.
 * Aggregates prompt engineering techniques for the CBT pipeline.
 */

// Export the main prompt registry and individual technique maps
export {
  CHAIN_OF_THOUGHT_PROMPTS,
  FEW_SHOT_PROMPTS,
  PERSONA_PROMPTS,
  PLAN_AND_SOLVE_PROMPTS,
  PEBBLES_PROMPTS,
  PROMPT_REGISTRY,
  PROMPT_TECHNIQUES,
} from './registry'

// Export prompt types
export type {
  IntentPromptConfig,
  IntentPromptMap,
  PromptRegistry,
  PromptTechnique,
} from './types'
