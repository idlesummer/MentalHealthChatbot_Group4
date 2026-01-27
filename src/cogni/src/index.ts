/**
 * Cogni - Cognitive Behavioral Therapy Engine
 *
 * A standalone, reusable CBT pipeline implementation with support for:
 * - 8-stage intent-driven workflow (Situation → Thought → Mood → Evidence → Alternative → Re-rating → Coping)
 * - 10 cognitive distortion classifications
 * - 4 prompt engineering techniques (Persona, Few-shot, Chain-of-Thought, Plan-and-Solve)
 * - Flexible API for integration with any frontend or LLM backend
 *
 * @module cogni
 * @version 1.0.0
 */

// ============================================================================
// MAIN API EXPORTS
// ============================================================================

export {
  CogniEngine,
  generateCBTResponse,
  type CogniEngineConfig,
} from "./api";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
  // Core types
  type Intent,
  type Message,
  type PromptTechnique,
  type IntentPromptConfig,
  type IntentPromptMap,

  // Cognitive distortion types
  type CognitiveDistortion,
  type CognitiveDistortionResult,
  COGNITIVE_DISTORTION_KEYS,

  // Intent types
  type IntentTransitionResult,

  // API types
  type GenerateResponseParams,
  type GenerateResponseResult,
  type ComputeNextIntentParams,

  // Model types
  type LLMModel,
  type StructuredOutputModel,
} from "./core/types";

// ============================================================================
// CORE FUNCTIONALITY EXPORTS
// ============================================================================

export {
  // Intent management
  computeNextIntent,
  getInitialIntent,
  getIntents,
  getCompletionRule,
  getNextIntentRoute,
  INTENT_ROUTES,
  COMPLETION_RULES,
} from "./core/intent";

export {
  // Cognitive distortion detection
  identifyCognitiveDistortions,
  COGNITIVE_DISTORTIONS,
} from "./core/distortion";

// ============================================================================
// PROMPT BLUEPRINTS EXPORTS
// ============================================================================

export {
  CHOSEN_PROMPT,
  INTENT_PROMPTS_PERSONA,
  INTENT_PROMPTS_FEWSHOT,
  INTENT_PROMPTS_COT,
  INTENT_PROMPTS_PAS,
} from "./prompts";

// ============================================================================
// VERSION INFO
// ============================================================================

export const COGNI_VERSION = "1.0.0";
export const COGNI_NAME = "Cogni CBT Engine";
