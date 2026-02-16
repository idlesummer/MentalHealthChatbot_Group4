/**
 * Client-side session summary computation.
 *
 * Uses the Cogni SessionSummaryGenerator (pure, no LLM) to produce
 * an instant summary from session records. This lets the summary panel
 * update dynamically after every message without a server round-trip.
 */

import { SessionSummaryGenerator } from '@rainev/cogni'
import type { SessionStageRecord, PromptTechnique, SessionSummary } from '@rainev/cogni'

const generator = new SessionSummaryGenerator()

export function computeSummaryLocally(
  records: SessionStageRecord[],
  technique: PromptTechnique | 'mixed',
): SessionSummary {
  return generator.generate(records, technique)
}
