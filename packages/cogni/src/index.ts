/**
 * Cogni - Cognitive Behavioral Therapy Engine
 *
 * A standalone, reusable CBT pipeline implementation with support for:
 * - 8-stage intent-driven workflow (Situation → Thought → Mood → Evidence → Alternative → Re-rating → Coping)
 * - 10 cognitive distortion classifications
 * - 4 prompt engineering techniques (Persona, Few-shot, Chain-of-Thought, Plan-and-Solve)
 * - Flexible API for integration with any frontend or LLM backend
 */

// Re-export all public APIs from domain modules
export * from './api'
export * from './services'
export * from './prompts'
