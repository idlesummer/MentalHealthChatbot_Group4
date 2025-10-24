export const COGNITIVE_DISTORTION_KEYS = [
  "All-or-Nothing Thinking",
  "Overgeneralization",
  "Mental Filtering",
  "Discounting the Positive",
  "Jumping to Conclusions",
  "Catastrophizing",
  "Emotional Reasoning",
  "Should Statements",
  "Labeling",
  "Personalization & Blame",
] as const;


type CognitiveDistortion = typeof COGNITIVE_DISTORTION_KEYS[number];

const COGNITIVE_DISTORTIONS: Record<CognitiveDistortion, string> = {
  "All-or-Nothing Thinking": "Seeing things as all good or all bad — no gray area.",
  "Overgeneralization": "Taking one event and applying it broadly ('I always mess things up').",
  "Mental Filtering": "Focusing only on the negative and ignoring the positive.",
  "Discounting the Positive": "Rejecting positive experiences by insisting they don’t count.",
  "Jumping to Conclusions": "Making negative interpretations without evidence.",
  "Catastrophizing": "Exaggerating the importance of problems or imagining the worst-case scenario.",
  "Emotional Reasoning": "Believing that negative feelings reflect reality ('I feel it, so it must be true').",
  "Should Statements": "Using rigid rules on yourself or others ('I should always do well').",
  "Labeling": "Assigning global negative labels to yourself or others ('I’m a failure').",
  "Personalization & Blame": "Blaming yourself for things outside your control, or blaming others excessively.",
};

export async function identifyCognitiveDistortions(message: string, classify: any) {
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

  const res = await classify.invoke([
    { role: "system", content: system },
    {
      role: "user",
      content: `Options:\n${optionsList}\n\nUser text:\n"""${message}"""`,
    },
  ]);

  console.log("RES: ", res);
  return res; 
}

