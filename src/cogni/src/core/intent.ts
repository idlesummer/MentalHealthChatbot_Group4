/**
 * Intent Management Module
 *
 * This module handles the CBT intent progression system, including:
 * - Intent routing (I1→I2→I3...→I8→I1)
 * - Completion rule definitions
 * - Intent transition evaluation
 */

import { CHOSEN_PROMPT } from "../prompts";
import {
  Intent,
  IntentPromptConfig,
  IntentPromptMap,
  IntentTransitionResult,
  Message,
  PromptTechnique,
  StructuredOutputModel,
} from "./types";

/**
 * Intent routing map - defines the progression through CBT stages
 */
const INTENT_ROUTES: Record<string, string | null> = {
  I1: "I2",
  I2: "I3",
  I3: "I4",   // after initial rating, proceed to evidence-for
  I4: "I5",
  I5: "I6",   // after evidence against, go to alternative thought
  I6: "I7",   // after alternative thought, go to mood re-rating
  I7: "I8",
  I8: "I1"   // cycle complete, restart
};

/**
 * Completion rules for each intent
 * These define when an intent stage is considered complete
 */
const COMPLETION_RULES: Record<string, string> = {
  I1: "Complete only if the user described a clear situation or event that triggered distress AND at least one contextual details (e.g., what happened, when or where it occurred, who was involved, or why it mattered). Incomplete if no additional context",
  I2: "Complete if the user expressed an automatic thought — an immediate, self-referential interpretation or belief that arose from the situation (e.g., 'I'm not good enough', 'They must hate me'). Descriptions of feelings alone do not count.",
  I3: "Complete if the user described the intensity of their emotional response — either by providing a numeric rating (1–100) or clear qualitative strength (e.g., 'mild', 'very strong', 'crushing').",
  I4: "Complete if the user has provided an example that supports the user's automatic thought.",
  I5: "Complete if the user has identified at least one example that contradicts or weakens their automatic thought — showing they can recognize exceptions, counterexamples, or alternative explanations.",
  I6: "Complete if the user articulated a believable, self-compassionate, and more balanced alternative thought that responds to their earlier automatic thought, demonstrating cognitive restructuring.",
  I7: "Complete if the user described a shift or re-rating of their emotional intensity compared to Step 3 — either explicitly (new number) or implicitly (e.g., 'I feel lighter', 'still the same', 'less anxious').",
  I8: "Complete if the user acknowledged or agreed to a practical coping strategy they feel willing or able to try, indicating closure of the current CBT cycle.",
};

/**
 * Computes the next intent based on the current state and user message
 *
 * @param currentIntent - The current intent (I1-I8)
 * @param evaluationModel - A structured output model for evaluating intent transitions
 * @param message - The user's latest message
 * @param messages - Full conversation history
 * @param promptTechnique - The selected prompt technique
 * @returns The next intent to transition to (or current if staying)
 */
export async function computeNextIntent(
  currentIntent: string,
  evaluationModel: StructuredOutputModel<IntentTransitionResult>,
  message: string,
  messages: Message[],
  promptTechnique: PromptTechnique
): Promise<string | null> {
  const PROMPT_DATA = CHOSEN_PROMPT[promptTechnique] as IntentPromptMap | null;
  const intentData = PROMPT_DATA?.[currentIntent] ?? ({
    role: "Default CBTT-base assistant",
    system: "Use general CBT-based guidance to assist the user."
  } as IntentPromptConfig);

  const completionRule = COMPLETION_RULES[currentIntent] ?? "Decide completion conservatively but fairly.";
  if (!intentData) {
    console.warn(`[Intent] Unknown current intent: ${currentIntent}`);
    return currentIntent;
  }

  const MainPrompt = [
    `You are an intent transition evaluator for a CBT chatbot.`,
    `Use the conversation history to inform your decision:\n${messages.map((m: Message) => `${m.user}: ${m.text}`).join("\n")}`,
    `Current Intent: ${currentIntent} (${intentData.role})`,
    `User message: "${message}"`,
    ``,
    `Return strictly this JSON: { moveToNextIntent: boolean, confidence: number (0–1), reason: string }`,
    ``,
    `DECISION RULE (authoritative): ${completionRule}`,
    ``,
    `If the reason indicates that the goal is fulfilled, this should be reflected in the confidence in order to move to the next intent.`,
    `Intent description (for context):`,
    intentData.system,
  ].join("\n");

  try {
    const response = await evaluationModel.invoke(MainPrompt);
    console.log(" NEXT INTENT DECISION:");
    console.log(response);

    const shouldAdvance = response.moveToNextIntent && response.confidence > 0.5;
    const next = shouldAdvance ? INTENT_ROUTES[currentIntent] ?? null : currentIntent;

    console.log(`➡️ Move to: ${next} (confidence: ${response.confidence.toFixed(2)})`);
    console.log(`Reason: ${response.reason}`);

    return next;
  } catch (err) {
    console.error("[computeNextIntent] Error invoking model:", err);
    return currentIntent;
  }
}

/**
 * Get all available intents in order
 */
export function getIntents(): Intent[] {
  return ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8"];
}

/**
 * Get the initial intent for a new session
 */
export function getInitialIntent(): Intent {
  return "I1";
}

/**
 * Get the completion rule for a specific intent
 */
export function getCompletionRule(intent: string): string {
  return COMPLETION_RULES[intent] ?? "Decide completion conservatively but fairly.";
}

/**
 * Get the next intent in the routing sequence
 */
export function getNextIntentRoute(currentIntent: string): string | null {
  return INTENT_ROUTES[currentIntent] ?? null;
}

/**
 * Export intent routes and completion rules for reference
 */
export { INTENT_ROUTES, COMPLETION_RULES };
