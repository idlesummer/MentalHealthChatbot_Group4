import type { ComponentProps } from 'react'
import { EllipsisVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ToolbarProps = ComponentProps<'div'>
export function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <div
      className={cn('flex items-center gap-2 ml-auto', className)}
      {...props}
    />
  )
}

export type ToolbarButtonProps = ComponentProps<typeof Button>
export function ToolbarButton({ className, ...props }: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('hover:bg-muted-foreground/8 text-muted-foreground transition-colors cursor-pointer', className)}
      {...props}
    />
  )
}
