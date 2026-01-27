/**
 * Cogni CBT Engine - Main API
 *
 * This module provides a clean, callable API for the CBT pipeline.
 * It abstracts all CBT-related logic into a simple interface that can be
 * called from any frontend or backend.
 */

import { identifyCognitiveDistortions } from "../core/distortion";
import { computeNextIntent, getInitialIntent, getIntents } from "../core/intent";
import { CHOSEN_PROMPT } from "../prompts";
import {
  CognitiveDistortionResult,
  GenerateResponseParams,
  GenerateResponseResult,
  Intent,
  IntentPromptConfig,
  IntentPromptMap,
  LLMModel,
  Message,
  PromptTechnique,
  StructuredOutputModel,
} from "../core/types";

/**
 * Configuration for the CogniEngine
 */
export interface CogniEngineConfig {
  /**
   * The main LLM model used for generating responses
   */
  mainModel: LLMModel;

  /**
   * A structured output model for classifying cognitive distortions
   */
  distortionClassifier: StructuredOutputModel<CognitiveDistortionResult>;

  /**
   * A structured output model for evaluating intent transitions
   */
  intentEvaluator: StructuredOutputModel<{
    moveToNextIntent: boolean;
    confidence: number;
    reason: string;
  }>;
}

/**
 * CogniEngine - The main CBT pipeline engine
 *
 * This class provides a high-level API for interacting with the CBT pipeline.
 * It handles:
 * - Cognitive distortion detection
 * - Intent management and transitions
 * - Response generation using different prompt techniques
 *
 * @example
 * ```typescript
 * const engine = new CogniEngine({
 *   mainModel: myLLM,
 *   distortionClassifier: myClassifier,
 *   intentEvaluator: myEvaluator
 * });
 *
 * const result = await engine.generateResponse({
 *   message: "I failed my exam",
 *   currentIntent: "I1",
 *   conversationHistory: [],
 *   promptTechnique: "persona"
 * });
 * ```
 */
export class CogniEngine {
  private mainModel: LLMModel;
  private distortionClassifier: StructuredOutputModel<CognitiveDistortionResult>;
  private intentEvaluator: StructuredOutputModel<{
    moveToNextIntent: boolean;
    confidence: number;
    reason: string;
  }>;

  constructor(config: CogniEngineConfig) {
    this.mainModel = config.mainModel;
    this.distortionClassifier = config.distortionClassifier;
    this.intentEvaluator = config.intentEvaluator;
  }

  /**
   * Generate a CBT response for the user's message
   *
   * This is the main method for interacting with the CBT pipeline.
   * It:
   * 1. Identifies cognitive distortions in the message
   * 2. Builds a prompt using the selected technique and current intent
   * 3. Generates a response using the LLM
   * 4. Evaluates whether to transition to the next intent
   *
   * @param params - Parameters for generating the response
   * @returns The assistant's reply, next intent, and identified distortion
   */
  async generateResponse(
    params: GenerateResponseParams
  ): Promise<GenerateResponseResult> {
    const { message, currentIntent, conversationHistory, promptTechnique } = params;

    // Step 1: Identify cognitive distortion
    const cognitiveDistortion = await this.identifyCognitiveDistortions(message);

    // Step 2: Build the prompt
    const fullPrompt = this.buildPrompt(
      message,
      currentIntent,
      promptTechnique,
      conversationHistory,
      cognitiveDistortion
    );

    console.log("FINAL PROMPT: ", fullPrompt);

    // Step 3: Generate response
    const response = await this.mainModel.invoke(fullPrompt);
    const reply = typeof response === "string" ? response : response.text || response.content || String(response);

    // Step 4: Compute next intent
    const nextIntent = await this.computeNextIntent({
      currentIntent,
      message,
      conversationHistory,
      promptTechnique,
    });

    return {
      reply,
      nextIntent: nextIntent || currentIntent,
      cognitiveDistortion,
    };
  }

  /**
   * Identify cognitive distortions in a message
   *
   * @param message - The user's message to analyze
   * @returns Cognitive distortion classification result
   */
  async identifyCognitiveDistortions(
    message: string
  ): Promise<CognitiveDistortionResult> {
    return identifyCognitiveDistortions(message, this.distortionClassifier);
  }

  /**
   * Compute the next intent based on current state
   *
   * @param params - Parameters for computing next intent
   * @returns The next intent to transition to
   */
  async computeNextIntent(params: {
    currentIntent: string;
    message: string;
    conversationHistory: Message[];
    promptTechnique: PromptTechnique;
  }): Promise<string> {
    const nextIntent = await computeNextIntent(
      params.currentIntent,
      this.intentEvaluator,
      params.message,
      params.conversationHistory,
      params.promptTechnique
    );
    return nextIntent || params.currentIntent;
  }

  /**
   * Build a prompt for the LLM
   *
   * @param message - User's message
   * @param intent - Current intent
   * @param promptTechnique - Selected prompt technique
   * @param messages - Conversation history
   * @param distortion - Identified cognitive distortion
   * @returns The complete prompt string
   */
  private buildPrompt(
    message: string,
    intent: string,
    promptTechnique: PromptTechnique,
    messages: Message[],
    distortion: CognitiveDistortionResult
  ): string {
    const PROMPT_DATA = CHOSEN_PROMPT[promptTechnique] as IntentPromptMap | null;
    const intentData = PROMPT_DATA?.[intent] ?? ({
      role: "Default CBT-base assistant",
      system: "Use general CBT-based guidance to assist the user.",
    } as IntentPromptConfig);

    console.log("PROMPT DATA: \n", PROMPT_DATA);
    console.log("intentData: \n", intentData);

    return [
      `You are a CBT-based assistant helping the user manage their thoughts and emotions.`,
      `Use this conversation history to inform your response:\n${messages
        .map((m: Message) => `${m.user}: ${m.text}`)
        .join("\n")}`,
      `Use the following guidelines for this stage:\n${intentData.system}`,
      `Identified Cognitive Distortion: ${distortion.distortion}.`,
      `\nUser Message:\n"${message}"`,
      `\nPlease respond in a way that aligns with the user's CBT stage and identified distortion.`,
    ].join("\n");
  }

  /**
   * Get all available intents
   */
  getIntents(): Intent[] {
    return getIntents();
  }

  /**
   * Get the initial intent for a new session
   */
  getInitialIntent(): Intent {
    return getInitialIntent();
  }

  /**
   * Get all available prompt techniques
   */
  getPromptTechniques(): PromptTechnique[] {
    return ["default", "few-shot", "chain-of-thought", "persona", "plan-and-solve"];
  }
}

/**
 * Simplified function-based API (alternative to class-based API)
 *
 * This provides a simpler interface for one-off calls without instantiating the engine.
 */
export async function generateCBTResponse(
  params: GenerateResponseParams & CogniEngineConfig
): Promise<GenerateResponseResult> {
  const { mainModel, distortionClassifier, intentEvaluator, ...requestParams } = params;

  const engine = new CogniEngine({
    mainModel,
    distortionClassifier,
    intentEvaluator,
  });

  return engine.generateResponse(requestParams);
}

/**
 * Export all types for external use
 */
export * from "../core/types";
export { COGNITIVE_DISTORTION_KEYS } from "../core/types";
