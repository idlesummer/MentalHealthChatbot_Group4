/**
 * SessionManager Service
 *
 * Responsible for managing CBT session state.
 * Handles session creation, updates, pause/resume, and persistence.
 *
 * This service provides the foundation for chat-based CBT by tracking
 * user progress across multiple message exchanges.
 */

import type {
  SessionState,
  ThoughtRecord,
  CreateSessionOptions,
  ResumeSessionOptions,
} from '@/types'
import type { Intent, Message } from '@/services'

/**
 * Service for managing CBT session lifecycle
 *
 * This service handles all session state operations:
 * - Creating new sessions
 * - Updating session state
 * - Tracking progress through intents
 * - Managing thought record data
 * - Pause/resume functionality
 *
 * @example
 * ```typescript
 * const sessionManager = new SessionManager()
 * const session = sessionManager.createSession({ userId: 'user-123' })
 * sessionManager.updateIntent(session, 'I2')
 * ```
 */
export class SessionManager {
  /**
   * Create a new CBT session
   *
   * @param options - Session creation options
   * @returns New session state
   */
  createSession(options: CreateSessionOptions): SessionState {
    const now = Date.now()
    const sessionId = options.sessionId || this.generateSessionId()

    return {
      id: sessionId,
      userId: options.userId,
      startTime: now,
      lastActiveTime: now,
      currentIntent: options.initialIntent || 'I1',
      currentThoughtRecord: {},
      conversation: [],
      isPaused: false,
      isComplete: false,
      messagesInCurrentIntent: 0,
    }
  }

  /**
   * Update session with a new message
   *
   * @param session - Current session state
   * @param message - New message to add
   * @returns Updated session state
   */
  updateWithMessage(session: SessionState, message: Message): SessionState {
    return {
      ...session,
      conversation: [...session.conversation, message],
      lastActiveTime: Date.now(),
      messagesInCurrentIntent: session.messagesInCurrentIntent + 1,
    }
  }

  /**
   * Update the current intent
   *
   * When advancing to a new intent, reset the message counter
   *
   * @param session - Current session state
   * @param intent - New intent to set
   * @returns Updated session state
   */
  updateIntent(session: SessionState, intent: Intent): SessionState {
    return {
      ...session,
      currentIntent: intent,
      messagesInCurrentIntent: 0, // Reset counter for new intent
      lastActiveTime: Date.now(),
    }
  }

  /**
   * Update the thought record with new data
   *
   * @param session - Current session state
   * @param updates - Partial thought record updates
   * @returns Updated session state
   */
  updateThoughtRecord(
    session: SessionState,
    updates: Partial<ThoughtRecord>,
  ): SessionState {
    return {
      ...session,
      currentThoughtRecord: {
        ...session.currentThoughtRecord,
        ...updates,
      },
      lastActiveTime: Date.now(),
    }
  }

  /**
   * Mark session as paused
   *
   * @param session - Current session state
   * @returns Updated session state
   */
  pauseSession(session: SessionState): SessionState {
    return {
      ...session,
      isPaused: true,
      lastActiveTime: Date.now(),
    }
  }

  /**
   * Resume a paused session
   *
   * @param session - Current session state
   * @param options - Resume options
   * @returns Updated session state
   */
  resumeSession(
    session: SessionState,
    options?: ResumeSessionOptions,
  ): SessionState {
    const defaultOptions: ResumeSessionOptions = {
      continueFromLastIntent: true,
      restartCurrentSituation: false,
    }

    const resumeOptions = { ...defaultOptions, ...options }

    let updatedSession: SessionState = {
      ...session,
      isPaused: false,
      lastActiveTime: Date.now(),
    }

    // If restarting current situation, reset to I1 but keep thought record
    if (resumeOptions.restartCurrentSituation) {
      updatedSession = {
        ...updatedSession,
        currentIntent: 'I1',
        messagesInCurrentIntent: 0,
      }
    }

    return updatedSession
  }

  /**
   * Mark session as complete
   *
   * Called when user has finished the full CBT cycle (I1-I8)
   *
   * @param session - Current session state
   * @returns Updated session state
   */
  completeSession(session: SessionState): SessionState {
    return {
      ...session,
      isComplete: true,
      lastActiveTime: Date.now(),
    }
  }

  /**
   * Reset session to start a new thought record
   *
   * Preserves conversation history but resets intent and thought record
   *
   * @param session - Current session state
   * @returns Updated session state
   */
  resetForNewThoughtRecord(session: SessionState): SessionState {
    return {
      ...session,
      currentIntent: 'I1',
      currentThoughtRecord: {},
      messagesInCurrentIntent: 0,
      isComplete: false,
      lastActiveTime: Date.now(),
    }
  }

  /**
   * Check if user has been inactive for too long
   *
   * @param session - Session to check
   * @param thresholdMs - Inactivity threshold in milliseconds
   * @returns True if session is stale
   */
  isStale(session: SessionState, thresholdMs: number = 3600000): boolean {
    const inactiveTime = Date.now() - session.lastActiveTime
    return inactiveTime > thresholdMs
  }

  /**
   * Check if user seems stuck on current intent
   *
   * If user has sent many messages without progressing,
   * they may need help or clarification
   *
   * @param session - Session to check
   * @param threshold - Message threshold (default 5)
   * @returns True if user seems stuck
   */
  isUserStuck(session: SessionState, threshold: number = 5): boolean {
    return session.messagesInCurrentIntent >= threshold
  }

  /**
   * Get the last assistant message from conversation
   *
   * Useful for "repeat" functionality
   *
   * @param session - Current session
   * @returns Last assistant message or null
   */
  getLastAssistantMessage(session: SessionState): string | null {
    // Find last message that's not from "You" (the user)
    for (let i = session.conversation.length - 1; i >= 0; i--) {
      const msg = session.conversation[i]
      if (msg && msg.user !== 'You') {
        return msg.text
      }
    }
    return null
  }

  /**
   * Generate a unique session ID
   *
   * @returns Random session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}
