'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MermaidChart } from '@/components/mermaid-chart'
import { cn } from '@/lib/utils'
import type { SessionSummary, Intent, MoodDelta as MoodDeltaType, DistortionProfile as DistortionProfileType, IntentFunnel as IntentFunnelType } from '@rainev/cogni'

const INTENT_LABELS: Record<Intent, string> = {
  I1: 'Situation',
  I2: 'Automatic Thought',
  I3: 'Mood Rating',
  I4: 'Evidence For',
  I5: 'Evidence Against',
  I6: 'Alternative Thought',
  I7: 'Mood Re-rating',
  I8: 'Coping Strategy',
}

const INTENT_ORDER: Intent[] = ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8']

// =============================================================================
// Main Panel
// =============================================================================

export function SessionSummaryPanel({ summary }: { summary: SessionSummary }) {
  return (
    <div className="space-y-4">
      <SessionStatusBar
        totalTurns={summary.metadata.totalTurns}
        completedFullCycle={summary.metadata.completedFullCycle}
        finalIntent={summary.metadata.finalIntent}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MoodDeltaCard moodDelta={summary.moodDelta} />
        <DistortionProfileCard distortionProfile={summary.distortionProfile} />
      </div>
      <IntentTransitionSpeedCard intentFunnel={summary.intentFunnel} />
      <FlowchartCard mermaidChart={summary.mermaidChart} />
      <StageSummariesCard stageSummaries={summary.stageSummaries} />
    </div>
  )
}

// =============================================================================
// Session Status (slim top bar)
// =============================================================================

function SessionStatusBar({
  totalTurns,
  completedFullCycle,
  finalIntent,
}: {
  totalTurns: number
  completedFullCycle: boolean
  finalIntent: Intent
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
      <span>{totalTurns} turn{totalTurns !== 1 ? 's' : ''}</span>
      <span>&middot;</span>
      <span>Current: <strong className="text-foreground">{INTENT_LABELS[finalIntent]}</strong></span>
      <span>&middot;</span>
      <span className={completedFullCycle ? 'text-green-600 font-medium' : ''}>
        {completedFullCycle ? 'Full cycle complete' : 'In progress'}
      </span>
    </div>
  )
}

// =============================================================================
// Mood Delta
// =============================================================================

function MoodDeltaCard({ moodDelta }: { moodDelta: MoodDeltaType | null }) {
  if (!moodDelta) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Mood Delta</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No mood data recorded.</p></CardContent>
      </Card>
    )
  }

  const { preScore, postScore, delta } = moodDelta
  const hasScores = preScore !== null && postScore !== null && delta !== null
  const improved = delta !== null && delta < 0

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Mood Delta</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {hasScores ? (
          <>
            <div className="space-y-2">
              <MoodBar label="Before (I3)" score={preScore} color="bg-amber-400" />
              <MoodBar label="After (I7)" score={postScore} color={improved ? 'bg-green-500' : 'bg-red-400'} />
            </div>

            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                improved
                  ? 'bg-green-100 text-green-800'
                  : delta === 0
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-800',
              )}>
                {improved ? '\u2193' : delta === 0 ? '\u2192' : '\u2191'} {Math.abs(delta)} points
              </span>
              <span className="text-xs text-muted-foreground">
                {improved ? 'Improvement' : delta === 0 ? 'No change' : 'Increase'}
              </span>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Before:</strong> {moodDelta.preText}</p>
            {moodDelta.postText && <p><strong>After:</strong> {moodDelta.postText}</p>}
            <p className="text-xs italic">Scores could not be extracted numerically.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MoodBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

// =============================================================================
// Distortion Profile
// =============================================================================

function DistortionProfileCard({ distortionProfile }: { distortionProfile: DistortionProfileType[] }) {
  if (distortionProfile.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Cognitive Distortions</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No distortions detected.</p></CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...distortionProfile.map(d => d.count))

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Cognitive Distortions</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {distortionProfile.map(d => (
          <div key={d.distortion} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium capitalize">{d.distortion}</span>
              <span className="text-muted-foreground">
                {d.count}x &middot; {Math.round(d.averageConfidence * 100)}% conf
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${(d.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Intent Transition Speed
// =============================================================================

function IntentTransitionSpeedCard({ intentFunnel }: { intentFunnel: IntentFunnelType[] }) {
  const visited = intentFunnel.filter(f => f.completed)
  const avgTurns = visited.length > 0
    ? visited.reduce((sum, f) => sum + f.turns, 0) / visited.length
    : null
  const maxTurns = Math.max(...intentFunnel.map(f => f.turns), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Intent Transition Speed</CardTitle>
          {avgTurns !== null && (
            <span className="text-xs text-muted-foreground">
              avg <strong className="text-foreground">{avgTurns.toFixed(1)}</strong> turns/stage
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {intentFunnel.map(f => (
          <div key={f.intent} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className={cn('font-medium', !f.completed && 'text-muted-foreground')}>
                {f.label}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {f.completed ? `${f.turns} turn${f.turns !== 1 ? 's' : ''}` : '—'}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              {f.completed && (
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${(f.turns / maxTurns) * 100}%` }}
                />
              )}
            </div>
          </div>
        ))}
        {visited.length === 0 && (
          <p className="text-sm text-muted-foreground">No stages completed yet.</p>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Flowchart (Mermaid)
// =============================================================================

function FlowchartCard({ mermaidChart }: { mermaidChart: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">CBT Session Flowchart</CardTitle></CardHeader>
      <CardContent>
        <MermaidChart chart={mermaidChart} />
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Stage Summaries (LLM-generated clinical notes)
// =============================================================================

function StageSummariesCard({ stageSummaries }: { stageSummaries: Partial<Record<Intent, string>> }) {
  const entries = INTENT_ORDER
    .filter(intent => stageSummaries[intent])
    .map(intent => ({ intent, label: INTENT_LABELS[intent], text: stageSummaries[intent]! }))

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Stage Notes</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No stage data available.</p></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Stage Notes</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {entries.map(({ intent, label, text }) => (
          <div key={intent} className="flex gap-3 items-start">
            <span className={cn(
              'shrink-0 mt-0.5 inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold',
              intent === 'I3' || intent === 'I7'
                ? 'bg-amber-100 text-amber-800'
                : intent === 'I8'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-muted text-muted-foreground',
            )}>
              {intent}
            </span>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
              <p className="text-sm leading-snug">{text}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
