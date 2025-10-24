'use server'
import { ChatOpenAI } from '@langchain/openai'
import { INTENT_PROMPTS_FEWSHOT, computeNextIntent } from '@/lib/ai/intent'
import { z } from 'zod'
import { COGNITIVE_DISTORTION_KEYS, identifyCognitiveDistortions } from '@/lib/ai/distortion'

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

async function buildPrompt(message: string, intent: string, prompt: string, messages: any): Promise<string> {
  const distortionIdentified = await identifyCognitiveDistortions(message, classify);
  const distortion = distortionIdentified.distortion;
  const intentData = INTENT_PROMPTS_FEWSHOT[intent as keyof typeof INTENT_PROMPTS_FEWSHOT];
  return [
    `You are a CBT-based assistant helping the user manage their thoughts and emotions.`,
    `Use this conversation history to inform your response:\n${messages.map((m: any) => `${m.user}: ${m.text}`).join("\n")}`,
    `Use the following guidelines for this stage:\n${intentData.system}`,
    `Identified Cognitive Distortion: ${distortion}.`,
    `\nUser Message:\n"${message}"`,
    `\nPlease respond in a way that aligns with the user's CBT stage and identified distortion.`,
  ].join("\n");
}

export async function generateResponse(message: string, intent: string, distortion: string, prompt: string, messages: any) {
  // const response = "You are a supportive mental health assistant and the user just said: " + message + ". Respond with empathy and understanding.";
  const response = await buildPrompt(message, intent, prompt, messages);
  console.log("FINAL PROMPT: ", response);
  const reply = await model.invoke(response); 
  const nextIntent = computeNextIntent(intent);
  return { reply: reply.text, identifiedIntent: nextIntent };
}