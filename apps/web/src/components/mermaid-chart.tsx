'use client'

import { useEffect, useRef, useState } from 'react'

interface MermaidChartProps {
  chart: string
}

export function MermaidChart({ chart }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      if (!containerRef.current) return

      try {
        // Dynamic import to avoid SSR issues
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
          securityLevel: 'loose',
        })

        const id = `mermaid-${Date.now()}`
        const { svg } = await mermaid.render(id, chart)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render chart')
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Could not render flowchart</p>
        <pre className="whitespace-pre-wrap text-xs">{chart}</pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full"
    />
  )
}
