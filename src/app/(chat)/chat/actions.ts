'use server'
import { ChatOpenAI } from '@langchain/openai'
import { INTENT_PROMPTS } from '@/lib/ai/intent'
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

export async function mockSendMessage(message: string) {
  // Simulate network or processing delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Mock bot reply
  const botReplies = [
    'Got it!',
    'That\'s interesting.',
    'Can you tell me more?',
    'Hmm, I see what you mean.',
    'Let\'s think about that together.',
  ]

  const index = Math.floor(Math.random() * botReplies.length)
  const reply = botReplies[index]
  return { reply }
}

async function buildPrompt(message: string, intent: string, prompt: string): Promise<string> {
  const distortionIdentified = await identifyCognitiveDistortions(message, classify);
  const distortion = distortionIdentified.distortion;

  console.log("Identified Distortion:", distortion);
  return [
    `You are a CBT-based assistant helping the user manage their thoughts and emotions.`,
    `Current CBT Stage: ${intent}.`,
    `Identified Cognitive Distortion: ${distortion}.`,
    `\nInstruction:\n${prompt}`,
    `\nUser Message:\n"${message}"`,
    `\nPlease respond in a way that aligns with the user's CBT stage and identified distortion.`,
  ].join("\n");
}

export async function generateResponse(message: string, intent: string, distortion: string, prompt: string) {
  // const response = "You are a supportive mental health assistant and the user just said: " + message + ". Respond with empathy and understanding.";
  const response = await buildPrompt(message, intent, prompt);
  const reply = await model.invoke(response); 
  return { reply: reply.text };
}