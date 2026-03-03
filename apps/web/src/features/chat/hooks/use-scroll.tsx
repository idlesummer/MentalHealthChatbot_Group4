import { useLayoutEffect, useRef, useState } from 'react'

export function useScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [isScrollReady, setIsScrollReady] = useState(false)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return
    element.scrollTop = element.scrollHeight
    setIsScrollReady(true)
  }, [])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setIsAtBottom(scrollHeight - scrollTop - clientHeight <= 10)
  }

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
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
