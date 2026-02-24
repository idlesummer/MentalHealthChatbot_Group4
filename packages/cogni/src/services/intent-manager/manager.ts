/**
 * IntentManager Service
 *
 * Responsible for managing CBT intent transitions using a state machine.
 * Evaluates whether to move to the next intent based on user responses.
 */

import { z } from 'zod'
import { PROMPT_REGISTRY } from '@/prompts'
import { StateMachine } from '@/utils/state-machine'
import { INTENTS, INTENT_COMPLETION_REGISTRY, INTENT_ROUTE_REGISTRY } from './intents'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { Runnable } from '@langchain/core/runnables'
import type { IntentPromptConfig, PromptTechnique } from '@/prompts'
import type { Message } from '../types'
import type { Intent } from './intents'

// const MAX_TURNS_PER_INTENT = 8

/** Intent transition evaluation result */
export interface IntentTransition {
  moveToNextIntent: boolean
  confidence: number
  reason: string
}

/** Schema for intent transition evaluation */
const intentTransitionSchema = z.object({
  moveToNextIntent: z.boolean(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
})

export interface IntentManagerConfig {
  model: BaseChatModel
}

/** Service for managing intent transitions in the CBT pipeline */
export class IntentManager {
  private stateMachine: StateMachine<Intent, string, Message[], IntentTransition, string>
  private intentEvaluator: Runnable
  private intentCounts: Record<Intent, number> = {
    I1: 0,
    I2: 0,
    I3: 0,
    I4: 0,
    I5: 0,
    I6: 0,
    I7: 0,
    I8: 0,
  }

  //   private intentStallCounts: Record<Intent, number> = {
  //   I1: 0,
  //   I2: 0,
  //   I3: 0,
  //   I4: 0,
  //   I5: 0,
  //   I6: 0,
  //   I7: 0,
  //   I8: 0,
  // }


  constructor(config: IntentManagerConfig) {
    // Create structured output model for intent evaluation
    this.intentEvaluator = config.model.withStructuredOutput(intentTransitionSchema)
    this.stateMachine = new StateMachine({
      initialState: 'I1' as Intent,
      routes: INTENT_ROUTE_REGISTRY,
      stateMeta: INTENT_COMPLETION_REGISTRY,
      shouldAdvance: decision => decision.moveToNextIntent && decision.confidence > 0.5,
      evaluator: async (state: Intent, input: string, context: Message[], meta?: string) => {
        return this.evaluateTransition(state, input, context, meta)
      },
    })
  }

  /** Evaluate whether to transition to the next intent */
  private async evaluateTransition(state: Intent, input: string, context: Message[], meta?: string) {
    const intentConfig = this.getIntentConfig(state, 'persona')
    const completionRule = meta ?? 'Decide completion conservatively but fairly.'

    const prompt = [
      'You are an intent transition evaluator for a CBT chatbot.',
      `Use the conversation history to inform your decision:\n${context.map(m => `${m.user}: ${m.text}`).join('\n')}`,
      `Current Intent: ${state} (${intentConfig.role})`,
      `User message: '${input}'`,
      '',
      'Return strictly this JSON: { moveToNextIntent: boolean, confidence: number (0-1), reason: string }',
      '',
      `DECISION RULE (authoritative): ${completionRule}`,
      '',
      'If the reason indicates that the goal is fulfilled, this should be reflected in the confidence in order to move to the next intent. Do not move if user expresses confusion and if completion rule is not fullfilled.',
      'Intent description (for context):',
      intentConfig.system,
    ].join('\n')

    const transition = this.intentEvaluator.invoke(prompt) as Promise<IntentTransition>
    return transition
  }

  /** Compute the next intent based on current state */
  async computeNextIntent(intent: Intent, message: string, conversation: Message[]): Promise<Intent> {
    try {
      const result = await this.stateMachine.step(intent, message, conversation)

    //  const stayedInSameIntent = result.nextState === intent
      
    //   if (stayedInSameIntent) {
    //     this.intentStallCounts[intent] += 1

    //     if (this.intentStallCounts[intent] >= MAX_TURNS_PER_INTENT) {
    //       const forcedNext = this.getNextIntentRoute(intent)
    //       this.intentStallCounts[intent] = 0

    //       if (forcedNext) { 
    //         this.intentCounts[forcedNext]++
    //         console.log('Intent counts:', this.intentCounts)
    //         console.log(`[IntentManager] Forced transition ${intent} -> ${forcedNext} after stall`)
    //         return forcedNext
    //       }
    //     }
    //   } else {
    //     // normal transition happened; clear stall on previous intent
    //     this.intentStallCounts[intent] = 0
    //   }

      // Track intent usage for analytics
      this.intentCounts[result.nextState]++
      console.log('Intent counts:', this.intentCounts)

      return result.nextState

    } catch (err) {
      console.error('[IntentManager.computeNextIntent] Error invoking model:', err)
      return intent
    }
  }

  /** Get intent configuration for a specific technique */
  private getIntentConfig(intent: Intent, technique: PromptTechnique): IntentPromptConfig {
    const techniquePrompts = PROMPT_REGISTRY[technique]
    return techniquePrompts?.[intent] ?? {
      role: 'Default CBT-base assistant',
      system: 'Use general CBT-based guidance to assist the user.',
    }
  }

  /** Get the initial intent for a new session */
  getInitialIntent(): Intent {
    return this.stateMachine.getInitialState()
  }

  /** Get all available intents */
  getIntents(): Intent[] {
    return INTENTS
  }

  /** Get the completion rule for a specific intent */
  getCompletionRule(intent: Intent) {
    return INTENT_COMPLETION_REGISTRY[intent] ?? 'Decide completion conservatively but fairly.'
  }

  /** Get the next intent in the routing sequence */
  getNextIntentRoute(intent: Intent): Intent | null {
    return INTENT_ROUTE_REGISTRY[intent] ?? null
  }

  /** Get the current intent count statistics */
  getIntentCounts(): Readonly<Record<Intent, number>> {
    return { ...this.intentCounts }
  }

  /** Reset intent counts (useful when starting a new session) */
  resetIntentCounts(): void {
    this.intentCounts = {
      I1: 0,
      I2: 0,
      I3: 0,
      I4: 0,
      I5: 0,
      I6: 0,
      I7: 0,
      I8: 0,
    }
  }
}
