'use client'

import { useState } from 'react'
import {
  Chat,
  ChatMessages,
  ChatMessage,
  ChatInput,
  ChatMessageSkeletonList,
} from '@/components/chat'
import { SessionSummaryPanel } from '@/components/session-summary'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useFakeLoading } from '@/hooks/use-fake-loading'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useChatInputStore } from '@/lib/store/chat-input'
import { useChatMessagesStore } from '@/lib/store/chat-messages'
import { usePromptStateStore } from '@/lib/blueprints/promptStore'
import { useSessionDataStore } from '@/lib/store/session-data'
import { generateResponse, generateSessionSummary } from './actions'
import { ClipboardList, RefreshCw, Trash2 } from 'lucide-react'
import type { PromptTechnique, SessionSummary } from '@rainev/cogni'

export default function ChatTestPage() {
  // Stores
  const { input, setInput, clearInput } = useChatInputStore()
  const { messages, addMessage, clearMessages } = useChatMessagesStore()
  const { promptTechnique, setPromptTechnique } = usePromptStateStore()
  const { records, recordTurn, clearSession, setTechnique, currentIntent, sessionContext, setSessionContext } = useSessionDataStore()

  // UI state
  const [isTyping, setIsTyping] = useState(false)
  const isLoading = useFakeLoading(1500)
  const scrollRef = useScrollToBottom([messages, isLoading, isTyping])
  const intent = currentIntent

  // LLM-enhanced summary (only generated on explicit user action)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Send handler
  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    addMessage(text, 'You')
    clearInput()

    setIsTyping(true)
    const { reply, identifiedIntent, distortion, sessionContext: updatedContext } = await generateResponse(
      text,
      intent,
      promptTechnique,
      messages,
      sessionContext,
    )
    setIsTyping(false)

    addMessage(reply, 'Pebbles')

    // Persist the updated session context for the next turn
    setSessionContext(updatedContext)

    // Track the turn
    recordTurn({
      intent,
      userMessage: text,
      assistantReply: reply,
      nextIntent: identifiedIntent,
      distortion,
    })
  }

  // Generate LLM-enhanced summary
  const handleGenerateSummary = async () => {
    if (records.length === 0) return
    setSummaryLoading(true)
    try {
      const result = await generateSessionSummary(records, promptTechnique)
      setSummary(result)
    } finally {
      setSummaryLoading(false)
    }
  }

  // Clear everything
  const handleClear = () => {
    clearMessages()
    clearSession()
    setSummary(null)
  }

  // Handle technique changes
  const handleTechniqueChange = (value: string) => {
    const t = value as PromptTechnique
    setPromptTechnique(t)
    setTechnique(t)
  }

  return (
    <div className="flex gap-4 h-full max-w-480 mx-auto">
      {/* Left: Chat */}
      <div className="flex w-full lg:w-1/2">
        <Chat>
          {/* Header */}
          <div className="flex flex-row items-center pt-4 px-8 space-x-4">
            <Avatar className="h-10 w-10 bg-muted border-2 border-green-400">
              <AvatarImage src="/avatars/pebbles.svg" />
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">Pebbles the Pibble</h1>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400">Online</span>
                <span className="text-muted-foreground">&middot; {intent}</span>
                <span className="text-muted-foreground">&middot; {records.length} tracked</span>
              </div>
            </div>

            <Select value={promptTechnique} onValueChange={handleTechniqueChange}>
              <SelectTrigger className="w-44 ml-auto">
                <SelectValue placeholder="Prompt technique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="few-shot">Few-shot</SelectItem>
                <SelectItem value="chain-of-thought">Chain-of-thought</SelectItem>
                <SelectItem value="persona">Persona-based</SelectItem>
                <SelectItem value="plan-and-solve">Plan-and-solve</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="secondary"
              size="icon"
              onClick={handleClear}
              className="rounded-full"
            >
              <Trash2 />
            </Button>
          </div>

          {/* Messages */}
          <ChatMessages>
            {isLoading
              ? <ChatMessageSkeletonList count={5} />
              : messages.map(m => <ChatMessage key={m.id} msg={m} />)}
            {isTyping && <ChatMessage />}
            <div ref={scrollRef} />
          </ChatMessages>

          <ChatInput value={input} onChange={setInput} onSubmit={handleSend} />
        </Chat>
      </div>

      {/* Right: Summary panel — always visible */}
      <div className="hidden lg:flex flex-col lg:w-1/2 bg-background rounded-2xl shadow-sm overflow-hidden">
        {/* Summary header */}
        <div className="flex items-center justify-between pt-4 px-6 pb-2">
          <h2 className="text-sm font-semibold">Session Summary</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={records.length === 0 || summaryLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', summaryLoading && 'animate-spin')} />
            {summaryLoading ? 'Generating...' : 'Refresh'}
          </Button>
        </div>

        {/* Summary content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {summaryLoading ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              Generating enhanced summary...
            </div>
          ) : summary ? (
            <SessionSummaryPanel summary={summary} />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-sm text-muted-foreground">
              <ClipboardList className="h-6 w-6 opacity-40" />
              <p>No summary yet.</p>
              <p className="text-xs">Chat with Pebbles, then press <strong>Refresh</strong> to generate one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
