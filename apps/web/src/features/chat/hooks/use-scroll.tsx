import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export function useScroll() {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [isScrollReady, setIsScrollReady] = useState(false)

  const containerRef = useCallback((element: HTMLDivElement | null) => {
    elementRef.current = element
    if (!element) return
    setIsScrollReady(true)
  }, [])

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element) return
    element.scrollTop = element.scrollHeight
  }, [])

  const handleScroll = () => {
    if (!elementRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = elementRef.current
    setIsAtBottom(scrollHeight - scrollTop - clientHeight <= 10)
  }

  const scrollToBottom = () => {
    elementRef.current?.scrollTo({
      top: elementRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }

  return {
    isAtBottom,
    isScrollReady,
    containerRef,
    handleScroll,
    scrollToBottom,
  }
}
