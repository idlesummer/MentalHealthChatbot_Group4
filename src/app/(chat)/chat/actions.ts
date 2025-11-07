'use server'
import { ChatOpenAI } from '@langchain/openai'
import { computeNextIntent } from '@/lib/ai/intent'
import { z } from 'zod'
import { COGNITIVE_DISTORTION_KEYS, identifyCognitiveDistortions } from '@/lib/ai/distortion'
import { CHOSEN_PROMPT, IntentPromptMap, IntentPromptConfig } from '@/lib/ai/intent' 

// All functions that call APIs is will be defined here

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const classify = model.withStructuredOutput(
  z.object({
    distortion: z.enum(COGNITIVE_DISTORTION_KEYS),
    confidence: z.number().min(0).max(1),
    rationale: z.string(),
  })
);

const SystemResponse = model.withStructuredOutput(
  z.object({
    response: z.string(),
    moveToNextIntent: z.boolean(),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  })
);

const determine = model.withStructuredOutput(
  z.object({
    moveToNextIntent: z.boolean(),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  })
);

async function buildPrompt(message: string, intent: string, prompt: string, messages: any): Promise<string> {
  const distortionIdentified = await identifyCognitiveDistortions(message, classify);
  const distortion = distortionIdentified.distortion;
  const PROMPT_DATA = CHOSEN_PROMPT[prompt] as IntentPromptMap | null;
  const intentData = PROMPT_DATA?.[intent] ?? ({
    role: "Default CBTT-base assistant",
    system: "Use general CBT-based guidance to assist the user."
  } as IntentPromptConfig);

  console.log("PROMPT DATA: \n", PROMPT_DATA);
  console.log("intentData: \n", intentData);
  ;
  return [
    `You are a CBT-based assistant helping the user manage their thoughts and emotions.`,
    `Use this conversation history to inform your response:\n${messages.map((m: any) => `${m.user}: ${m.text}`).join("\n")}`,
    `Use the following guidelines for this stage:\n${intentData.system}`,
    `Identified Cognitive Distortion: ${distortion}.`,
    `\nUser Message:\n"${message}"`,
    `\nPlease respond in a way that aligns with the user's CBT stage and identified distortion.`,
  ].join("\n");
}

export async function generateResponse(message: string, intent: string, prompt: string, messages: any) {
  const response = await buildPrompt(message, intent, prompt, messages);
  console.log("FINAL PROMPT: ", response);
  const reply = await model.invoke(response); 
  const nextIntent = computeNextIntent(intent, determine, message, messages, prompt);
  return { reply: reply.text, identifiedIntent: nextIntent };
}