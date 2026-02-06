/**
 * SessionSummaryGenerator Service
 *
 * Takes the raw stage records collected by SessionTracker and produces
 * a complete SessionSummary — including mood delta, distortion profile,
 * intent funnel, a Mermaid flowchart, and a plain-text clinician summary.
 *
 * This is a pure, stateless transformer: records in, summary out.
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
} from './types'

/** Stateless generator that transforms session records into a typed summary */
export class SessionSummaryGenerator {

  /** Generate a complete session summary from recorded stage data */
  generate(
    records: readonly SessionStageRecord[],
    technique: PromptTechnique | 'mixed',
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

    const moodDelta = this.computeMoodDelta(stages)
    const distortionProfile = this.computeDistortionProfile(stages)
    const intentFunnel = this.computeIntentFunnel(stages)
    const mermaidChart = this.buildMermaidChart(stages, moodDelta)
    const textSummary = this.buildTextSummary(stages, moodDelta, distortionProfile, completedFullCycle)

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
      moodDelta,
      distortionProfile,
      intentFunnel,
      mermaidChart,
      textSummary,
    }
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
    // Match patterns like "80", "80/100", "80 out of 100", "around 80"
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

  private buildMermaidChart(stages: SessionStageRecord[], moodDelta: MoodDelta | null): string {
    const lines: string[] = ['graph LR']

    // Define nodes for visited intents
    const visitedIntents = new Map<Intent, SessionStageRecord>()
    for (const stage of stages) {
      // Keep the first record per intent (primary visit)
      if (!visitedIntents.has(stage.intent)) {
        visitedIntents.set(stage.intent, stage)
      }
    }

    // Build node definitions with data
    for (const [intent, stage] of visitedIntents) {
      const label = INTENT_LABELS[intent]
      const snippet = this.truncate(stage.userMessage, 40)
      const distortionTag = stage.distortion && stage.distortion.distortion !== 'none'
        ? `<br/><i>${stage.distortion.distortion} ${Math.round(stage.distortion.confidence * 100)}%</i>`
        : ''

      // Add mood score annotation for I3 and I7
      let moodTag = ''
      if (intent === 'I3' && moodDelta && moodDelta.preScore !== null) {
        moodTag = `<br/><b>Mood: ${moodDelta.preScore}/100</b>`
      } else if (intent === 'I7' && moodDelta && moodDelta.postScore !== null) {
        moodTag = `<br/><b>Mood: ${moodDelta.postScore}/100</b>`
      }

      lines.push(`  ${intent}["<b>${label}</b><br/>${snippet}${moodTag}${distortionTag}"]`)
    }

    // Build edges in visit order
    const intentOrder = [...visitedIntents.keys()]
    for (let i = 0; i < intentOrder.length - 1; i++) {
      lines.push(`  ${intentOrder[i]} --> ${intentOrder[i + 1]}`)
    }

    // Add mood delta annotation if both scores exist
    if (moodDelta && moodDelta.delta !== null && moodDelta.preScore !== null && moodDelta.postScore !== null) {
      const direction = moodDelta.delta < 0 ? 'decreased' : moodDelta.delta > 0 ? 'increased' : 'unchanged'
      lines.push(`  I7 -. "Mood ${direction} by ${Math.abs(moodDelta.delta)}" .-> I3`)
    }

    // Style nodes
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
    stages: SessionStageRecord[],
    moodDelta: MoodDelta | null,
    distortionProfile: DistortionProfile[],
    completedFullCycle: boolean,
  ): string {
    const lines: string[] = []

    lines.push('SESSION SUMMARY')
    lines.push('===============')
    lines.push('')

    // Stage-by-stage recap
    const stagesByIntent = new Map<Intent, SessionStageRecord>()
    for (const s of stages) {
      if (!stagesByIntent.has(s.intent)) stagesByIntent.set(s.intent, s)
    }

    const i1 = stagesByIntent.get('I1')
    const i2 = stagesByIntent.get('I2')
    const i4 = stagesByIntent.get('I4')
    const i5 = stagesByIntent.get('I5')
    const i6 = stagesByIntent.get('I6')
    const i8 = stagesByIntent.get('I8')

    if (i1) lines.push(`Situation:          ${i1.userMessage}`)
    if (i2) lines.push(`Automatic Thought:  ${i2.userMessage}`)

    if (moodDelta) {
      lines.push(`Initial Mood:       ${moodDelta.preText}${moodDelta.preScore !== null ? ` (${moodDelta.preScore}/100)` : ''}`)
    }

    if (i4) lines.push(`Evidence For:       ${i4.userMessage}`)
    if (i5) lines.push(`Evidence Against:   ${i5.userMessage}`)
    if (i6) lines.push(`Alternative Thought: ${i6.userMessage}`)

    if (moodDelta?.postText) {
      lines.push(`Re-rated Mood:      ${moodDelta.postText}${moodDelta.postScore !== null ? ` (${moodDelta.postScore}/100)` : ''}`)
    }

    if (moodDelta && moodDelta.delta !== null) {
      const direction = moodDelta.delta < 0 ? 'decreased' : moodDelta.delta > 0 ? 'increased' : 'unchanged'
      lines.push(`Mood Change:        ${direction} by ${Math.abs(moodDelta.delta)} points`)
    }

    if (i8) lines.push(`Coping Strategy:    ${i8.userMessage}`)

    lines.push('')

    // Distortions detected
    if (distortionProfile.length > 0) {
      lines.push('Cognitive Distortions Detected:')
      for (const d of distortionProfile) {
        lines.push(`  - ${d.distortion} (${d.count}x, avg confidence ${Math.round(d.averageConfidence * 100)}%)`)
      }
      lines.push('')
    }

    // Completion status
    lines.push(`Session Status:     ${completedFullCycle ? 'Completed full CBT cycle (I1-I8)' : 'Partial session'}`)
    lines.push(`Total Turns:        ${stages.length}`)

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
