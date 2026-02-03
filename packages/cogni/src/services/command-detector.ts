/**
 * CommandDetector Service
 *
 * Responsible for detecting user commands in messages.
 * Uses pattern matching to identify when users want to restart, pause,
 * repeat, get help, or end the session.
 *
 * This service is stateless and uses simple pattern matching for reliability.
 * For a more advanced implementation, this could use an LLM classifier.
 */

import { UserCommand, type CommandDetectionResult } from '@/types'

/**
 * Pattern definitions for each command type
 * Each pattern is a regular expression that matches common phrases
 */
const COMMAND_PATTERNS: Record<UserCommand, RegExp | null> = {
  [UserCommand.RESTART]: /\b(restart|start over|start again|new topic|different situation|fresh start|begin again|reset)\b/i,
  [UserCommand.REPEAT]: /\b(repeat|again|what did you say|come again|say that again|huh|what\?|pardon|can you repeat)\b/i,
  [UserCommand.PAUSE]: /\b(pause|stop|wait|hold on|too much|overwhelmed|need a break|tired|exhausted|enough for now)\b/i,
  [UserCommand.HELP]: /\b(help|stuck|confused|don't understand|what do i do|how does this work|explain|what is this)\b/i,
  [UserCommand.END]: /\b(bye|goodbye|end|quit|exit|done|finish|that's all|I'm good|thanks bye)\b/i,
  [UserCommand.NONE]: null, // Not a pattern-based command
}

/**
 * Service for detecting user commands in messages
 *
 * This service analyzes user messages to detect special commands like
 * "restart", "help", "pause", etc. It uses pattern matching for fast,
 * reliable detection without requiring LLM calls.
 *
 * @example
 * ```typescript
 * const detector = new CommandDetector()
 * const result = detector.detect("I want to start over")
 * // result.command === UserCommand.RESTART
 * ```
 */
export class CommandDetector {
  /**
   * Detect if a user message contains a command
   *
   * @param message - The user's message to analyze
   * @returns Detection result with command type and confidence
   */
  detect(message: string): CommandDetectionResult {
    // Trim and normalize the message
    const normalized = message.trim().toLowerCase()

    // Check each command pattern
    for (const [command, pattern] of Object.entries(COMMAND_PATTERNS)) {
      if (pattern && pattern.test(normalized)) {
        return {
          command: command as UserCommand,
          confidence: this.calculateConfidence(normalized, pattern),
          originalMessage: message,
        }
      }
    }

    // No command detected
    return {
      command: UserCommand.NONE,
      confidence: 1.0,
      originalMessage: message,
    }
  }

  /**
   * Check if a message contains a specific command
   *
   * @param message - The user's message
   * @param command - The command to check for
   * @returns True if the command is detected
   */
  hasCommand(message: string, command: UserCommand): boolean {
    const result = this.detect(message)
    return result.command === command
  }

  /**
   * Calculate confidence score based on pattern match quality
   *
   * This is a simple heuristic:
   * - Exact keyword match = high confidence
   * - Match in longer message = slightly lower confidence
   * - Multiple command words = highest confidence
   *
   * @param message - Normalized message
   * @param pattern - The matched pattern
   * @returns Confidence score 0-1
   */
  private calculateConfidence(message: string, pattern: RegExp): number {
    const matches = message.match(pattern)
    if (!matches) return 0

    // Base confidence
    let confidence = 0.85

    // If the entire message is just the command (very confident)
    if (message.replace(/[^a-z]/gi, '') === matches[0].replace(/[^a-z]/gi, '')) {
      confidence = 0.95
    }

    // If message is very short and contains command (high confidence)
    if (message.length < 20) {
      confidence = Math.max(confidence, 0.9)
    }

    return confidence
  }

  /**
   * Get all commands that match a message
   *
   * Sometimes a message might match multiple patterns.
   * This returns all matches sorted by confidence.
   *
   * @param message - The user's message
   * @returns Array of detection results, sorted by confidence
   */
  detectAll(message: string): CommandDetectionResult[] {
    const results: CommandDetectionResult[] = []
    const normalized = message.trim().toLowerCase()

    for (const [command, pattern] of Object.entries(COMMAND_PATTERNS)) {
      if (pattern && pattern.test(normalized)) {
        results.push({
          command: command as UserCommand,
          confidence: this.calculateConfidence(normalized, pattern),
          originalMessage: message,
        })
      }
    }

    // Sort by confidence descending
    return results.sort((a, b) => b.confidence - a.confidence)
  }
}
