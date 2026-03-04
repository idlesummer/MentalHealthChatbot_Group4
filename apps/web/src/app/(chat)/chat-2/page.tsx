'use client'

import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import * as Chat from '@/features/chat/ui'
import { useScroll } from '@/features/chat/hooks/use-scroll'
import { SessionSummaryPanel } from '@/components/session-summary'
import { useFakeLoading } from '@/hooks/use-fake-loading'
import { useChatInputStore } from '@/lib/store/chat-input'
import { useChatMessagesStore } from '@/lib/store/chat-messages'
import { usePromptStateStore } from '@/lib/blueprints/promptStore'
import { useSessionDataStore } from '@/lib/store/session-data'
import { computeSummaryLocally } from '@/lib/compute-summary'
import { generateResponse, generateSessionSummary, sendDataSMTP } from './actions'
import type { SessionSummary } from '@rainev/cogni'

const CBT_STEPS = [
  'Situation',
  'Automatic Thought',
  'Mood Rating',
  'Evidence For',
  'Evidence Against',
  'Alternative Thought',
  'Mood Re-rating',
  'Coping Strategy',
]

const MAX_CHARS = 1000

export default function Chat2Page() {
  const { input, setInput, clearInput } = useChatInputStore()
  const { messages, addMessage, clearMessages } = useChatMessagesStore()
  const { promptTechnique } = usePromptStateStore()
  const { records, recordTurn, clearSession, currentIntent } = useSessionDataStore()

  const scroll = useScroll()

  const [isTyping, setIsTyping] = useState(false)
  const isLoading = useFakeLoading(1500)

  const [llmSummary, setLlmSummary] = useState<SessionSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [exportName, setExportName] = useState('')
  const [exportStatus, setExportStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // Live local summary — updates after every turn
  const liveSummary = useMemo(() => {
    if (records.length === 0) return null
    return computeSummaryLocally(records, promptTechnique)
  }, [records, promptTechnique])

  // Prefer LLM-enhanced summary, fall back to live local
  const summary = llmSummary ?? liveSummary

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isTyping || input.length > MAX_CHARS) return

    addMessage(text, 'You')
    clearInput()
    scroll.scrollToBottom()

    setIsTyping(true)
    const { reply, identifiedIntent, distortion } = await generateResponse(
      text,
      currentIntent,
      promptTechnique,
      messages,
    )
    setIsTyping(false)

    addMessage(reply, 'Pebbles')
    scroll.scrollToBottom()
    recordTurn({
      intent: currentIntent,
      userMessage: text,
      assistantReply: reply,
      nextIntent: identifiedIntent,
      distortion,
    })
    setLlmSummary(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleGenerateSummary = async () => {
    if (records.length === 0 || summaryLoading) return
    setSummaryLoading(true)
    try {
      const result = await generateSessionSummary(records, promptTechnique)
      setLlmSummary(result)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleExport = async () => {
    const name = exportName.trim()
    if (!name || records.length === 0) return
    setExportStatus('sending')
    try {
      await sendDataSMTP({
        exportedBy: name,
        exportedAt: new Date().toISOString(),
        records,
      })
      setExportStatus('sent')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch {
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  const handleClear = () => {
    clearMessages()
    clearSession()
    setLlmSummary(null)
    setExportName('')
    setExportStatus('idle')
  }

  return (
    <Chat.StepperProvider steps={CBT_STEPS} step={parseInt(currentIntent.replace('I', '')) - 1}>
      <Chat.Background>
        <Chat.Root>

          {/* ── Header ────────────────────────────────────────────────────── */}
          <Chat.Header>
            <Chat.HeaderGroup>
              <Chat.HeaderRow>
                <Chat.HeaderAvatar
                  src="/avatars/pebbles.svg"
                  alt="Pebbles"
                  fallback="P"
                />
                <Chat.HeaderInfo
                  name="Pebbles"
                  status="Online"
                />
                <Chat.Toolbar>
                  <Chat.DialogButton>
                    <Chat.DialogTabs tabs={['Settings', 'Summary', 'About']}>

                      {/* ── Settings tab ─────────────────────────────────── */}
                      <Chat.DialogTabsContent value="Settings">

                        <Chat.DialogSection title="Export">
                          <Chat.DialogRow
                            label="Export via Email"
                            desc="Send this session as a JSON attachment to the researcher"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Your name"
                                value={exportName}
                                onChange={e => setExportName(e.target.value)}
                                className="bg-background px-3 border border-input rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring w-32 h-8 text-sm"
                              />
                              <Chat.DialogRowButton
                                onClick={handleExport}
                                disabled={!exportName.trim() || records.length === 0 || exportStatus === 'sending'}
                              >
                                {exportStatus === 'sending' && <Loader2 className="size-3.5 animate-spin" />}
                                {exportStatus === 'sent' ? 'Sent!' : exportStatus === 'error' ? 'Failed' : 'Export'}
                              </Chat.DialogRowButton>
                            </div>
                          </Chat.DialogRow>
                        </Chat.DialogSection>

                        <Chat.DialogSection title="Manage">
                          <Chat.DialogRow
                            label="Clear Session"
                            desc="Permanently remove this conversation and all session data"
                          >
                            <Chat.DeleteAlertDialog
                              title="Clear session?"
                              desc="This will permanently delete the conversation and all session records. This cannot be undone."
                              onDelete={handleClear}
                            >
                              <Chat.DialogRowButton variant="destructive">
                                Clear
                              </Chat.DialogRowButton>
                            </Chat.DeleteAlertDialog>
                          </Chat.DialogRow>
                        </Chat.DialogSection>

                      </Chat.DialogTabsContent>

                      {/* ── Summary tab ──────────────────────────────────── */}
                      <Chat.DialogTabsContent value="Summary">

                        <Chat.DialogSection title="AI-Enhanced Summary" border={false}>
                          <Chat.DialogRow
                            label="Generate Clinical Notes"
                            desc="Use AI to write concise clinical notes for each CBT stage"
                          >
                            <Chat.DialogRowButton
                              onClick={handleGenerateSummary}
                              disabled={records.length === 0 || summaryLoading}
                            >
                              {summaryLoading
                                ? <><Loader2 className="size-3.5 animate-spin" /> Generating...</>
                                : 'Summarize'
                              }
                            </Chat.DialogRowButton>
                          </Chat.DialogRow>
                        </Chat.DialogSection>

                        <Chat.DialogSection title="Session Summary">
                          {summaryLoading ? (
                            <div className="flex flex-col justify-center items-center gap-3 py-16 text-muted-foreground">
                              <Loader2 className="size-6 animate-spin" />
                              <span className="text-sm">Generating enhanced clinical summary…</span>
                            </div>
                          ) : summary ? (
                            <SessionSummaryPanel summary={summary} />
                          ) : (
                            <div className="flex flex-col justify-center items-center gap-2 py-16 text-muted-foreground text-center">
                              <span className="text-sm">No session data yet.</span>
                              <span className="text-xs">Start chatting — the summary will update live after each turn.</span>
                            </div>
                          )}
                        </Chat.DialogSection>

                      </Chat.DialogTabsContent>

                      {/* ── About tab ────────────────────────────────────── */}
                      <Chat.DialogTabsContent value="About">
                        <Chat.DialogSection title="About Pebbles">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Pebbles is an AI-powered Cognitive Behavioral Therapy (CBT) companion
                            designed to guide you through a structured single-session CBT experience.
                            Using evidence-based techniques, Pebbles helps you explore your thoughts,
                            identify cognitive distortions, and develop healthier perspectives.
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            <strong className="text-foreground">Important:</strong> Pebbles is not a
                            real therapist. This tool is not a substitute for professional mental health
                            care. If you are in crisis, please contact a licensed mental health
                            professional or a crisis helpline immediately.
                          </p>
                        </Chat.DialogSection>
                        <Chat.DialogSection title="CBT Stages">
                          <div className="gap-2 grid grid-cols-2">
                            {CBT_STEPS.map((step, i) => (
                              <div key={step} className="flex items-center gap-2 text-sm">
                                <span className="flex justify-center items-center bg-primary/10 rounded-full size-5 font-bold text-[10px] text-primary shrink-0">
                                  {i + 1}
                                </span>
                                <span className="text-muted-foreground">{step}</span>
                              </div>
                            ))}
                          </div>
                        </Chat.DialogSection>
                      </Chat.DialogTabsContent>

                    </Chat.DialogTabs>
                  </Chat.DialogButton>
                </Chat.Toolbar>
              </Chat.HeaderRow>

              <Chat.HeaderRow>
                <Chat.Stepper />
              </Chat.HeaderRow>
            </Chat.HeaderGroup>
          </Chat.Header>

          {/* ── Messages ──────────────────────────────────────────────────── */}
          <Chat.Content scroll={scroll}>
            <Chat.ScrollArea>
              {!isLoading && messages.map((m, i) => {
                const isSender = m.user === 'You'
                const isLast = i === messages.length - 1

                return (
                  <Chat.Message
                    key={m.id}
                    variant={isSender ? 'sender' : 'receiver'}
                    align={isLast ? 'bottom' : 'bottom'}
                  >
                    {!isSender && (
                      <Chat.Avatar
                        src="/avatars/pebbles.svg"
                        alt="Pebbles"
                        fallback="P"
                        size="sm"
                      />
                    )}
                    <Chat.MessageContent>
                      <Chat.MessageAuthor>{isSender ? 'You' : 'Pebbles'}</Chat.MessageAuthor>
                      <Chat.BubbleGroup>
                        <Chat.Bubble>
                          <Chat.BubbleText>{m.text}</Chat.BubbleText>
                          <Chat.BubbleActions>
                            <Chat.BubbleCopyButton value={m.text} />
                          </Chat.BubbleActions>
                        </Chat.Bubble>
                      </Chat.BubbleGroup>
                      <Chat.MessageMeta>
                        {new Date(m.ts).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Chat.MessageMeta>
                    </Chat.MessageContent>
                  </Chat.Message>
                )
              })}

              {isTyping && (
                <Chat.Message variant="receiver" align="bottom">
                  <Chat.Avatar
                    src="/avatars/pebbles.svg"
                    alt="Pebbles"
                    fallback="P"
                    size="sm"
                  />
                  <Chat.MessageContent>
                    <Chat.MessageAuthor>Pebbles</Chat.MessageAuthor>
                    <Chat.BubbleGroup>
                      <Chat.Bubble>
                        <Chat.BubbleText typing />
                      </Chat.Bubble>
                    </Chat.BubbleGroup>
                  </Chat.MessageContent>
                </Chat.Message>
              )}
            </Chat.ScrollArea>
            <Chat.ScrollButton />
          </Chat.Content>

          {/* ── Composer ──────────────────────────────────────────────────── */}
          <Chat.Composer>
            <Chat.ComposerGroup>
              <Chat.ComposerInput
                id="chat-2-input"
                placeholder="Send a message… (Enter to send, Shift+Enter for new line)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping || isLoading}
              />
              <Chat.ComposerToolbar>
                <Chat.ComposerCharCount value={input.length} max={MAX_CHARS} />
                <Chat.ComposerSendButton
                  className="ml-auto"
                  onClick={handleSend}
                  disabled={isTyping || isLoading || !input.trim() || input.length > MAX_CHARS}
                />
              </Chat.ComposerToolbar>
            </Chat.ComposerGroup>
            <Chat.ComposerMeta>
              Pebbles is powered by AI and may not always be accurate. Not a substitute for professional help.
            </Chat.ComposerMeta>
          </Chat.Composer>

        </Chat.Root>
      </Chat.Background>
    </Chat.StepperProvider>
  )
}
