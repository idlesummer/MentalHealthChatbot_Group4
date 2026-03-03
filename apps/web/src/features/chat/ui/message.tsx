import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type MessageVariant = 'receiver' | 'sender'
export type MessageAlign = 'top' | 'bottom'

export type MessageProps = ComponentProps<'div'> & {
  variant?: MessageVariant
  align?: MessageAlign
}

export function Message({ variant='receiver', align='bottom', className, ...props }: MessageProps) {
  return (
    <div
      data-row-variant={variant}
      data-row-align={align}
      className={cn(
        'group/row flex gap-2',
        'data-[row-variant=sender]:flex-row-reverse',
        'data-[row-align=bottom]:items-end',
        className,
      )}
      {...props}
    />
  )
}
