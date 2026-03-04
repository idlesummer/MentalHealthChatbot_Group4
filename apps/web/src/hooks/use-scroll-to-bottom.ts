'use client'

import { useEffect, useRef } from 'react'

export function useScrollToBottom(deps?: unknown[]) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parent = ref.current?.parentElement
    if (parent) {
      parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
