/**
 * ReplyParser Service
 *
 * Responsible for parsing LLM responses into usable formats.
 * Handles different response structures from various LLM providers.
 */

/**
 * Service for parsing LLM responses
 */
export class ReplyParser {
  /**
   * Parse an LLM response into a string
   *
   * Handles different response formats from various LLM providers:
   * - Plain strings
   * - Objects with 'text' property
   * - Objects with 'content' property
   * - Any other type (converts to string)
   *
   * @param response - The LLM response to parse
   * @returns The response as a string
   */
  parse(response: unknown): string {
    if (typeof response === 'string')
      return response

    if (typeof response === 'object' && response !== null) {
      if ('text' in response && typeof response.text === 'string')
        return response.text

      if ('content' in response && typeof response.content === 'string')
        return response.content
    }

    return String(response)
  }
}
