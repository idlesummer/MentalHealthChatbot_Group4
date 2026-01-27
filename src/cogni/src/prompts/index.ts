/**
 * Prompt Blueprints - Export Module
 *
 * This module aggregates all prompt engineering techniques for the CBT pipeline.
 * Each technique implements the same 8-stage intent system with different
 * prompting strategies.
 */

import { INTENT_PROMPTS_PERSONA } from "./Persona";
import { INTENT_PROMPTS_FEWSHOT } from "./Fewshot";
import { INTENT_PROMPTS_COT } from "./ChainOfThought";
import { INTENT_PROMPTS_PAS } from "./PlanAndSolve";
import { IntentPromptMap, PromptTechnique } from "../core/types";

/**
 * Map of prompt techniques to their intent configurations
 */
export const CHOSEN_PROMPT: Record<PromptTechnique, IntentPromptMap | null> = {
  "default": null,
  "few-shot": INTENT_PROMPTS_FEWSHOT,
  "chain-of-thought": INTENT_PROMPTS_COT,
  "persona": INTENT_PROMPTS_PERSONA,
  "plan-and-solve": INTENT_PROMPTS_PAS
};

/**
 * Export individual prompt maps for direct access if needed
 */
export {
  INTENT_PROMPTS_PERSONA,
  INTENT_PROMPTS_FEWSHOT,
  INTENT_PROMPTS_COT,
  INTENT_PROMPTS_PAS
};
