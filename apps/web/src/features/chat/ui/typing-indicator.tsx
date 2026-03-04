'use client'

import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TypingIndicatorProps = ComponentProps<'div'>
export function TypingIndicator({ className, ...props }: TypingIndicatorProps) {
  return (
    <div
      role="status"
      aria-label="Typing..."
      className={cn('inline-flex items-center text-sm align-middle leading-none', className)}
      {...props}
    >
      <span className="sr-only">Typing...</span>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className={`
            inline-block
            bg-current/50
            mx-[0.1em]
            rounded-full
            w-[0.4em] h-[0.4em]
            animate-[bouncing_0.6s_infinite_alternate_both]
          `}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      <style>{`
        @keyframes bouncing {
          to {
            opacity: 0.1;
            transform: translateY(-0.2em);
          }
        }
      `}</style>
    </div>
  )
}
