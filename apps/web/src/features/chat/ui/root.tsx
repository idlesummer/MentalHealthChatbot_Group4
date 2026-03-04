import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type RootProps = ComponentProps<'div'>
export function Root({ className, ...props }: RootProps) {
  return (
    <div
      className={cn('flex flex-col items-center px-0 md:px-4 h-full', className)}
      {...props}
    />
  )
}
