'use client'

import { ComponentProps } from 'react'
import { ChevronsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useContentContext } from './content'

export type ScrollAreaProps = ComponentProps<'div'>
export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  const { containerRef, handleScroll, isScrollReady } = useContentContext()

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      data-slot="chat-scroll-area"
      className={cn(
        'flex-1 min-h-0 overflow-y-auto',
        'flex flex-col gap-4 p-8',
        'scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent',
        !isScrollReady && 'invisible',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type ScrollButtonProps = ComponentProps<typeof Button>
export function ScrollButton({ className, ...props }: ScrollButtonProps) {
  const { scrollToBottom, isAtBottom } = useContentContext()

  return (
    <div className={cn(
      'bottom-8 left-1/2 z-10 absolute -translate-x-1/2',
      'transition-all duration-300',
      isAtBottom
        ? 'opacity-0 pointer-events-none translate-y-2'
        : 'opacity-100 translate-y-0',
    )}>
      <Button
        onClick={scrollToBottom}
        size="icon-lg"
        variant="outline"
        className={cn('shadow-2xs border-0 rounded-full text-muted-foreground cursor-pointer', className)}
        {...props}
      >
        <ChevronsDown />
      </Button>
    </div>
  )
}
