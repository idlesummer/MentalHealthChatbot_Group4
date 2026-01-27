/**
 * Basic Usage Example - Cogni CBT Engine
 *
 * This example demonstrates:
 * - Setting up the CogniEngine
 * - Generating a single CBT response
 * - Inspecting the result (reply, next intent, cognitive distortion)
 */

import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { CogniEngine, COGNITIVE_DISTORTION_KEYS } from '../../../src/cogni/src/index.js';

// ============================================================================
// SETUP
// ============================================================================

console.log('🧠 Cogni CBT Engine - Basic Usage Example\n');

// Check for API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
  console.error('💡 Copy .env.example to .env and add your OpenAI API key');
  process.exit(1);
}

// ============================================================================
// CONFIGURE LLM MODELS
// ============================================================================

console.log('⚙️  Setting up LLM models...');

const mainModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const distortionClassifier = mainModel.withStructuredOutput(
  z.object({
    distortion: z.enum(COGNITIVE_DISTORTION_KEYS),
    confidence: z.number().min(0).max(1),
    rationale: z.string(),
  })
);

const intentEvaluator = mainModel.withStructuredOutput(
  z.object({
    moveToNextIntent: z.boolean(),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  })
);

// ============================================================================
// CREATE COGNI ENGINE
// ============================================================================

console.log('🚀 Initializing Cogni Engine...\n');

const engine = new CogniEngine({
  mainModel,
  distortionClassifier,
  intentEvaluator,
});

// ============================================================================
// GENERATE A CBT RESPONSE
// ============================================================================

async function basicExample() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Example: User shares a distressing situation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const userMessage = "I failed my math exam and I feel terrible about it.";

  console.log(`👤 User: "${userMessage}"\n`);
  console.log('⏳ Processing...\n');

  const result = await engine.generateResponse({
    message: userMessage,
    currentIntent: "I1",  // Start with Situation Identification
    conversationHistory: [],
    promptTechnique: "persona",
  });

  // ============================================================================
  // DISPLAY RESULTS
  // ============================================================================

  console.log('✅ Response Generated!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💬 ASSISTANT REPLY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(result.reply);
  console.log();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 METADATA:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🎯 Current Intent:  I1 (Situation Identification)`);
  console.log(`➡️  Next Intent:     ${result.nextIntent}`);
  console.log();

  if (result.cognitiveDistortion) {
    console.log('🧩 COGNITIVE DISTORTION DETECTED:');
    console.log(`   Type:       ${result.cognitiveDistortion.distortion}`);
    console.log(`   Confidence: ${(result.cognitiveDistortion.confidence * 100).toFixed(0)}%`);
    console.log(`   Rationale:  ${result.cognitiveDistortion.rationale}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ============================================================================
  // SHOW AVAILABLE OPTIONS
  // ============================================================================

  console.log('📚 AVAILABLE OPTIONS:\n');
  console.log('Intents:', engine.getIntents().join(', '));
  console.log('Techniques:', engine.getPromptTechniques().join(', '));
  console.log();
}

// ============================================================================
// RUN THE EXAMPLE
// ============================================================================

basicExample()
  .then(() => {
    console.log('✨ Example completed successfully!\n');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
