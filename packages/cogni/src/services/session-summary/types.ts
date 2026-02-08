/**
 * Session Summary Types
 *
 * Type definitions for the session summary service.
 * These types represent structured data captured during a CBT session,
 * enabling therapist-facing analytics, flowchart generation, and reporting.
 */

import type { CognitiveDistortionClassification } from '../distortion-classifier'
import type { Intent } from '../intent-manager'
import type { PromptTechnique } from '@/prompts'

/** Human-readable names for each CBT intent stage */
export const INTENT_LABELS: Record<Intent, string> = {
  I1: 'Situation',
  I2: 'Automatic Thought',
  I3: 'Mood Rating',
  I4: 'Evidence For',
  I5: 'Evidence Against',
  I6: 'Alternative Thought',
  I7: 'Mood Re-rating',
  I8: 'Coping Strategy',
} as const

/** A single recorded turn within a CBT session */
export interface SessionStageRecord {
  /** Which CBT intent this turn was on */
  intent: Intent
  /** The user's message for this stage */
  userMessage: string
  /** The assistant's response */
  assistantReply: string
  /** Cognitive distortion detected on this turn (if any) */
  distortion: CognitiveDistortionClassification | undefined
  /** Which intent the engine transitioned to after this turn */
  nextIntent: Intent
  /** Timestamp when this turn was recorded */
  timestamp: number
}

/** Mood comparison between initial rating (I3) and re-rating (I7) */
export interface MoodDelta {
  /** Raw text the user provided at I3 */
  preText: string
  /** Raw text the user provided at I7 */
  postText: string
  /** Numeric mood score extracted from I3 (null if not parseable) */
  preScore: number | null
  /** Numeric mood score extracted from I7 (null if not parseable) */
  postScore: number | null
  /** Numeric change (postScore - preScore), null if either score missing */
  delta: number | null
}

/** Aggregated distortion frequency across the session */
export interface DistortionProfile {
  /** Distortion name */
  distortion: string
  /** Number of turns where this distortion was detected */
  count: number
  /** Average confidence across all detections of this distortion */
  averageConfidence: number
}

/** Intent funnel showing how many turns were spent at each stage */
export interface IntentFunnel {
  intent: Intent
  label: string
  turns: number
  completed: boolean
}

/**
 * LLM-summarized (or raw) text for each intent stage.
 * Keys are intent IDs (I1-I8), values are concise clinical summaries.
 */
export type StageSummaries = Partial<Record<Intent, string>>

/** The complete session summary produced by SessionSummaryGenerator */
export interface SessionSummary {
  /** Session-level metadata */
  metadata: {
    /** Total number of turns in the session */
    totalTurns: number
    /** Timestamp of the first recorded turn */
    startTime: number
    /** Timestamp of the last recorded turn */
    endTime: number
    /** Duration in milliseconds */
    durationMs: number
    /** Whether the session completed a full I1-I8 cycle */
    completedFullCycle: boolean
    /** The prompt technique used (from the first turn, or mixed) */
    technique: PromptTechnique | 'mixed'
    /** Which intent the session ended on */
    finalIntent: Intent
  }

  /** Ordered list of every stage recorded */
  stages: SessionStageRecord[]

  /** Per-intent summaries — LLM-generated if available, raw user messages otherwise */
  stageSummaries: StageSummaries

  /** Mood comparison between I3 and I7 */
  moodDelta: MoodDelta | null

  /** Distortion frequency distribution across the session */
  distortionProfile: DistortionProfile[]

  /** Intent funnel: how many turns spent at each stage */
  intentFunnel: IntentFunnel[]

  /** Mermaid flowchart string for visual rendering */
  mermaidChart: string

  /** Plain-text clinician summary */
  textSummary: string
}
