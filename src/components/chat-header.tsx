'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusIcon, VercelIcon } from './icons'

// TODO: simplify sidebar logic later
export function ChatHeader(props: {
  chatId: string
  isReadonly: boolean
  selectedVisibilityType: string
}) {
  const router = useRouter()

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      {/* New Chat button */}
      <Button
        className="ml-auto h-8 px-2 md:h-fit md:px-2"
        onClick={() => {
          router.push('/')
          router.refresh()
        }}
        variant="outline"
      >
        <PlusIcon />
        <span className="md:sr-only">New Chat</span>
      </Button>

      {/* Deploy with Vercel button */}
      <Button
        asChild
        className="hidden bg-zinc-900 px-2 text-zinc-50 hover:bg-zinc-800 md:ml-auto md:flex md:h-fit dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <div className="ml-auto text-sm text-muted-foreground">
          AI-Chatbot v1.0
        </div>
      </Button>
    </header>
  )
}
