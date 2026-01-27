/**
 * Cognitive Distortion Detection Module
 *
 * This module identifies cognitive distortions in user messages using
 * the 10 cognitive distortions defined in CBT.
 */

import {
  COGNITIVE_DISTORTION_KEYS,
  CognitiveDistortion,
  CognitiveDistortionResult,
  StructuredOutputModel,
} from "./types";

/**
 * Descriptions of the 10 cognitive distortions
 */
const COGNITIVE_DISTORTIONS: Record<CognitiveDistortion, string> = {
  "All-or-Nothing Thinking": "Seeing things as all good or all bad — no gray area.",
  "Overgeneralization": "Taking one event and applying it broadly ('I always mess things up').",
  "Mental Filtering": "Focusing only on the negative and ignoring the positive.",
  "Discounting the Positive": "Rejecting positive experiences by insisting they don't count.",
  "Jumping to Conclusions": "Making negative interpretations without evidence.",
  "Catastrophizing": "Exaggerating the importance of problems or imagining the worst-case scenario.",
  "Emotional Reasoning": "Believing that negative feelings reflect reality ('I feel it, so it must be true').",
  "Should Statements": "Using rigid rules on yourself or others ('I should always do well').",
  "Labeling": "Assigning global negative labels to yourself or others ('I'm a failure').",
  "Personalization & Blame": "Blaming yourself for things outside your control, or blaming others excessively.",
};

/**
 * Identifies cognitive distortions in a user message
 *
 * @param message - The user's message to analyze
 * @param classifyModel - A structured output model that can classify text
 * @returns A cognitive distortion result with distortion, confidence, and rationale
 */
export async function identifyCognitiveDistortions(
  message: string,
  classifyModel: StructuredOutputModel<CognitiveDistortionResult>
): Promise<CognitiveDistortionResult> {
  const optionsList = COGNITIVE_DISTORTION_KEYS
    .map((k) => `- ${k}: ${COGNITIVE_DISTORTIONS[k]}`)
    .join("\n");

  const system = [
    "You are a CBT assistant.",
    "Classify the user's text into exactly one cognitive distortion from the provided list.",
    "If several apply, pick the best single fit.",
    "If there aren't any that fit, choose 'none'.",
    "Return JSON matching the schema exactly.",
  ].join(" ");

  const res = await classifyModel.invoke([
    { role: "system", content: system },
    {
      role: "user",
      content: `Options:\n${optionsList}\n\nUser text:\n"""${message}"""`,
    },
  ]);

  console.log("RES: ", res);
  return res;
}

/**
 * Export cognitive distortion keys and descriptions for reference
 */
export { COGNITIVE_DISTORTION_KEYS, COGNITIVE_DISTORTIONS };
