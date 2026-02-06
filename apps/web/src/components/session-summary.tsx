'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MermaidChart } from '@/components/mermaid-chart'
import { cn } from '@/lib/utils'
import type { SessionSummary } from '@rainev/cogni'

// =============================================================================
// Main Panel
// =============================================================================

export function SessionSummaryPanel({ summary }: { summary: SessionSummary }) {
  return (
    <div className="space-y-4">
      <MetadataBar summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MoodDeltaCard summary={summary} />
        <DistortionProfileCard summary={summary} />
      </div>
      <FlowchartCard summary={summary} />
      <IntentFunnelCard summary={summary} />
      <ClinicalSummaryCard summary={summary} />
    </div>
  )
}

// =============================================================================
// Metadata Bar
// =============================================================================

function MetadataBar({ summary }: { summary: SessionSummary }) {
  const { metadata } = summary
  const durationSec = (metadata.durationMs / 1000).toFixed(0)

  return (
    <Card className="py-3">
      <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <Stat label="Turns" value={String(metadata.totalTurns)} />
        <Separator orientation="vertical" className="h-4" />
        <Stat label="Duration" value={`${durationSec}s`} />
        <Separator orientation="vertical" className="h-4" />
        <Stat label="Technique" value={metadata.technique} />
        <Separator orientation="vertical" className="h-4" />
        <Stat
          label="Full Cycle"
          value={metadata.completedFullCycle ? 'Yes' : 'No'}
          className={metadata.completedFullCycle ? 'text-green-600' : 'text-amber-600'}
        />
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn('font-semibold', className)}>{value}</span>
    </div>
  )
}

// =============================================================================
// Mood Delta
// =============================================================================

function MoodDeltaCard({ summary }: { summary: SessionSummary }) {
  const { moodDelta } = summary
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
            {/* Bars */}
            <div className="space-y-2">
              <MoodBar label="Before (I3)" score={preScore} color="bg-amber-400" />
              <MoodBar label="After (I7)" score={postScore} color={improved ? 'bg-green-500' : 'bg-red-400'} />
            </div>

            {/* Delta badge */}
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

function DistortionProfileCard({ summary }: { summary: SessionSummary }) {
  const { distortionProfile } = summary

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
// Flowchart (Mermaid)
// =============================================================================

function FlowchartCard({ summary }: { summary: SessionSummary }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">CBT Session Flowchart</CardTitle></CardHeader>
      <CardContent>
        <MermaidChart chart={summary.mermaidChart} />
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Intent Funnel
// =============================================================================

function IntentFunnelCard({ summary }: { summary: SessionSummary }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Intent Funnel</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-1">
          {summary.intentFunnel.map((step, i) => (
            <div key={step.intent} className="flex items-center gap-1">
              <div
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border px-3 py-2 text-center transition-colors',
                  step.completed
                    ? 'border-green-300 bg-green-50 text-green-800'
                    : 'border-dashed border-gray-300 bg-gray-50 text-gray-400',
                )}
              >
                <span className="text-[10px] font-bold">{step.intent}</span>
                <span className="text-[9px] leading-tight">{step.label}</span>
                {step.turns > 0 && (
                  <span className="mt-0.5 text-[9px] text-muted-foreground">{step.turns}t</span>
                )}
              </div>
              {i < summary.intentFunnel.length - 1 && (
                <span className={cn(
                  'text-xs',
                  step.completed ? 'text-green-400' : 'text-gray-300',
                )}>{'\u2192'}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Clinical Text Summary
// =============================================================================

function ClinicalSummaryCard({ summary }: { summary: SessionSummary }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Clinician Summary</CardTitle></CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono bg-muted rounded-lg p-4">
          {summary.textSummary}
        </pre>
      </CardContent>
    </Card>
  )
}
