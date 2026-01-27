/**
 * Distortion Analyzer Example - Cogni CBT Engine
 *
 * This example demonstrates:
 * - Analyzing multiple messages for cognitive distortions
 * - Classifying the 10 types of cognitive distortions
 * - Displaying results in a formatted table
 * - Showing confidence scores and rationales
 */

import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import {
  CogniEngine,
  COGNITIVE_DISTORTION_KEYS,
} from '../../../src/cogni/src/index.js';

// ============================================================================
// SETUP
// ============================================================================

console.log('🧠 Cogni CBT Engine - Cognitive Distortion Analyzer\n');

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
// TEST MESSAGES (Examples of each distortion type)
// ============================================================================

const testMessages = [
  {
    message: "I either ace this exam or I'm a complete failure.",
    expectedDistortion: "All-or-Nothing Thinking",
  },
  {
    message: "I made one mistake so I always mess everything up.",
    expectedDistortion: "Overgeneralization",
  },
  {
    message: "Sure I got praise, but that one criticism is what really matters.",
    expectedDistortion: "Mental Filtering",
  },
  {
    message: "They complimented my work, but they were probably just being polite.",
    expectedDistortion: "Discounting the Positive",
  },
  {
    message: "My boss didn't smile at me today, they must be planning to fire me.",
    expectedDistortion: "Jumping to Conclusions",
  },
  {
    message: "If I give this presentation, it will be a total disaster and ruin my career.",
    expectedDistortion: "Catastrophizing",
  },
  {
    message: "I feel like an idiot, so I must be one.",
    expectedDistortion: "Emotional Reasoning",
  },
  {
    message: "I should always be perfect and never make mistakes.",
    expectedDistortion: "Should Statements",
  },
  {
    message: "I failed the test, so I'm a loser.",
    expectedDistortion: "Labeling",
  },
  {
    message: "The meeting went badly and it's all my fault.",
    expectedDistortion: "Personalization & Blame",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function printSeparator(char: string = '━', length: number = 80) {
  console.log(char.repeat(length));
}

function printHeader(text: string) {
  printSeparator('═');
  console.log(`  ${text}`);
  printSeparator('═');
}

function getConfidenceBar(confidence: number, width: number = 20): string {
  const filled = Math.round(confidence * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '🟢';
  if (confidence >= 0.6) return '🟡';
  return '🔴';
}

// ============================================================================
// ANALYSIS FUNCTION
// ============================================================================

async function analyzeDistortions() {
  console.log('This example analyzes messages to identify cognitive distortions.\n');
  console.log(`📋 Analyzing ${testMessages.length} messages...\n`);

  const results = [];

  for (let i = 0; i < testMessages.length; i++) {
    const { message, expectedDistortion } = testMessages[i];

    console.log(`⏳ [${i + 1}/${testMessages.length}] Analyzing: "${message.substring(0, 50)}..."`);

    try {
      const result = await engine.identifyCognitiveDistortions(message);
      results.push({
        message,
        expectedDistortion,
        ...result,
        match: result.distortion === expectedDistortion,
      });

      console.log(`   ✓ Detected: ${result.distortion} (${Math.round(result.confidence * 100)}%)\n`);
    } catch (error) {
      console.error(`   ✗ Error: ${error}\n`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // ============================================================================
  // DISPLAY RESULTS
  // ============================================================================

  console.log();
  printHeader('📊 ANALYSIS RESULTS');
  console.log();

  results.forEach((result, index) => {
    console.log(`${index + 1}. MESSAGE:`);
    console.log(`   "${result.message}"\n`);

    console.log(`   DETECTED DISTORTION:`);
    console.log(`   ${result.distortion}`);
    console.log();

    console.log(`   CONFIDENCE: ${getConfidenceColor(result.confidence)} ${Math.round(result.confidence * 100)}%`);
    console.log(`   ${getConfidenceBar(result.confidence)}`);
    console.log();

    console.log(`   RATIONALE:`);
    console.log(`   ${result.rationale}`);
    console.log();

    if (result.expectedDistortion) {
      const matchEmoji = result.match ? '✅' : '❌';
      console.log(`   EXPECTED: ${matchEmoji} ${result.expectedDistortion}`);
      console.log();
    }

    printSeparator('─');
    console.log();
  });

  // ============================================================================
  // SUMMARY STATISTICS
  // ============================================================================

  printHeader('📈 SUMMARY STATISTICS');
  console.log();

  const totalMessages = results.length;
  const matches = results.filter(r => r.match).length;
  const accuracy = totalMessages > 0 ? (matches / totalMessages) * 100 : 0;

  console.log(`Total Messages Analyzed: ${totalMessages}`);
  console.log(`Correct Classifications:  ${matches}/${totalMessages}`);
  console.log(`Accuracy:                ${accuracy.toFixed(1)}%`);
  console.log();

  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / totalMessages;
  console.log(`Average Confidence:      ${(avgConfidence * 100).toFixed(1)}%`);
  console.log();

  // Distribution of distortions
  const distortionCounts: Record<string, number> = {};
  results.forEach(r => {
    distortionCounts[r.distortion] = (distortionCounts[r.distortion] || 0) + 1;
  });

  console.log('DETECTED DISTORTION DISTRIBUTION:');
  Object.entries(distortionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([distortion, count]) => {
      const bar = '█'.repeat(count);
      console.log(`  ${distortion.padEnd(30)} ${bar} (${count})`);
    });

  console.log();
  printSeparator('═');
}

// ============================================================================
// EDUCATIONAL SECTION
// ============================================================================

async function showDistortionExplanations() {
  console.log();
  printHeader('📚 THE 10 COGNITIVE DISTORTIONS');
  console.log();

  const explanations = [
    {
      name: "All-or-Nothing Thinking",
      description: "Viewing things in black and white categories, with no middle ground.",
      example: "If I'm not perfect, I'm a complete failure.",
    },
    {
      name: "Overgeneralization",
      description: "Drawing broad conclusions from a single event.",
      example: "I failed once, so I always fail at everything.",
    },
    {
      name: "Mental Filtering",
      description: "Focusing only on negatives while ignoring positives.",
      example: "I got 9/10 positive reviews, but that one negative is all I think about.",
    },
    {
      name: "Discounting the Positive",
      description: "Rejecting positive experiences as not counting.",
      example: "They only said that to be nice, it doesn't mean anything.",
    },
    {
      name: "Jumping to Conclusions",
      description: "Making negative interpretations without evidence.",
      example: "They didn't text back, they must hate me now.",
    },
    {
      name: "Catastrophizing",
      description: "Expecting the worst possible outcome.",
      example: "If I make one mistake, my entire career will be ruined.",
    },
    {
      name: "Emotional Reasoning",
      description: "Believing feelings reflect reality.",
      example: "I feel stupid, therefore I am stupid.",
    },
    {
      name: "Should Statements",
      description: "Using rigid rules about how you or others should behave.",
      example: "I should never make mistakes or show weakness.",
    },
    {
      name: "Labeling",
      description: "Assigning global negative labels instead of describing behavior.",
      example: "I made a mistake, so I'm a loser.",
    },
    {
      name: "Personalization & Blame",
      description: "Taking responsibility for things outside your control.",
      example: "The project failed, and it's all my fault.",
    },
  ];

  explanations.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   ${item.description}`);
    console.log(`   💭 Example: "${item.example}"`);
    console.log();
  });

  printSeparator('═');
}

// ============================================================================
// RUN
// ============================================================================

async function main() {
  await analyzeDistortions();
  await showDistortionExplanations();
}

main()
  .then(() => {
    console.log('\n✨ Distortion analysis completed successfully!\n');
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
