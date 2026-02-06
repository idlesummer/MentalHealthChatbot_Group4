/**
 * Session Summary Example - Cogni CBT Engine
 *
 * This example demonstrates the therapist-facing session summary service:
 * - Tracking structured data during a full CBT session (I1-I8)
 * - Generating a session summary with mood delta, distortion profile, intent funnel
 * - Producing a Mermaid flowchart for visual rendering
 * - Producing a plain-text clinician summary
 *
 * The SessionTracker collects data alongside each engine.respond() call,
 * then SessionSummaryGenerator transforms it into a typed SessionSummary.
 */

import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  CogniEngine,
  SessionTracker,
  SessionSummaryGenerator,
  type Message,
  type Intent,
  type SessionSummary,
} from '../../src/index.js';

// ============================================================================
// SETUP
// ============================================================================

console.log('🧠 Cogni CBT Engine - Session Summary Example\n');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found');
  console.error('💡 Copy .env.example to .env and add your API key');
  process.exit(1);
}

// ============================================================================
// CONFIGURE
// ============================================================================

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const engine = new CogniEngine(model);
const tracker = new SessionTracker();
const summaryGenerator = new SessionSummaryGenerator();
const technique = 'persona' as const;

// ============================================================================
// SIMULATED USER RESPONSES
// ============================================================================

const simulatedResponses: Record<string, string> = {
  I1: "My boss yelled at me during the team meeting yesterday in front of everyone.",
  I2: "I immediately thought 'I must be terrible at my job and everyone saw it'.",
  I3: "I felt really anxious and embarrassed. I'd rate it about 80 out of 100.",
  I4: "Well, I have made some mistakes on recent projects that he pointed out.",
  I5: "Actually, I've also completed several projects ahead of schedule and received praise last quarter.",
  I6: "Maybe I'm not terrible at my job. I'm human and make mistakes, but I also deliver good work consistently.",
  I7: "I feel lighter now, maybe around 40 out of 100. The anxiety has reduced quite a bit.",
  I8: "Yes, I think journaling about both my wins and mistakes could help me maintain perspective.",
};

// ============================================================================
// CONVERSATION STATE
// ============================================================================

const conversation: Message[] = [];
let intent: Intent = "I1";
let turnNumber = 0;

// ============================================================================
// HELPERS
// ============================================================================

function addMessage(user: string, text: string) {
  conversation.push({
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

const INTENT_NAMES: Record<string, string> = {
  I1: "Situation Identification",
  I2: "Automatic Thought Identification",
  I3: "Mood Rating",
  I4: "Evidence For",
  I5: "Evidence Against",
  I6: "Alternative Thought Generation",
  I7: "Mood Re-rating",
  I8: "Coping Strategy Recommendation",
};

// ============================================================================
// MAIN SESSION LOOP
// ============================================================================

async function runSession() {
  console.log('Running a complete CBT session with tracking enabled...\n');
  printSeparator('═');
  console.log('                    🧘 CBT SESSION (with tracking)');
  printSeparator('═');

  while (intent !== "I1" || turnNumber === 0) {
    console.log(`\n🎯 INTENT: ${intent} - ${INTENT_NAMES[intent]}`);
    printSeparator();

    const userMessage = simulatedResponses[intent];
    if (!userMessage) {
      console.log('\n⚠️  No simulated response for', intent);
      break;
    }

    console.log(`\n👤 USER: "${userMessage}"`);
    addMessage("You", userMessage);

    console.log(`\n⏳ Processing...\n`);

    const result = await engine.respond({
      message: userMessage,
      intent,
      conversation,
      technique,
    });

    // *** Track this turn ***
    tracker.record({ intent, userMessage, response: result, technique });

    console.log(`🤖 ASSISTANT: ${result.reply.split('\n').join('\n   ')}`);
    addMessage("Pebbles", result.reply);

    console.log(`\n📊 Next Intent: ${result.nextIntent}`);
    if (result.distortion) {
      console.log(`   Distortion:  ${result.distortion.distortion} (${Math.round(result.distortion.confidence * 100)}%)`);
    }

    const previousIntent = intent;
    intent = result.nextIntent as Intent;

    if (intent === "I1" && previousIntent === "I8") {
      console.log('\n✅ CBT cycle completed!\n');
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return summaryGenerator.generate(tracker.getRecords(), tracker.getTechnique());
}

// ============================================================================
// DISPLAY SESSION SUMMARY
// ============================================================================

function displaySummary(summary: SessionSummary) {
  printSeparator('═');
  console.log('                    📋 THERAPIST SESSION SUMMARY');
  printSeparator('═');

  // --- Metadata ---
  console.log('\n📌 SESSION METADATA');
  printSeparator('─');
  console.log(`  Total Turns:       ${summary.metadata.totalTurns}`);
  console.log(`  Duration:          ${(summary.metadata.durationMs / 1000).toFixed(1)}s`);
  console.log(`  Technique:         ${summary.metadata.technique}`);
  console.log(`  Full Cycle:        ${summary.metadata.completedFullCycle ? '✅ Yes' : '❌ No'}`);
  console.log(`  Final Intent:      ${summary.metadata.finalIntent}`);

  // --- Mood Delta ---
  if (summary.moodDelta) {
    console.log('\n📈 MOOD DELTA');
    printSeparator('─');
    console.log(`  Initial (I3):      ${summary.moodDelta.preText}`);
    if (summary.moodDelta.preScore !== null) {
      console.log(`  Score:             ${summary.moodDelta.preScore}/100`);
    }
    if (summary.moodDelta.postText) {
      console.log(`  Re-rated (I7):     ${summary.moodDelta.postText}`);
    }
    if (summary.moodDelta.postScore !== null) {
      console.log(`  Score:             ${summary.moodDelta.postScore}/100`);
    }
    if (summary.moodDelta.delta !== null) {
      const arrow = summary.moodDelta.delta < 0 ? '↓' : summary.moodDelta.delta > 0 ? '↑' : '→';
      console.log(`  Change:            ${arrow} ${Math.abs(summary.moodDelta.delta)} points`);
    }
  }

  // --- Distortion Profile ---
  if (summary.distortionProfile.length > 0) {
    console.log('\n🧩 DISTORTION PROFILE');
    printSeparator('─');
    for (const d of summary.distortionProfile) {
      const bar = '█'.repeat(d.count * 3) + '░'.repeat(Math.max(0, 15 - d.count * 3));
      console.log(`  ${d.distortion.padEnd(28)} ${bar} ${d.count}x (${Math.round(d.averageConfidence * 100)}% avg)`);
    }
  }

  // --- Intent Funnel ---
  console.log('\n🔄 INTENT FUNNEL');
  printSeparator('─');
  for (const f of summary.intentFunnel) {
    const status = f.completed ? '✅' : '⬜';
    const bar = f.turns > 0 ? '█'.repeat(f.turns * 4) : '';
    console.log(`  ${status} ${f.intent} ${f.label.padEnd(22)} ${bar} ${f.turns > 0 ? `${f.turns} turn(s)` : 'not reached'}`);
  }

  // --- Mermaid Flowchart ---
  console.log('\n📊 MERMAID FLOWCHART (paste into any Mermaid renderer)');
  printSeparator('─');
  console.log('');
  console.log(summary.mermaidChart);
  console.log('');

  // --- Plain-Text Clinician Summary ---
  console.log('\n📝 CLINICIAN SUMMARY');
  printSeparator('─');
  console.log('');
  console.log(summary.textSummary);
  console.log('');

  printSeparator('═');
}

// ============================================================================
// RUN
// ============================================================================

runSession()
  .then((summary) => {
    displaySummary(summary);
    console.log('\n✨ Session summary example finished successfully!\n');
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
