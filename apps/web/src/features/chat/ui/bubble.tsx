import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type BubbleProps = ComponentProps<'div'>
export function Bubble({ className, ...props }: BubbleProps) {
  return (
    <div
      className={cn(
        'group/bubble flex items-center gap-2',
        'group-data-[row-variant=sender]/row:flex-row-reverse',
        'first:*:data-[slot=message]:group-data-[row-variant=receiver]/row:rounded-tl-2xl',
        'first:*:data-[slot=message]:group-data-[row-variant=sender]/row:rounded-tr-2xl',
        'last:*:data-[slot=message]:group-data-[row-variant=receiver]/row:rounded-bl-sm',
        'last:*:data-[slot=message]:group-data-[row-variant=sender]/row:rounded-br-sm',
        className,
      )}
      {...props}
    />
  )
}
