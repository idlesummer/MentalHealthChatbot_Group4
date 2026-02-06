/**
 * SessionTracker Service
 *
 * Collects structured data during a CBT session. After each call to
 * `engine.respond()`, the caller feeds the result into `tracker.record()`
 * to build up a typed timeline of stage snapshots.
 *
 * The tracker is intentionally decoupled from CogniEngine so it can be
 * used in any integration (CLI, web, tests) without modifying the engine.
 *
 * @example
 * ```typescript
 * const tracker = new SessionTracker()
 *
 * const result = await engine.respond({ message, intent, conversation, technique })
 * tracker.record({ intent, userMessage: message, response: result, technique })
 *
 * // After session ends:
 * const generator = new SessionSummaryGenerator()
 * const summary = generator.generate(tracker.getRecords(), tracker.getTechnique())
 * ```
 */

import type { CogniResponse } from '@/api'
import type { PromptTechnique } from '@/prompts'
import type { Intent } from '../intent-manager'
import type { SessionStageRecord } from './types'

/** Input for recording a single turn */
export interface RecordTurnInput {
  /** The intent the engine was on when it processed this turn */
  intent: Intent
  /** The user's message */
  userMessage: string
  /** The CogniResponse returned by engine.respond() */
  response: CogniResponse
  /** The prompt technique used for this turn */
  technique: PromptTechnique
}

/**
 * Collects structured stage records during a live CBT session.
 *
 * Stateful — create one tracker per session.
 */
export class SessionTracker {
  private records: SessionStageRecord[] = []
  private techniques: Set<PromptTechnique> = new Set()

  /** Record a single turn from the session */
  record({ intent, userMessage, response, technique }: RecordTurnInput): void {
    this.techniques.add(technique)

    this.records.push({
      intent,
      userMessage,
      assistantReply: response.reply,
      distortion: response.distortion,
      nextIntent: response.nextIntent,
      timestamp: Date.now(),
    })
  }

  /** Get all recorded stage snapshots (immutable copy) */
  getRecords(): readonly SessionStageRecord[] {
    return [...this.records]
  }

  /** Get the technique(s) used during the session */
  getTechnique(): PromptTechnique | 'mixed' {
    if (this.techniques.size === 1) {
      return [...this.techniques][0]!
    }
    return this.techniques.size === 0 ? 'default' : 'mixed'
  }

  /** Number of turns recorded so far */
  get turnCount(): number {
    return this.records.length
  }

  /** Reset the tracker for a new session */
  reset(): void {
    this.records = []
    this.techniques.clear()
  }
}
