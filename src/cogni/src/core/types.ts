/**
 * Core TypeScript types for the Cogni CBT Engine
 */

// ============================================================================
// PROMPT TECHNIQUE TYPES
// ============================================================================

/**
 * Available prompt engineering techniques
 */
export type PromptTechnique =
  | "default"
  | "few-shot"
  | "chain-of-thought"
  | "persona"
  | "plan-and-solve";

/**
 * Configuration for a specific intent prompt
 */
export type IntentPromptConfig = {
  role: string;
  system: string;
};

/**
 * Map of intent IDs to their prompt configurations
 */
export type IntentPromptMap = Record<string, IntentPromptConfig>;

// ============================================================================
// COGNITIVE DISTORTION TYPES
// ============================================================================

/**
 * The 10 cognitive distortions identified in CBT
 */
export const COGNITIVE_DISTORTION_KEYS = [
  "All-or-Nothing Thinking",
  "Overgeneralization",
  "Mental Filtering",
  "Discounting the Positive",
  "Jumping to Conclusions",
  "Catastrophizing",
  "Emotional Reasoning",
  "Should Statements",
  "Labeling",
  "Personalization & Blame",
] as const;

export type CognitiveDistortion = typeof COGNITIVE_DISTORTION_KEYS[number];

/**
 * Result from cognitive distortion classification
 */
export interface CognitiveDistortionResult {
  distortion: CognitiveDistortion;
  confidence: number;
  rationale: string;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

/**
 * A message in the conversation
 */
export interface Message {
  id: string;
  user: string;  // "You" or assistant name
  text: string;
  ts: number;    // Timestamp
}

// ============================================================================
// INTENT TYPES
// ============================================================================

/**
 * The 8 CBT intents in order
 */
export type Intent = "I1" | "I2" | "I3" | "I4" | "I5" | "I6" | "I7" | "I8";

/**
 * Intent transition evaluation result
 */
export interface IntentTransitionResult {
  moveToNextIntent: boolean;
  confidence: number;
  reason: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Parameters for generating a CBT response
 */
export interface GenerateResponseParams {
  message: string;
  currentIntent: string;
  conversationHistory: Message[];
  promptTechnique: PromptTechnique;
}

/**
 * Result from generating a CBT response
 */
export interface GenerateResponseResult {
  reply: string;
  nextIntent: string;
  cognitiveDistortion?: CognitiveDistortionResult;
}

/**
 * Parameters for computing the next intent
 */
export interface ComputeNextIntentParams {
  currentIntent: string;
  message: string;
  conversationHistory: Message[];
}

// ============================================================================
// MODEL TYPES (for dependency injection)
// ============================================================================

/**
 * Interface for the LLM model used by the CBT engine
 * This allows for dependency injection and testing
 */
export interface LLMModel {
  invoke(prompt: string | any[]): Promise<any>;
}

/**
 * Interface for structured output models (with Zod schema)
 */
export interface StructuredOutputModel<T> {
  invoke(prompt: string | any[]): Promise<T>;
}
