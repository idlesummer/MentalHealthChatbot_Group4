import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import background from '../assets/background.png'

export type BackgroundProps = ComponentProps<'div'>
export function Background({ className, children, ...props }: BackgroundProps) {
  return (
    <div
      data-slot="chat-background"
      className={cn('relative h-full', className)}
      {...props}
    >
      <div
        className="-z-1 absolute inset-0 bg-auto bg-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${background.src})` }}
      />
      {children}
    </div>
  )
}
