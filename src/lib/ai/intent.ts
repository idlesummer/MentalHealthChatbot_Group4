import { INTENT_PROMPTS_FEWSHOT } from "../blueprints/Fewshot";
import { INTENT_PROMPTS_COT } from "../blueprints/ChainOfThought";
import { INTENT_PROMPTS_PERSONA } from "../blueprints/Persona";

const INTENT_ROUTES: Record<string, string | null> = {
  I1: "I2",
  I2: "I3",
  I3: "I4",   // after initial rating, proceed to evidence-for
  I4: "I5",
  I5: "I6",   // after evidence against, go to re-rating
  I6: "I7",   // after re-rating, go to coping
  I7: "I1",   // end
};

const COMPLETION_RULES: Record<string, string> = {
  I1: "Complete if user described a specific situation/event with at least two concrete detail (what/when/where/who/impact).",
  I2: "Complete if user stated an automatic thought (their self-talk line) tied to the situation.",
  I3: "Complete if user provided a single intensity rating (number) or clearly-ranked intensity.",
  I4: "Complete if inside the full conversation has provided at least an evidence for and against their automatic thought.",
  I5: "Complete if user articulated a believable, kinder, more balanced alternative thought.",
  I6: "Complete if user re-rates mood or clearly describes shift (up/down/same).",
  I7: "Complete if user acknowledges a coping step they’re willing to try and session can close.",
};

export async function computeNextIntent(
  current: string,
  model: any,
  message: string,
  messages: any
): Promise<string | null> {
  const intentData = INTENT_PROMPTS_FEWSHOT[
    current as keyof typeof INTENT_PROMPTS_FEWSHOT
  ];

  const completionRule = COMPLETION_RULES[current] ?? "Decide completion conservatively but fairly.";
  if (!intentData) {
    console.warn(`[Intent] Unknown current intent: ${current}`);
    return current;
  }

  const prompt = [
    `You are an intent transition evaluator for a CBT chatbot.`,
    `Use the conversation history to inform your decision:\n${messages.map((m: any) => `${m.user}: ${m.text}`).join("\n")}`,
    `Current Intent: ${current} (${intentData.role})`,
    `User message: "${message}"`,
    ``,
    `Return strictly this JSON: { moveToNextIntent: boolean, confidence: number (0–1), reason: string }`,
    ``,
    `DECISION RULE (authoritative): ${completionRule}`,
    ``,
    `Intent description (for context):`,
    intentData.system,
  ].join("\n");

  try {
    const response = await model.invoke(prompt);
    console.log("🧭 NEXT INTENT DECISION:");
    console.log(response);

    const shouldAdvance = response.moveToNextIntent && response.confidence > 0.5;
    const next = shouldAdvance ? INTENT_ROUTES[current] ?? null : current;

    console.log(`➡️ Move to: ${next} (confidence: ${response.confidence.toFixed(2)})`);
    console.log(`Reason: ${response.reason}`);

    return next;
  } catch (err) {
    console.error("[computeNextIntent] Error invoking model:", err);
    return current;
  }
}
