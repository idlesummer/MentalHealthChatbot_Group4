import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Markdown } from './markdown'
import { TypingIndicator } from './typing-indicator'

export type BubbleTextProps = ComponentProps<'div'> & {
  typing?: boolean
}

export function BubbleText({ typing, className, ...props }: BubbleTextProps) {
  return (
    <div
      data-slot="message"
      className={cn(
        'shadow-2xs px-3 py-2 rounded-xl w-fit max-w-2xl text-md wrap-break-word leading-tight whitespace-pre-wrap',
        'group-data-[row-variant=receiver]/row:bg-muted',
        'group-data-[row-variant=receiver]/row:text-foreground',
        'group-data-[row-variant=receiver]/row:rounded-r-2xl',
        'group-data-[row-variant=sender]/row:bg-primary',
        'group-data-[row-variant=sender]/row:text-primary-foreground',
        'group-data-[row-variant=sender]/row:rounded-l-2xl',
        className,
      )}
      {...props}
    >
      {typing
        ? <TypingIndicator />
        : <Markdown>{props.children ?? '\u200B'}</Markdown>}
    </div>
  )
}
