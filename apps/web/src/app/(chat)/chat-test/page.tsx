'use client'

import { useMemo, useState } from 'react'
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
import { useFakeLoading } from '@/hooks/use-fake-loading'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useChatInputStore } from '@/lib/store/chat-input'
import { useChatMessagesStore } from '@/lib/store/chat-messages'
import { usePromptStateStore } from '@/lib/blueprints/promptStore'
import { useSessionDataStore } from '@/lib/store/session-data'
import { computeSummaryLocally } from '@/lib/compute-summary'
import { generateResponse, generateSessionSummary } from './actions'
import { ClipboardList, MessageCircle, Trash2 } from 'lucide-react'
import type { PromptTechnique, SessionSummary } from '@rainev/cogni'

export default function ChatTestPage() {
  // Stores
  const { input, setInput, clearInput } = useChatInputStore()
  const { messages, addMessage, clearMessages } = useChatMessagesStore()
  const { promptTechnique, setPromptTechnique } = usePromptStateStore()
  const { records, recordTurn, clearSession, setTechnique, currentIntent } = useSessionDataStore()

  // UI state
  const [isTyping, setIsTyping] = useState(false)
  const isLoading = useFakeLoading(1500)
  const scrollRef = useScrollToBottom([messages, isLoading, isTyping])
  const intent = currentIntent
  const [view, setView] = useState<'chat' | 'summary'>('chat')

  // LLM-enhanced summary (only generated on explicit user action)
  const [llmSummary, setLlmSummary] = useState<SessionSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Instant local summary — recomputed reactively when records change
  const liveSummary = useMemo(() => {
    if (records.length === 0) return null
    return computeSummaryLocally(records, promptTechnique)
  }, [records, promptTechnique])

  // Displayed summary: prefer LLM-enhanced, fall back to instant local
  const summary = llmSummary ?? liveSummary

  // Send handler
  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    addMessage(input, 'You')
    clearInput()

    setIsTyping(true)
    const { reply, identifiedIntent, distortion } = await generateResponse(
      input, intent, promptTechnique, messages,
    )
    setIsTyping(false)

    addMessage(reply, 'Pebbles')

    // Track the turn — updates `records`, which triggers liveSummary recompute
    recordTurn({
      intent,
      userMessage: text,
      assistantReply: reply,
      nextIntent: identifiedIntent,
      distortion,
    })

    // Clear stale LLM summary so the live one shows immediately
    setLlmSummary(null)
  }

  // Generate LLM-enhanced summary (switches to summary view on mobile)
  const handleViewSummary = async () => {
    setView('summary')
    if (records.length === 0) return
    setSummaryLoading(true)
    try {
      const result = await generateSessionSummary(records, promptTechnique)
      setLlmSummary(result)
    } finally {
      setSummaryLoading(false)
    }
  }

  // Clear everything
  const handleClear = () => {
    clearMessages()
    clearSession()
    setLlmSummary(null)
    setView('chat')
  }

  // Handle technique changes
  const handleTechniqueChange = (value: string) => {
    const t = value as PromptTechnique
    setPromptTechnique(t)
    setTechnique(t)
  }

  return (
    <div className="flex gap-4 h-full max-w-[120rem] mx-auto">
      {/* Left: Chat */}
      <div className={view === 'summary' ? 'hidden lg:flex lg:w-1/2' : 'flex w-full lg:w-1/2'}>
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
              variant="outline"
              size="sm"
              onClick={handleViewSummary}
              disabled={records.length === 0}
              className="gap-1.5"
            >
              <ClipboardList className="h-4 w-4" />
              Summary
            </Button>

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

      {/* Right: Summary panel — always visible on lg, toggled on mobile */}
      <div className={
        view === 'summary'
          ? 'flex flex-col w-full lg:w-1/2 bg-background rounded-2xl shadow-sm overflow-hidden'
          : 'hidden lg:flex flex-col lg:w-1/2 bg-background rounded-2xl shadow-sm overflow-hidden'
      }>
        {/* Summary header */}
        <div className="flex items-center justify-between pt-4 px-6 pb-2">
          <h2 className="text-sm font-semibold">Session Summary</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('chat')}
            className="gap-1.5 text-xs lg:hidden"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Back to chat
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
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              No session data yet. Start chatting to see the summary update live.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
