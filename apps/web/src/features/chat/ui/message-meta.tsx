import type { ComponentProps } from 'react'
import { AlertCircle, Check, CheckCheck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusIcons = {
  sending: Clock,
  sent:    Check,
  read:    CheckCheck,
  failed:  AlertCircle,
} as const

export type MessageStatusType = keyof typeof statusIcons
export type MessageMetaProps = ComponentProps<'span'> & {
  status?: MessageStatusType
}

export function MessageMeta({ status, className, children, ...props }: MessageMetaProps) {
  const Icon = status && statusIcons[status]
  const isFailed = status === 'failed'

  return (
    <span
      className={cn(
        'flex items-center gap-1',
        'text-muted-foreground text-xs',
        'px-3',
        'select-none',
        className,
      )}
      {...props}
    >
      {children}
      {Icon && (<Icon
        size={12}
        className={cn(isFailed && 'text-destructive')}
      />)}
    </span>
  )
}
