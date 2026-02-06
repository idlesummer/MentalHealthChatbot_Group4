/**
 * SessionSummaryGenerator Service
 *
 * Takes the raw stage records collected by SessionTracker and produces
 * a complete SessionSummary — including mood delta, distortion profile,
 * intent funnel, a Mermaid flowchart, and a plain-text clinician summary.
 *
 * This is a pure, stateless transformer: records in, summary out.
 *
 * When `stageSummaries` are provided (e.g. LLM-generated), they replace
 * the raw user messages in the Mermaid chart and text summary, producing
 * cleaner clinician-facing output.
 */

import { INTENTS } from '../intent-manager/intents'
import { INTENT_LABELS } from './types'
import type { PromptTechnique } from '@/prompts'
import type { Intent } from '../intent-manager'
import type {
  DistortionProfile,
  IntentFunnel,
  MoodDelta,
  SessionStageRecord,
  SessionSummary,
  StageSummaries,
} from './types'

/** Options for summary generation */
export interface GenerateOptions {
  /** Per-intent summaries to use instead of raw user messages.
   *  When provided, these override in the Mermaid chart and text summary. */
  stageSummaries?: StageSummaries
}

/** Stateless generator that transforms session records into a typed summary */
export class SessionSummaryGenerator {

  /** Generate a complete session summary from recorded stage data */
  generate(
    records: readonly SessionStageRecord[],
    technique: PromptTechnique | 'mixed',
    options?: GenerateOptions,
  ): SessionSummary {
    const stages = [...records]
    const totalTurns = stages.length

    if (totalTurns === 0) {
      return this.emptySummary(technique)
    }

    const startTime = stages[0]!.timestamp
    const endTime = stages[totalTurns - 1]!.timestamp
    const finalIntent = stages[totalTurns - 1]!.nextIntent
    const completedFullCycle = this.didCompleteCycle(stages)

    // Build the per-intent summary map: LLM overrides > raw user messages
    const rawSummaries = this.buildRawStageSummaries(stages)
    const stageSummaries: StageSummaries = { ...rawSummaries, ...options?.stageSummaries }

    const moodDelta = this.computeMoodDelta(stages)
    const distortionProfile = this.computeDistortionProfile(stages)
    const intentFunnel = this.computeIntentFunnel(stages)
    const mermaidChart = this.buildMermaidChart(stages, moodDelta, stageSummaries)
    const textSummary = this.buildTextSummary(stageSummaries, moodDelta, distortionProfile, completedFullCycle, totalTurns)

    return {
      metadata: {
        totalTurns,
        startTime,
        endTime,
        durationMs: endTime - startTime,
        completedFullCycle,
        technique,
        finalIntent,
      },
      stages,
      stageSummaries,
      moodDelta,
      distortionProfile,
      intentFunnel,
      mermaidChart,
      textSummary,
    }
  }

  // ---------------------------------------------------------------------------
  // Stage Summaries (raw baseline)
  // ---------------------------------------------------------------------------

  /** Build a map of intent -> raw user message (first visit per intent) */
  private buildRawStageSummaries(stages: SessionStageRecord[]): StageSummaries {
    const summaries: StageSummaries = {}
    for (const stage of stages) {
      if (!summaries[stage.intent]) {
        summaries[stage.intent] = stage.userMessage
      }
    }
    return summaries
  }

  // ---------------------------------------------------------------------------
  // Mood Delta
  // ---------------------------------------------------------------------------

  private computeMoodDelta(stages: SessionStageRecord[]): MoodDelta | null {
    const i3 = stages.find(s => s.intent === 'I3')
    const i7 = stages.find(s => s.intent === 'I7')

    if (!i3) return null

    const preText = i3.userMessage
    const postText = i7?.userMessage ?? ''
    const preScore = this.extractMoodScore(preText)
    const postScore = i7 ? this.extractMoodScore(postText) : null
    const delta = preScore !== null && postScore !== null ? postScore - preScore : null

    return { preText, postText, preScore, postScore, delta }
  }

  /** Extract a numeric mood score from free-text user input */
  private extractMoodScore(text: string): number | null {
    const patterns = [
      /(\d{1,3})\s*(?:\/|out of)\s*100/i,
      /(?:about|around|maybe|roughly|approximately)\s*(\d{1,3})/i,
      /(?:rate|rating|score).*?(\d{1,3})/i,
      /(\d{1,3})\s*(?:percent|%)/i,
      /\b(\d{1,3})\b/,
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match?.[1]) {
        const score = parseInt(match[1], 10)
        if (score >= 0 && score <= 100) return score
      }
    }

    return null
  }

  // ---------------------------------------------------------------------------
  // Distortion Profile
  // ---------------------------------------------------------------------------

  private computeDistortionProfile(stages: SessionStageRecord[]): DistortionProfile[] {
    const buckets = new Map<string, { count: number; totalConfidence: number }>()

    for (const stage of stages) {
      if (!stage.distortion || stage.distortion.distortion === 'none') continue

      const name = stage.distortion.distortion
      const existing = buckets.get(name)

      if (existing) {
        existing.count++
        existing.totalConfidence += stage.distortion.confidence
      } else {
        buckets.set(name, { count: 1, totalConfidence: stage.distortion.confidence })
      }
    }

    return [...buckets.entries()]
      .map(([distortion, { count, totalConfidence }]) => ({
        distortion,
        count,
        averageConfidence: totalConfidence / count,
      }))
      .sort((a, b) => b.count - a.count || b.averageConfidence - a.averageConfidence)
  }

  // ---------------------------------------------------------------------------
  // Intent Funnel
  // ---------------------------------------------------------------------------

  private computeIntentFunnel(stages: SessionStageRecord[]): IntentFunnel[] {
    const visitedIntents = new Set(stages.map(s => s.intent))

    return INTENTS.map(intent => {
      const turnsAtIntent = stages.filter(s => s.intent === intent).length
      return {
        intent,
        label: INTENT_LABELS[intent],
        turns: turnsAtIntent,
        completed: visitedIntents.has(intent) && turnsAtIntent > 0,
      }
    })
  }

  // ---------------------------------------------------------------------------
  // Mermaid Flowchart
  // ---------------------------------------------------------------------------

  private buildMermaidChart(
    stages: SessionStageRecord[],
    moodDelta: MoodDelta | null,
    stageSummaries: StageSummaries,
  ): string {
    const lines: string[] = ['graph LR']

    const visitedIntents = new Map<Intent, SessionStageRecord>()
    for (const stage of stages) {
      if (!visitedIntents.has(stage.intent)) {
        visitedIntents.set(stage.intent, stage)
      }
    }

    for (const [intent, stage] of visitedIntents) {
      const label = INTENT_LABELS[intent]
      const snippet = this.truncate(stageSummaries[intent] ?? stage.userMessage, 40)
      const distortionTag = stage.distortion && stage.distortion.distortion !== 'none'
        ? `<br/><i>${stage.distortion.distortion} ${Math.round(stage.distortion.confidence * 100)}%</i>`
        : ''

      let moodTag = ''
      if (intent === 'I3' && moodDelta && moodDelta.preScore !== null) {
        moodTag = `<br/><b>Mood: ${moodDelta.preScore}/100</b>`
      } else if (intent === 'I7' && moodDelta && moodDelta.postScore !== null) {
        moodTag = `<br/><b>Mood: ${moodDelta.postScore}/100</b>`
      }

      lines.push(`  ${intent}["<b>${label}</b><br/>${snippet}${moodTag}${distortionTag}"]`)
    }

    const intentOrder = [...visitedIntents.keys()]
    for (let i = 0; i < intentOrder.length - 1; i++) {
      lines.push(`  ${intentOrder[i]} --> ${intentOrder[i + 1]}`)
    }

    if (moodDelta && moodDelta.delta !== null && moodDelta.preScore !== null && moodDelta.postScore !== null) {
      const direction = moodDelta.delta < 0 ? 'decreased' : moodDelta.delta > 0 ? 'increased' : 'unchanged'
      lines.push(`  I7 -. "Mood ${direction} by ${Math.abs(moodDelta.delta)}" .-> I3`)
    }

    lines.push('')
    lines.push('  %% Styling')
    for (const intent of intentOrder) {
      if (intent === 'I3' || intent === 'I7') {
        lines.push(`  style ${intent} fill:#fef3c7,stroke:#f59e0b,stroke-width:2px`)
      } else if (intent === 'I8') {
        lines.push(`  style ${intent} fill:#d1fae5,stroke:#10b981,stroke-width:2px`)
      }
    }

    return lines.join('\n')
  }

  // ---------------------------------------------------------------------------
  // Text Summary (for clinician review)
  // ---------------------------------------------------------------------------

  private buildTextSummary(
    stageSummaries: StageSummaries,
    moodDelta: MoodDelta | null,
    distortionProfile: DistortionProfile[],
    completedFullCycle: boolean,
    totalTurns: number,
  ): string {
    const lines: string[] = []

    lines.push('SESSION SUMMARY')
    lines.push('===============')
    lines.push('')

    if (stageSummaries.I1) lines.push(`Situation:           ${stageSummaries.I1}`)
    if (stageSummaries.I2) lines.push(`Automatic Thought:   ${stageSummaries.I2}`)

    if (moodDelta) {
      lines.push(`Initial Mood:        ${stageSummaries.I3 ?? moodDelta.preText}${moodDelta.preScore !== null ? ` (${moodDelta.preScore}/100)` : ''}`)
    }

    if (stageSummaries.I4) lines.push(`Evidence For:        ${stageSummaries.I4}`)
    if (stageSummaries.I5) lines.push(`Evidence Against:    ${stageSummaries.I5}`)
    if (stageSummaries.I6) lines.push(`Alternative Thought: ${stageSummaries.I6}`)

    if (moodDelta?.postText) {
      lines.push(`Re-rated Mood:       ${stageSummaries.I7 ?? moodDelta.postText}${moodDelta.postScore !== null ? ` (${moodDelta.postScore}/100)` : ''}`)
    }

    if (moodDelta && moodDelta.delta !== null) {
      const direction = moodDelta.delta < 0 ? 'decreased' : moodDelta.delta > 0 ? 'increased' : 'unchanged'
      lines.push(`Mood Change:         ${direction} by ${Math.abs(moodDelta.delta)} points`)
    }

    if (stageSummaries.I8) lines.push(`Coping Strategy:     ${stageSummaries.I8}`)

    lines.push('')

    if (distortionProfile.length > 0) {
      lines.push('Cognitive Distortions Detected:')
      for (const d of distortionProfile) {
        lines.push(`  - ${d.distortion} (${d.count}x, avg confidence ${Math.round(d.averageConfidence * 100)}%)`)
      }
      lines.push('')
    }

    lines.push(`Session Status:      ${completedFullCycle ? 'Completed full CBT cycle (I1-I8)' : 'Partial session'}`)
    lines.push(`Total Turns:         ${totalTurns}`)

    return lines.join('\n')
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private didCompleteCycle(stages: SessionStageRecord[]): boolean {
    const visited = new Set(stages.map(s => s.intent))
    return INTENTS.every(intent => visited.has(intent))
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
  }

  private emptySummary(technique: PromptTechnique | 'mixed'): SessionSummary {
    return {
      metadata: {
        totalTurns: 0,
        startTime: 0,
        endTime: 0,
        durationMs: 0,
        completedFullCycle: false,
        technique,
        finalIntent: 'I1',
      },
      stages: [],
      stageSummaries: {},
      moodDelta: null,
      distortionProfile: [],
      intentFunnel: INTENTS.map(intent => ({
        intent,
        label: INTENT_LABELS[intent],
        turns: 0,
        completed: false,
      })),
      mermaidChart: 'graph LR\n  empty["No session data"]',
      textSummary: 'No session data recorded.',
    }
  }
}
