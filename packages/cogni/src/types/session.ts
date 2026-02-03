/**
 * Session Management Types
 *
 * This module defines types for managing chat-based CBT sessions,
 * including state tracking, session metadata, and user commands.
 */

import type { Intent } from '@/services'
import type { Message } from '@/services'
import type { CognitiveDistortionClassification } from '@/services'

/**
 * Represents a partial thought record being built during a CBT session
 * Each field is optional as it gets populated step by step through the intents
 */
export interface ThoughtRecord {
  /** The triggering situation (from I1) */
  situation?: string
  /** The automatic thought that arose (from I2) */
  automaticThought?: string
  /** Initial emotion intensity rating 0-100 (from I3) */
  initialMoodRating?: number
  /** Evidence supporting the automatic thought (from I4) */
  evidenceFor?: string[]
  /** Evidence contradicting the automatic thought (from I5) */
  evidenceAgainst?: string[]
  /** Alternative balanced thought (from I6) */
  alternativeThought?: string
  /** Re-rated emotion intensity after reframing (from I7) */
  finalMoodRating?: number
  /** Coping strategy for future situations (from I8) */
  copingStrategy?: string
  /** Detected cognitive distortion */
  distortion?: CognitiveDistortionClassification
}

/**
 * Session state that tracks a user's progress through CBT
 * This enables pause/resume functionality and session management
 */
export interface SessionState {
  /** Unique session identifier */
  id: string
  /** User identifier */
  userId: string
  /** When the session started */
  startTime: number
  /** Last time the user sent a message */
  lastActiveTime: number
  /** Current intent/stage in the CBT process */
  currentIntent: Intent
  /** The thought record being built */
  currentThoughtRecord: ThoughtRecord
  /** Full conversation history */
  conversation: Message[]
  /** Whether the session is paused */
  isPaused: boolean
  /** Whether the session has completed the full cycle */
  isComplete: boolean
  /** Number of messages sent in the current intent (for tracking if user is stuck) */
  messagesInCurrentIntent: number
}

/**
 * User commands that can be detected in messages
 */
export enum UserCommand {
  /** User wants to restart the CBT exercise */
  RESTART = 'restart',
  /** User wants to hear the last message again */
  REPEAT = 'repeat',
  /** User wants to pause or is feeling overwhelmed */
  PAUSE = 'pause',
  /** User is asking for help */
  HELP = 'help',
  /** User wants to end the session */
  END = 'end',
  /** No command detected */
  NONE = 'none',
}

/**
 * Result of command detection
 */
export interface CommandDetectionResult {
  /** The detected command, or NONE if no command found */
  command: UserCommand
  /** Confidence score 0-1 */
  confidence: number
  /** The original message that was analyzed */
  originalMessage: string
}

/**
 * Options for creating a new session
 */
export interface CreateSessionOptions {
  /** User identifier */
  userId: string
  /** Optional session ID (generated if not provided) */
  sessionId?: string
  /** Initial intent (defaults to I1) */
  initialIntent?: Intent
}

/**
 * Options for resuming a session
 */
export interface ResumeSessionOptions {
  /** Whether to continue from where user left off */
  continueFromLastIntent: boolean
  /** Whether to start fresh on the same situation */
  restartCurrentSituation: boolean
}
