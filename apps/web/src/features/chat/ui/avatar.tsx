import type { ComponentProps, ReactNode } from 'react'
import { Avatar as BaseAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type AvatarStatus = 'away' | 'busy' | 'offline' | 'online'
export type AvatarProps = ComponentProps<typeof BaseAvatar> & {
  src?: string
  alt?: string
  fallback?: ReactNode
}

export function Avatar({ src, alt, fallback, className, ...props }: AvatarProps) {
  return (
    <BaseAvatar className={cn('bg-muted shadow', className)} {...props}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </BaseAvatar>
  )
}
