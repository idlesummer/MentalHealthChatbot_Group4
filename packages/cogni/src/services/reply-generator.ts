/**
 * ReplyGenerator Service
 *
 * Responsible for generating therapeutic replies using structured output.
 * This service abstracts the model invocation with type-safe structured output,
 * ensuring consistency and reliability in response generation.
 */

import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { Runnable } from '@langchain/core/runnables'
import { z } from 'zod'

/** Schema for reply generation output */
const replyGenerationSchema = z.object({
  reply: z.string().describe('The therapeutic reply to the user\'s message'),
})

/** Type definition for reply generation result */
export interface ReplyGenerationResult {
  reply: string
}

/**
 * Service for generating therapeutic replies with structured output
 *
 * This service uses LangChain's structured output feature to ensure
 * that the model always returns a properly formatted response.
 * It follows the same pattern as the DistortionClassifier service.
 *
 * @example
 * ```typescript
 * const generator = new ReplyGenerator(model)
 * const result = await generator.generate(prompt)
 * console.log(result.reply)
 * ```
 */
export class ReplyGenerator {
  private generator: Runnable

  constructor(model: BaseChatModel) {
    // Create structured output model for reply generation
    this.generator = model.withStructuredOutput(replyGenerationSchema)
  }

  /**
   * Generate a therapeutic reply using the provided prompt
   *
   * @param prompt - The formatted prompt messages to send to the model
   * @returns A validated reply generation result with structured output
   */
  async generate(prompt: unknown): Promise<ReplyGenerationResult> {
    const result: ReplyGenerationResult = await this.generator.invoke(prompt)
    return result
  }
}
