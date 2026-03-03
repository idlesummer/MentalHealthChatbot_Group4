import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { ArrowBigUp } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

export type ComposerGroupProps = ComponentProps<typeof InputGroup>
export function ComposerGroup({ className, ...props }: ComposerGroupProps) {
  return (
    <InputGroup
      className={cn(
        'gap-1 bg-muted shadow-2xs p-4 border border-b-0 rounded-xl',
        'has-[[data-slot=input-group-control]:focus-visible]:ring-0',
        'has-[[data-slot=input-group-control]:focus-visible]:border-input',
        className,
      )}
      {...props}
    />
  )
}

export type ComposerInputProps = ComponentProps<typeof InputGroupTextarea>
export function ComposerInput({ className, ...props }: ComposerInputProps) {
  return (
    <InputGroupTextarea
      className={cn('p-1 min-h-4 max-h-40 overflow-y-auto text-md md:text-md', className)}
      {...props}
    />
  )
}

export type ComposerToolbarProps = ComponentProps<typeof InputGroupAddon>
export function ComposerToolbar({ className, ...props }: ComposerToolbarProps) {
  return (
    <InputGroupAddon
      align="block-end"
      className={cn('flex p-0 px-1', className)}
      {...props}
    />
  )
}

export type ComposerCharCountProps = ComponentProps<typeof InputGroupText> & {
  value: number
  max: number
}

export function ComposerCharCount({ value, max, className, ...props }: ComposerCharCountProps) {
  const remaining = max - value
  const isNearLimit = remaining <= max * 0.1
  const isOverLimit = remaining < 0

  return (
    <InputGroupText
      className={cn(
        'text-muted-foreground text-xs',
        isNearLimit && 'text-warning',
        isOverLimit && 'text-destructive',
        className,
      )}
      {...props}
    >
      {remaining}/{max}
    </InputGroupText>
  )
}

export type ComposerSendButtonProps = ComponentProps<typeof InputGroupButton>
export function ComposerSendButton({ className, ...props }: ComposerSendButtonProps) {
  return (
    <InputGroupButton
      variant="default"
      size="icon-sm"
      aria-label="Send"
      className={cn('hover:bg-primary/80 text-background cursor-pointer', className)}
      {...props}
    >
      <ArrowBigUp />
    </InputGroupButton>
  )
}
