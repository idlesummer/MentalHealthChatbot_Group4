import type { ComponentProps } from 'react'
import { Field, FieldDescription } from '@/components/ui/field'
import { cn } from '@/lib/utils'

export type ComposerProps = ComponentProps<typeof Field>
export function Composer({ className, ...props }: ComposerProps) {
  return (
    <Field
      data-slot="chat-composer"
      className={cn(
        'z-1 relative',
        'w-full min-w-xs max-w-7xl',
        'gap-0',
        'px-4 pb-2',
        'border-x bg-background',
        className,
      )}
      {...props}
    />
  )
}

export type ComposerMetaProps = ComponentProps<typeof FieldDescription>
export function ComposerMeta({ className, ...props }: ComposerMetaProps) {
  return (
    <FieldDescription
      className={cn('py-1 text-xs text-center', className)}
      {...props}
    />
  )
}
