/**
 * Cogni CBT Engine - Main API
 *
 * This module provides a clean, callable API for the CBT pipeline.
 * It abstracts all CBT-related logic into a simple interface that can be
 * called from any frontend or backend.
 */

import { PROMPT_TECHNIQUES } from '@/prompts'
import {
  DistortionClassifier,
  PromptBuilder,
  ReplyGenerator,
  IntentManager,
  CommandDetector,
  SessionManager,
} from '@/services'
import { UserCommand, type SessionState, type CreateSessionOptions } from '@/types'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { PromptTechnique } from '@/prompts'
import type {
  CognitiveDistortionClassification as DistortionClassification,
  Intent,
  Message,
} from '@/services'

/** Parameters for generating a CBT response */
export interface CogniRequest {
  message: string
  intent: Intent
  conversation: Message[]
  technique: PromptTechnique
}

/** Result from generating a CBT response */
export interface CogniResponse {
  reply: string
  nextIntent: Intent
  distortion?: DistortionClassification
}

/** Parameters for computing the next intent */
export interface ComputeNextIntentParams {
  intent: Intent
  message: string
  conversation: Message[]
}

/**
 * Parameters for session-based chat
 * This extends the basic CogniRequest with session state management
 */
export interface CogniChatRequest {
  message: string
  session: SessionState
  technique: PromptTechnique
}

/**
 * Result from session-based chat
 * Includes the response plus updated session state
 */
export interface CogniChatResponse {
  reply: string
  session: SessionState
  distortion?: DistortionClassification
  commandDetected?: UserCommand
  wasCommandHandled: boolean
}

/**
 * CogniEngine - The main CBT pipeline engine
 *
 * This class provides a high-level API for interacting with the CBT pipeline.
 * It orchestrates the CBT workflow using specialized services:
 * - Cognitive distortion detection
 * - Intent management and transitions
 * - Response generation using different prompt techniques
 *
 * @example
 * ```typescript
 * import { ChatOpenAI } from '@langchain/openai'
 * import { CogniEngine } from '@rainev/cogni'
 *
 * const model = new ChatOpenAI({ model: 'gpt-4o-mini' })
 * const engine = new CogniEngine(model)
 *
 * const result = await engine.respond({
 *   message: 'I failed my exam',
 *   intent: 'I1',
 *   conversation: [],
 *   technique: 'persona'
 * })
 * ```
 */
export class CogniEngine {
  private services: {
    distortionClassifier: DistortionClassifier
    promptBuilder: PromptBuilder
    replyGenerator: ReplyGenerator
    intentManager: IntentManager
    commandDetector: CommandDetector
    sessionManager: SessionManager
  }

  constructor(model: BaseChatModel) {

    // Initialize services
    const distortionClassifier = new DistortionClassifier(model)
    const promptBuilder = new PromptBuilder()
    const replyGenerator = new ReplyGenerator(model)
    const intentManager = new IntentManager({ model, promptBuilder })
    const commandDetector = new CommandDetector()
    const sessionManager = new SessionManager()

    this.services = {
      promptBuilder,
      distortionClassifier,
      replyGenerator,
      intentManager,
      commandDetector,
      sessionManager,
    }
  }

  /**
   * Generate a CBT response for the user's message
   *
   * This is the main method for interacting with the CBT pipeline.
   * It orchestrates the following steps:
   * 1. Identifies cognitive distortions in the message
   * 2. Builds a prompt using the selected technique and current intent
   * 3. Generates a response using the LLM
   * 4. Evaluates whether to transition to the next intent
   */
  async respond({ message, intent, conversation, technique }: CogniRequest) {

    // Step 1: Identify cognitive distortion
    const distortion = await this.services.distortionClassifier.classify(message)

    // Step 2: Build the reply prompt
    const replyPrompt = this.services.promptBuilder.buildReplyPrompt(
      message,
      intent,
      technique,
      conversation,
      distortion,
    )

    // Step 3: Generate reply with structured output
    const result = await this.services.replyGenerator.generate(replyPrompt)
    const reply = result.reply

    // Step 4: Compute next intent
    const newIntent = await this.services.intentManager.computeNextIntent(intent, message, conversation)
    const nextIntent = newIntent || intent
    const response: CogniResponse = { reply, nextIntent, distortion }
    return response
  }

  /** Identify cognitive distortions in a message */
  async identifyCognitiveDistortions(message: string) {
    return this.services.distortionClassifier.classify(message)
  }

  /** Get all available intents */
  getIntents(): Intent[] {
    return this.services.intentManager.getIntents()
  }

  /** Get the initial intent for a new session */
  getInitialIntent(): Intent {
    return this.services.intentManager.getInitialIntent()
  }

  /** Get all available prompt techniques */
  getPromptTechniques() {
    return PROMPT_TECHNIQUES
  }

  /** Get intent count statistics for analytics */
  getIntentCounts() {
    return this.services.intentManager.getIntentCounts()
  }

  /** Reset intent counts (useful when starting a new session) */
  resetIntentCounts() {
    return this.services.intentManager.resetIntentCounts()
  }

  // ========================================================================
  // Phase 2: Session-Based Chat Methods
  // ========================================================================

  /**
   * Create a new chat session
   *
   * This initializes session state for tracking user progress through the CBT flow.
   * Use this at the start of a new conversation.
   *
   * @param options - Session creation options
   * @returns New session state
   *
   * @example
   * ```typescript
   * const session = engine.createSession({ userId: 'user-123' })
   * ```
   */
  createSession(options: CreateSessionOptions): SessionState {
    return this.services.sessionManager.createSession(options)
  }

  /**
   * Chat with session state management
   *
   * This is the Phase 2 enhanced version of respond() that includes:
   * - Command detection (restart, repeat, pause, help, end)
   * - Session state tracking
   * - Automatic message history management
   * - Smart handling of user stuck on a step
   *
   * @param request - Chat request with session state
   * @returns Chat response with updated session
   *
   * @example
   * ```typescript
   * const session = engine.createSession({ userId: 'user-123' })
   * const result = await engine.chat({
   *   message: "I want to start over",
   *   session,
   *   technique: 'persona'
   * })
   * // result.commandDetected === UserCommand.RESTART
   * // result.session.currentIntent === 'I1'
   * ```
   */
  async chat({ message, session, technique }: CogniChatRequest): Promise<CogniChatResponse> {
    // Step 1: Detect commands
    const commandResult = this.services.commandDetector.detect(message)

    // Step 2: Handle commands if detected
    if (commandResult.command !== UserCommand.NONE) {
      const commandResponse = await this.handleCommand(
        commandResult.command,
        session
      )
      return {
        ...commandResponse,
        commandDetected: commandResult.command,
        wasCommandHandled: true,
      }
    }

    // Step 3: Check if user is stuck (too many messages in current intent)
    if (this.services.sessionManager.isUserStuck(session)) {
      const clarification = this.getClarificationMessage(session.currentIntent)
      const updatedSession = this.services.sessionManager.updateWithMessage(session, {
        id: `msg-${Date.now()}`,
        user: 'You',
        text: message,
        ts: Date.now(),
      })

      return {
        reply: clarification,
        session: updatedSession,
        wasCommandHandled: false,
      }
    }

    // Step 4: Normal CBT flow - process message
    const result = await this.respond({
      message,
      intent: session.currentIntent,
      conversation: session.conversation,
      technique,
    })

    // Step 5: Update session state
    let updatedSession = session

    // Add user message
    updatedSession = this.services.sessionManager.updateWithMessage(updatedSession, {
      id: `msg-${Date.now()}-user`,
      user: 'You',
      text: message,
      ts: Date.now(),
    })

    // Add assistant reply
    updatedSession = this.services.sessionManager.updateWithMessage(updatedSession, {
      id: `msg-${Date.now()}-assistant`,
      user: 'Pebbles',
      text: result.reply,
      ts: Date.now(),
    })

    // Update intent if it changed
    if (result.nextIntent !== session.currentIntent) {
      updatedSession = this.services.sessionManager.updateIntent(
        updatedSession,
        result.nextIntent
      )
    }

    // Update thought record with distortion if detected
    if (result.distortion) {
      updatedSession = this.services.sessionManager.updateThoughtRecord(updatedSession, {
        distortion: result.distortion,
      })
    }

    // Check if session is complete (returned to I1 after I8)
    if (session.currentIntent === 'I8' && result.nextIntent === 'I1') {
      updatedSession = this.services.sessionManager.completeSession(updatedSession)
    }

    return {
      reply: result.reply,
      session: updatedSession,
      distortion: result.distortion,
      wasCommandHandled: false,
    }
  }

  /**
   * Handle detected user commands
   *
   * @param command - The detected command
   * @param session - Current session state
   * @returns Response for the command
   */
  private async handleCommand(
    command: UserCommand,
    session: SessionState
  ): Promise<Omit<CogniChatResponse, 'commandDetected' | 'wasCommandHandled'>> {
    switch (command) {
      case UserCommand.RESTART:
        return this.handleRestartCommand(session)

      case UserCommand.REPEAT:
        return this.handleRepeatCommand(session)

      case UserCommand.PAUSE:
        return this.handlePauseCommand(session)

      case UserCommand.HELP:
        return this.handleHelpCommand(session)

      case UserCommand.END:
        return this.handleEndCommand(session)

      default:
        // This shouldn't happen, but handle gracefully
        return {
          reply: "I didn't quite understand that. Could you try again?",
          session,
        }
    }
  }

  /**
   * Handle restart command
   */
  private handleRestartCommand(session: SessionState): Omit<CogniChatResponse, 'commandDetected' | 'wasCommandHandled'> {
    const resetSession = this.services.sessionManager.resetForNewThoughtRecord(session)
    this.services.intentManager.resetIntentCounts()

    return {
      reply: "Of course! Let's start fresh. What situation would you like to work through today?",
      session: resetSession,
    }
  }

  /**
   * Handle repeat command
   */
  private handleRepeatCommand(session: SessionState): Omit<CogniChatResponse, 'commandDetected' | 'wasCommandHandled'> {
    const lastMessage = this.services.sessionManager.getLastAssistantMessage(session)

    return {
      reply: lastMessage || "I don't have a previous message to repeat. Let's continue - what would you like to share?",
      session,
    }
  }

  /**
   * Handle pause command
   */
  private handlePauseCommand(session: SessionState): Omit<CogniChatResponse, 'commandDetected' | 'wasCommandHandled'> {
    const pausedSession = this.services.sessionManager.pauseSession(session)

    return {
      reply: "I understand this can be tiring. Take all the time you need. When you're ready to continue, just send me a message and we'll pick up right where we left off.",
      session: pausedSession,
    }
  }

  /**
   * Handle help command
   */
  private handleHelpCommand(session: SessionState): Omit<CogniChatResponse, 'commandDetected' | 'wasCommandHandled'> {
    const helpMessage = this.getHelpMessage(session.currentIntent)

    return {
      reply: helpMessage,
      session,
    }
  }

  /**
   * Handle end command
   */
  private handleEndCommand(session: SessionState): Omit<CogniChatResponse, 'commandDetected' | 'wasCommandHandled'> {
    const completedSession = this.services.sessionManager.completeSession(session)

    return {
      reply: "Thank you for sharing with me today. Remember, you can come back anytime you want to work through your thoughts. Take care!",
      session: completedSession,
    }
  }

  /**
   * Get help message for current intent
   */
  private getHelpMessage(intent: Intent): string {
    const helpMessages: Record<Intent, string> = {
      I1: "Right now, I'm trying to understand the specific situation that's bothering you. Try to describe a concrete event - what happened, when it happened, and where you were. For example: 'My boss criticized my presentation in front of the team yesterday.'",
      I2: "I'm helping you identify the automatic thought that popped into your mind during that situation. This is different from a feeling - it's the actual words or belief that went through your head. For example: 'I thought everyone must think I'm incompetent.'",
      I3: "I'd like to know how intense your emotions felt. You can give me a number from 0-100 (where 100 is the strongest), or describe it with words like 'very intense' or 'moderate.'",
      I4: "Now we're exploring evidence that supports your automatic thought. What facts or experiences make you think this thought might be true? Try to be specific.",
      I5: "This is where we look for evidence that contradicts your automatic thought. Are there times when the opposite was true? Any facts that don't fit with this belief?",
      I6: "Based on the evidence we've explored, can you think of a more balanced way to view the situation? This should feel realistic and believable to you, not just forced positivity.",
      I7: "Now that you've developed a more balanced perspective, how do you feel? Has the intensity of your emotion changed? Give me a new rating from 0-100.",
      I8: "We're almost done! I'm looking for a practical strategy you could use when similar situations come up in the future. What might help you remember this balanced perspective?",
    }

    return helpMessages[intent]
  }

  /**
   * Get clarification message when user seems stuck
   */
  private getClarificationMessage(intent: Intent): string {
    const clarificationMessages: Record<Intent, string> = {
      I1: "I want to make sure I understand the situation clearly. Could you describe what happened in a bit more detail? When and where did this occur?",
      I2: "I'm trying to understand the specific thought that went through your mind. Remember, a thought is different from a feeling - it's more like an interpretation or belief. What were you telling yourself in that moment?",
      I3: "I'd like to understand how strong this feeling was for you. Could you rate it on a scale from 0 to 100? Or describe it with words like 'mild,' 'moderate,' or 'intense'?",
      I4: "Let's explore what makes this thought feel true to you. Can you think of any specific examples or facts that support this belief?",
      I5: "Now let's look at the other side. Are there any times when this thought wasn't true? Any evidence that contradicts it?",
      I6: "Taking both sides into account, what would be a more balanced way to think about this? Something that feels true but also fair to yourself?",
      I7: "How are you feeling now, after considering this balanced perspective? Has your emotional intensity shifted at all?",
      I8: "What's one thing you could do or remind yourself of when a similar situation comes up again?",
    }

    return clarificationMessages[intent]
  }

  /**
   * Resume a paused session
   *
   * @param session - The paused session
   * @returns Greeting message and resumed session
   */
  resumeSession(session: SessionState): { reply: string; session: SessionState } {
    const resumedSession = this.services.sessionManager.resumeSession(session)

    const situation = session.currentThoughtRecord.situation || 'the situation we were discussing'
    const reply = `Welcome back! We were working on ${situation}. Would you like to continue where we left off?`

    return {
      reply,
      session: resumedSession,
    }
  }
}

/**
 * Simplified function-based API (alternative to class-based API)
 *
 * This provides a simpler interface for one-off calls without instantiating the engine.
 */
export async function generateCBTResponse(model: BaseChatModel, params: CogniRequest) {
  const engine = new CogniEngine(model)
  return engine.respond(params)
}
