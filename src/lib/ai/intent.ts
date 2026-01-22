import { INTENT_PROMPTS_FEWSHOT } from "../blueprints/Fewshot";
import { INTENT_PROMPTS_COT } from "../blueprints/ChainOfThought";
import { INTENT_PROMPTS_PERSONA } from "../blueprints/Persona";
import { INTENT_PROMPTS_PAS } from "../blueprints/PlanAndSolve";


export type IntentPromptConfig = {
    role: string;
    system: string;
};

export type IntentPromptMap =  Record<string, IntentPromptConfig>;


export const CHOSEN_PROMPT: Record<string, IntentPromptMap | null> = {
  "default": null,
  "few-shot": INTENT_PROMPTS_FEWSHOT,
  "chain-of-thought": INTENT_PROMPTS_COT,
  "persona": INTENT_PROMPTS_PERSONA,
  "plan-and-solve": INTENT_PROMPTS_PAS
}

export type Intent = 'I1' | 'I2' | 'I3' | 'I4' | 'I5' | 'I6' | 'I7' | 'I8';

const INTENT_ROUTES: Record<string, string | null> = {
  I1: "I2",
  I2: "I3",
  I3: "I4",   // after initial rating, proceed to evidence-for
  I4: "I5",
  I5: "I6",   // after evidence against, go to re-rating
  I6: "I7",   // after re-rating, go to coping
  I7: "I8",
  I8: "I1"   // end
};

const COMPLETION_RULES: Record<string, string> = {
  I1: "Complete only if the user described a clear situation or event that triggered distress AND at least one contextual details (e.g., what happened, when or where it occurred, who was involved, or why it mattered). Incomplete if no additional context",
  I2: "Complete if the user expressed an automatic thought — an immediate, self-referential interpretation or belief that arose from the situation (e.g., 'I’m not good enough', 'They must hate me'). Descriptions of feelings alone do not count.",
  I3: "Complete if the user described the intensity of their emotional response — either by providing a numeric rating (1–100) or clear qualitative strength (e.g., 'mild', 'very strong', 'crushing').",
  I4: "Complete if the user has provided an example that supports the user's automatic thought.",
  I5: "Complete if the user has identified at least one example that contradicts or weakens their automatic thought — showing they can recognize exceptions, counterexamples, or alternative explanations.",
  I6: "Complete if the user articulated a believable, self-compassionate, and more balanced alternative thought that responds to their earlier automatic thought, demonstrating cognitive restructuring.",
  I7: "Complete if the user described a shift or re-rating of their emotional intensity compared to Step 3 — either explicitly (new number) or implicitly (e.g., 'I feel lighter', 'still the same', 'less anxious').",
  I8: "Complete if the user acknowledged or agreed to a practical coping strategy they feel willing or able to try, indicating closure of the current CBT cycle.",
};

export async function computeNextIntent(
  currentIntent: string,
  model: any,
  message: string,
  messages: any,
  prompt: string
): Promise<string> {
  const PROMPT_DATA = CHOSEN_PROMPT[prompt] as IntentPromptMap | null;
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
    `Use the conversation history to inform your decision:\n${messages.map((m: any) => `${m.user}: ${m.text}`).join("\n")}`,
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
    const response = await model.invoke(MainPrompt);
    console.log(" NEXT INTENT DECISION:");
    console.log(response);

    const shouldAdvance = response.moveToNextIntent && response.confidence > 0.5;
    const next = shouldAdvance ? (INTENT_ROUTES[currentIntent] ?? currentIntent) : currentIntent;

    console.log(`➡️ Move to: ${next} (confidence: ${response.confidence.toFixed(2)})`);
    console.log(`Reason: ${response.reason}`);

    return next;
  } catch (err) {
    console.error("[computeNextIntent] Error invoking model:", err);
    return currentIntent;
  }
}
