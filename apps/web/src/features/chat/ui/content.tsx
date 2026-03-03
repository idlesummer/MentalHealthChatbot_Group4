'use client'

import { ComponentProps, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { useScroll } from '../hooks/use-scroll'

export type ContentContextType = ReturnType<typeof useScroll>
export const ContentContext = createContext<ContentContextType | null>(null)

export function useContentContext() {
  const context = useContext(ContentContext)
  if (!context) throw new Error('useContentContext must be used within a ContentProvider')
  return context
}

export type ContentProps = ComponentProps<'div'>
export function Content({ className, children, ...props }: ContentProps) {
  const scroll = useScroll()

  return (
    <ContentContext.Provider value={scroll}>
      <div
        data-slot="chat-body"
        className={cn(
          'relative flex flex-col flex-1 min-h-0',
          'border-x w-full max-w-7xl',
          'p-0 scroll-smooth',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ContentContext.Provider>
  )
}
