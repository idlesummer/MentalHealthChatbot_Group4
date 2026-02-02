/**
 * Cogni CBT Engine - Main API
 *
 * This module provides a clean, callable API for the CBT pipeline.
 * It abstracts all CBT-related logic into a simple interface that can be
 * called from any frontend or backend.
 */

import { PROMPT_TECHNIQUES } from '@/prompts'
import { DistortionClassifier, PromptBuilder, ReplyGenerator, IntentManager } from '@/services'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { PromptTechnique } from '@/prompts'
import type {
  CognitiveDistortionClassification as DistortionClassification,
  Intent,
  Message,
} from '@/services'

/** Parameters for generating a CBT response */
export interface CogniRequest {
  message: string
  intent: Intent
  conversation: Message[]
  technique: PromptTechnique
}

/** Result from generating a CBT response */
export interface CogniResponse {
  reply: string
  nextIntent: Intent
  distortion?: DistortionClassification
}

/** Parameters for computing the next intent */
export interface ComputeNextIntentParams {
  intent: Intent
  message: string
  conversation: Message[]
}

/**
 * CogniEngine - The main CBT pipeline engine
 *
 * This class provides a high-level API for interacting with the CBT pipeline.
 * It orchestrates the CBT workflow using specialized services:
 * - Cognitive distortion detection
 * - Intent management and transitions
 * - Response generation using different prompt techniques
 *
 * @example
 * ```typescript
 * import { ChatOpenAI } from '@langchain/openai'
 * import { CogniEngine } from '@rainev/cogni'
 *
 * const model = new ChatOpenAI({ model: 'gpt-4o-mini' })
 * const engine = new CogniEngine(model)
 *
 * const result = await engine.respond({
 *   message: 'I failed my exam',
 *   intent: 'I1',
 *   conversation: [],
 *   technique: 'persona'
 * })
 * ```
 */
export class CogniEngine {
  private services: {
    distortionClassifier: DistortionClassifier
    promptBuilder: PromptBuilder
    replyGenerator: ReplyGenerator
    intentManager: IntentManager
  }

  constructor(model: BaseChatModel) {

    // Initialize services
    const distortionClassifier = new DistortionClassifier(model)
    const promptBuilder = new PromptBuilder()
    const replyGenerator = new ReplyGenerator(model)
    const intentManager = new IntentManager({ model, promptBuilder })
    this.services = {
      promptBuilder,
      distortionClassifier,
      replyGenerator,
      intentManager,
    }
  }

  /**
   * Generate a CBT response for the user's message
   *
   * This is the main method for interacting with the CBT pipeline.
   * It orchestrates the following steps:
   * 1. Identifies cognitive distortions in the message
   * 2. Builds a prompt using the selected technique and current intent
   * 3. Generates a response using the LLM
   * 4. Evaluates whether to transition to the next intent
   */
  async respond({ message, intent, conversation: convo, technique }: CogniRequest) {

    // Step 1: Identify cognitive distortion
    const distortion = await this.services.distortionClassifier.classify(message)

    // Step 2: Build the reply prompt
    const replyPrompt = this.services.promptBuilder.buildReplyPrompt(
      message,
      intent,
      technique,
      convo,
      distortion,
    )

    // Step 3: Generate reply with structured output
    const result = await this.services.replyGenerator.generate(replyPrompt)
    const reply = result.reply

    // Step 4: Compute next intent
    const newIntent = await this.services.intentManager.computeNextIntent(intent, message, convo) as Intent
    const nextIntent = newIntent || intent
    const response: CogniResponse = { reply, nextIntent, distortion }
    return response
  }

  /** Identify cognitive distortions in a message */
  async identifyCognitiveDistortions(message: string) {
    return this.services.distortionClassifier.classify(message)
  }

  /** Get all available intents */
  getIntents() {
    return this.services.intentManager.getIntents() as Intent[]
  }

  /** Get the initial intent for a new session */
  getInitialIntent() {
    return this.services.intentManager.getInitialIntent() as Intent
  }

  /** Get all available prompt techniques */
  getPromptTechniques() {
    return PROMPT_TECHNIQUES
  }

  /** Get intent count statistics for analytics */
  getIntentCounts() {
    return this.services.intentManager.getIntentCounts()
  }

  /** Reset intent counts (useful when starting a new session) */
  resetIntentCounts() {
    return this.services.intentManager.resetIntentCounts()
  }
}

/**
 * Simplified function-based API (alternative to class-based API)
 *
 * This provides a simpler interface for one-off calls without instantiating the engine.
 */
export async function generateCBTResponse(model: BaseChatModel, params: CogniRequest) {
  const engine = new CogniEngine(model)
  return engine.respond(params)
}
