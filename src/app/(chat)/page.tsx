'use client'

import { Chat } from '@/components/chat'
import { DataStreamHandler } from '@/components/data-stream-handler'

export default function ChatPage() {
  return (
    <main>
      <Chat />
      <DataStreamHandler /> {/* optional; safe to keep as stub */}
    </main>
  )
}
