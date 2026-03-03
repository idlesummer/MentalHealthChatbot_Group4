import type { ComponentProps, ReactNode } from 'react'
import { Avatar as BaseAvatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type AvatarStatus = 'away' | 'busy' | 'offline' | 'online'
export type AvatarProps = ComponentProps<typeof BaseAvatar> & {
  src?: string
  alt?: string
  fallback?: ReactNode
  status?: AvatarStatus
}

export function Avatar({ src, alt, fallback, status, className, ...props }: AvatarProps) {
  return (
    <BaseAvatar className={cn('bg-muted shadow', className)} {...props}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
      {status && (
        <AvatarBadge
          data-status={status}
          className={cn(
            'data-[status=offline]:bg-muted-foreground',
            'data-[status=online]:bg-green-600 data-[status=online]:dark:bg-green-800',
            'data-[status=away]:bg-yellow-500 data-[status=away]:dark:bg-yellow-700',
            'data-[status=busy]:bg-red-500 data-[status=busy]:dark:bg-red-700',
          )}
        />
      )}
    </BaseAvatar>
  )
}
