import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type MessageContentProps = ComponentProps<'div'>
export function MessageContent({ className, ...props }: MessageContentProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5',
        'group-data-[row-variant=sender]/row:items-end',
        className,
      )}
      {...props}
    />
  )
}

export type BubbleGroupProps = ComponentProps<'div'>
export function BubbleGroup({ className, ...props }: BubbleGroupProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        'group-data-[row-variant=sender]/row:items-end',
        className,
      )}
      {...props}
    />
  )
}
