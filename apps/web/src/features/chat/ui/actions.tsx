import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type BubbleActionsProps = ComponentProps<'div'> & {
  visible?: boolean
}

export function BubbleActions({ className, visible, ...props }: BubbleActionsProps) {
  return (
    <div
      className={cn(
        'group-hover/bubble:opacity-100 transition-opacity',
        'pointer-events-none group-hover/bubble:pointer-events-auto',
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0',
        className,
      )}
      {...props}
    />
  )
}
