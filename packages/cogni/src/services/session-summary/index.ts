/**
 * Session Summary Module
 *
 * Exports the session tracking and summary generation services.
 */

export { SessionTracker } from './tracker'
export { SessionSummaryGenerator } from './generator'

export type { RecordTurnInput } from './tracker'
export type {
  SessionSummary,
  SessionStageRecord,
  MoodDelta,
  DistortionProfile,
  IntentFunnel,
} from './types'
export { INTENT_LABELS } from './types'
