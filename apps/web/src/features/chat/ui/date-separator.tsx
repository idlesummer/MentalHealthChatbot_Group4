import type { ComponentProps } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type DateSeparatorProps = ComponentProps<'div'>
export function DateSeparator({ className, children, ...props }: DateSeparatorProps) {
  return (
    <div className={cn('flex justify-center items-center gap-2 select-none', className)} {...props}>
      <Separator className="flex-1" />
      <span className="font-light text-muted-foreground text-xs">
        {children}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}
