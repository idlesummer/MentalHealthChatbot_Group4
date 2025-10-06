'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownIcon } from 'lucide-react'
import { Greeting } from '@/components/greeting'

export function Messages({
  messages,
}: {
  messages: { role: 'user' | 'assistant'; text: string }[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isAtBottom])

  // Track scroll position
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 100
      setIsAtBottom(nearBottom)
    }

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className="overscroll-behavior-contain flex-1 overflow-y-auto scroll-smooth bg-background"
    >
      <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 p-4">
        {messages.length === 0 && <Greeting />}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${
              msg.role === 'user'
                ? 'text-right text-blue-600'
                : 'text-left text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <div
              className={`inline-block rounded-lg px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-muted dark:bg-zinc-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={endRef} />
      </div>

      {!isAtBottom && (
        <button
          onClick={() => {
            endRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full border bg-background p-2 shadow-md hover:bg-muted"
        >
          <ArrowDownIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
