/**
 * Complete Session Example - Cogni CBT Engine
 *
 * This example demonstrates a full CBT cycle through all 8 intents:
 * I1 (Situation) → I2 (Thought) → I3 (Mood) → I4 (Evidence For) →
 * I5 (Evidence Against) → I6 (Alternative) → I7 (Re-rating) → I8 (Coping)
 */

import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { CogniEngine, COGNITIVE_DISTORTION_KEYS, type Message } from '../../src/index.js';

// ============================================================================
// SETUP
// ============================================================================

console.log('🧠 Cogni CBT Engine - Complete Session Example\n');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found');
  console.error('💡 Copy .env.example to .env and add your API key');
  process.exit(1);
}

// ============================================================================
// CONFIGURE MODELS
// ============================================================================

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

const engine = new CogniEngine({
  mainModel,
  distortionClassifier,
  intentEvaluator,
});

// ============================================================================
// SIMULATED USER RESPONSES (for demo purposes)
// ============================================================================

const simulatedResponses: Record<string, string> = {
  I1: "My boss yelled at me during the team meeting yesterday in front of everyone.",
  I2: "I immediately thought 'I must be terrible at my job'.",
  I3: "I felt really anxious and embarrassed. I'd rate it about 80 out of 100.",
  I4: "Well, I have made some mistakes on recent projects that he pointed out.",
  I5: "Actually, I've also completed several projects ahead of schedule and received praise for them.",
  I6: "Maybe I'm not terrible at my job. I'm human and make mistakes, but I'm also capable of good work.",
  I7: "I feel lighter now, maybe around 40 out of 100. The anxiety has reduced quite a bit.",
  I8: "Yes, I think journaling about both my wins and mistakes could help me maintain perspective."
};

// ============================================================================
// CONVERSATION STATE
// ============================================================================

const conversationHistory: Message[] = [];
let currentIntent = "I1";
let turnNumber = 0;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addMessage(user: string, text: string) {
  conversationHistory.push({
    id: `msg-${turnNumber}`,
    user,
    text,
    ts: Date.now(),
  });
  turnNumber++;
}

function printSeparator(char: string = '━') {
  console.log(char.repeat(80));
}

function printIntent(intent: string) {
  const intentNames: Record<string, string> = {
    I1: "Situation Identification",
    I2: "Automatic Thought Identification",
    I3: "Mood Rating",
    I4: "Evidence For",
    I5: "Evidence Against",
    I6: "Alternative Thought Generation",
    I7: "Mood Re-rating",
    I8: "Coping Strategy Recommendation",
  };

  console.log(`\n🎯 INTENT: ${intent} - ${intentNames[intent]}`);
  printSeparator();
}

// ============================================================================
// MAIN SESSION LOOP
// ============================================================================

async function runCompleteSession() {
  console.log('Starting a complete CBT session...\n');
  console.log('This will simulate a user going through all 8 CBT stages.\n');

  printSeparator('═');
  console.log('                    🧘 CBT SESSION TRANSCRIPT');
  printSeparator('═');

  while (currentIntent !== "I1" || turnNumber === 0) {
    printIntent(currentIntent);

    // Get simulated user response for current intent
    const userMessage = simulatedResponses[currentIntent];

    if (!userMessage) {
      console.log('\n⚠️  No simulated response for', currentIntent);
      break;
    }

    // Display user message
    console.log(`\n👤 USER:`);
    console.log(`   "${userMessage}"`);
    addMessage("You", userMessage);

    // Generate assistant response
    console.log(`\n⏳ Processing...\n`);

    const result = await engine.generateResponse({
      message: userMessage,
      currentIntent,
      conversationHistory,
      promptTechnique: "persona",
    });

    // Display assistant reply
    console.log(`🤖 ASSISTANT:`);
    console.log(`   ${result.reply.split('\n').join('\n   ')}`);
    addMessage("Pebbles", result.reply);

    // Display metadata
    console.log(`\n📊 Metadata:`);
    console.log(`   Next Intent: ${result.nextIntent}`);
    if (result.cognitiveDistortion) {
      console.log(`   Distortion:  ${result.cognitiveDistortion.distortion} (${Math.round(result.cognitiveDistortion.confidence * 100)}%)`);
    }

    // Update current intent
    const previousIntent = currentIntent;
    currentIntent = result.nextIntent;

    // Break if we've completed the cycle (returned to I1)
    if (currentIntent === "I1" && previousIntent === "I8") {
      console.log('\n✅ CBT cycle completed! Returning to I1 for a new topic.\n');
      break;
    }

    // Small delay for readability
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // ============================================================================
  // SESSION SUMMARY
  // ============================================================================

  printSeparator('═');
  console.log('                       📋 SESSION SUMMARY');
  printSeparator('═');

  console.log(`\n💬 Total messages: ${conversationHistory.length}`);
  console.log(`🔄 Intents covered: I1 → I2 → I3 → I4 → I5 → I6 → I7 → I8\n`);

  console.log('🎓 What happened in this session:\n');
  console.log('  1. Identified the triggering situation (boss yelling)');
  console.log('  2. Captured the automatic thought ("terrible at my job")');
  console.log('  3. Rated the emotional intensity (80/100 anxiety)');
  console.log('  4. Examined evidence supporting the thought (recent mistakes)');
  console.log('  5. Found evidence against the thought (completed projects)');
  console.log('  6. Generated alternative thought (human who makes mistakes)');
  console.log('  7. Re-rated the mood (40/100 - significant improvement!)');
  console.log('  8. Established coping strategy (journaling)\n');

  printSeparator('═');
}

// ============================================================================
// RUN
// ============================================================================

runCompleteSession()
  .then(() => {
    console.log('\n✨ Complete session example finished successfully!\n');
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
