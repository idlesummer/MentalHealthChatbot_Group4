# Intent Evaluation Bug Report

## Issue Summary

The intent transition evaluator is completing intents too early, advancing to the next stage even when the user's message doesn't meet the completion criteria defined in `INTENT_COMPLETION_REGISTRY`.

## Root Cause

**Location:** `/home/user/cogni/src/services/intent-manager.ts:60`

The `technique` parameter is being ignored during intent evaluation. Instead, the technique is hardcoded to `'persona'`:

```typescript
private async evaluateTransition(
  state: string,
  input: string,
  context: Message[],
  meta?: string,
): Promise<IntentTransition> {
  const PROMPT_DATA = this.config.promptData
  const intentData = this.getIntentDataForTechnique(state, 'persona', PROMPT_DATA)  // ⚠️ Hardcoded
  const completionRule = meta ?? 'Decide completion conservatively but fairly.'

  const prompt = this.config.promptBuilder.buildIntentEvaluationPrompt({
    state,
    input,
    context,
    intentData,
    completionRule,
  })

  return this.config.intentEvaluator.invoke(prompt)
}
```

## The Problem

When building the intent evaluation prompt (`src/services/prompt-builder.ts:64-80`), the LLM receives TWO different completion criteria:

1. **The authoritative completion rule** (from `INTENT_COMPLETION_REGISTRY`):
   ```
   Complete only if the user described a clear situation AND at least one contextual details
   (e.g., what happened, when or where it occurred, who was involved, or why it mattered).
   Incomplete if no additional context
   ```

2. **The persona's system prompt** (from `INTENT_PROMPTS_PERSONA`):
   ```
   Consider Step 1 complete when at least one of the 'who, what, where, and when'
   of the triggering event are clear enough to summarize neutrally.
   ```

The persona prompt's more lenient criteria ("clear enough to summarize neutrally") conflicts with the strict completion rule requiring explicit contextual details.

## Example Failure Case

**User Message:** "I failed my math exam and I feel terrible about it."

**Expected Behavior:** Should stay in I1 (needs more context - when? where? specific circumstances?)

**Actual Behavior:** Advances to I2

**Why it fails:**
- Has "what" (failed exam) ✅
- Has implicit "who" (the user) ✅
- Missing "when" and "where" ❌
- Missing specific circumstances ❌

The persona prompt considers this "clear enough to summarize neutrally" even though it lacks the explicit contextual details required by the completion rule.

## Impact

- **All prompt techniques are affected** (default, few-shot, chain-of-thought, plan-and-solve) because they all get persona prompts during evaluation
- Intents complete prematurely, especially for techniques that should have stricter criteria
- The `technique` parameter in `computeNextIntent()` is effectively ignored for evaluation

## Solution Options

### Option 1: Remove technique-specific prompts from evaluation (Recommended)

The intent evaluator should ONLY use the completion rule, not technique-specific system prompts:

```typescript
private async evaluateTransition(
  state: string,
  input: string,
  context: Message[],
  meta?: string,
): Promise<IntentTransition> {
  const completionRule = meta ?? 'Decide completion conservatively but fairly.'

  const prompt = [
    'You are an intent transition evaluator for a CBT chatbot.',
    `Use the conversation history to inform your decision:\n${context.map(m => `${m.user}: ${m.text}`).join('\n')}`,
    `Current Intent: ${state}`,
    `User message: '${input}'`,
    '',
    'Return strictly this JSON: { moveToNextIntent: boolean, confidence: number (0-1), reason: string }',
    '',
    `DECISION RULE (authoritative): ${completionRule}`,
    '',
    'If the reason indicates that the goal is fulfilled, this should be reflected in the confidence in order to move to the next intent.',
  ].join('\n')

  return this.config.intentEvaluator.invoke(prompt)
}
```

### Option 2: Use the correct technique

Pass the `technique` parameter through and use it:

```typescript
async computeNextIntent(
  intent: string,
  message: string,
  conversation: Message[],
  technique?: PromptTechnique,
): Promise<string | null> {
  try {
    // Pass technique to state machine
    const { nextState } = await this.stateMachine.step(
      intent,
      message,
      conversation,
      technique  // ⚠️ Currently not passed
    )
    return nextState
  } catch (err) {
    console.error('[IntentManager.computeNextIntent] Error invoking model:', err)
    return intent
  }
}
```

This would require updating the `StateMachine` to accept and use the technique parameter.

### Option 3: Different evaluators per technique

Create technique-specific intent evaluators that are optimized for each prompt style.

## Recommendation

**Option 1** is recommended because:
- Intent completion criteria should be consistent across all techniques
- The completion rules in `INTENT_COMPLETION_REGISTRY` are already well-defined
- Simpler and less error-prone
- Technique-specific guidance belongs in response generation, not evaluation

## Files Affected

- `/home/user/cogni/src/services/intent-manager.ts` - Contains the bug
- `/home/user/cogni/src/services/prompt-builder.ts` - Builds the problematic prompt
- `/home/user/cogni/src/constants/intents.ts` - Contains authoritative completion rules

## Notes

This bug was introduced during the refactoring to service-oriented architecture (commit `23f88cb`). The original code in `src/core/intent.ts` had the same hardcoded 'persona' issue, suggesting it may have been a pre-existing bug that was carried over during refactoring.
