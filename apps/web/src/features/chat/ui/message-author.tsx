import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type MessageAuthorProps = ComponentProps<'span'>

export function MessageAuthor({ className, ...props }: MessageAuthorProps) {
  return (
    <span
      className={cn('px-3 font-light text-muted-foreground text-xs select-none', className)}
      {...props}
    />
  )
}
