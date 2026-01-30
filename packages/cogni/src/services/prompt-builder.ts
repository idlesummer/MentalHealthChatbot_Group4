/**
 * PromptBuilder Service
 *
 * Responsible for building all prompts used in the CBT pipeline.
 * Centralizes prompt construction logic for consistency and maintainability.
 */

import { PROMPT_REGISTRY } from '@/prompts'
import type { PromptTechnique, IntentPromptConfig } from '@/prompts'
import type { CognitiveDistortionClassification as DistortionClassification } from './distortion-classifier'
import type { Intent } from './intent-manager'

/** A message in the conversation */
export interface Message {
  id: string
  user: string  // 'You' or assistant name
  text: string
  ts: number    // Timestamp
}

/** Service for building prompts used throughout the CBT pipeline */
export class PromptBuilder {

  /** Build a prompt for generating a CBT response */
  buildReplyPrompt(
    message: string,
    intent: Intent,
    technique: PromptTechnique,
    conversation: Message[],
    distortion: DistortionClassification,
  ) {
    const techniquePrompts = PROMPT_REGISTRY[technique]
    const intentConfig = techniquePrompts?.[intent] ?? {
      role: 'Default CBT-base assistant',
      system: 'Use general CBT-based guidance to assist the user.',
    } as IntentPromptConfig

    return [
      'You are a CBT-based assistant helping the user manage their thoughts and emotions.',
      `Use this conversation history to inform your response:\n${conversation.map(m => `${m.user}: ${m.text}`).join('\n')}`,
      `Use the following guidelines for this stage:\n${intentConfig.system}`,
      `Identified Cognitive Distortion: ${distortion.distortion}.`,
      '',
      `User Message:\n'${message}'`,
      '',
      'Please respond in a way that aligns with the user\'s CBT stage and identified distortion.',
    ].join('\n')
  }

  /** Build a prompt for evaluating intent transitions */
  buildIntentEvaluationPrompt(
    state: Intent,
    input: string,
    context: Message[],
    intentConfig: IntentPromptConfig,
    completionRule: string,
  ) {
    return [
      'You are an intent transition evaluator for a CBT chatbot.',
      `Use the conversation history to inform your decision:\n${context.map(m => `${m.user}: ${m.text}`).join('\n')}`,
      `Current Intent: ${state} (${intentConfig.role})`,
      `User message: '${input}'`,
      '',
      'Return strictly this JSON: { moveToNextIntent: boolean, confidence: number (0-1), reason: string }',
      '',
      `DECISION RULE (authoritative): ${completionRule}`,
      '',
      'If the reason indicates that the goal is fulfilled, this should be reflected in the confidence in order to move to the next intent.',
      'Intent description (for context):',
      intentConfig.system,
    ].join('\n')
  }
}
