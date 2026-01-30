/**
 * Technique Comparison Example - Cogni CBT Engine
 *
 * This example compares all 4 prompt engineering techniques:
 * - Persona (role-based guidance)
 * - Few-shot (learning by example)
 * - Chain-of-Thought (explicit reasoning)
 * - Plan-and-Solve (two-phase execution)
 *
 * Shows how the same user input generates different responses
 * based on the prompting strategy.
 */

import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, type PromptTechnique } from '../../src/index.js'

// ============================================================================
// SETUP
// ============================================================================

console.log('🧠 Cogni CBT Engine - Technique Comparison\n')

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found')
  console.error('💡 Copy .env.example to .env and add your API key')
  process.exit(1)
}

// ============================================================================
// CONFIGURE MODELS
// ============================================================================

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.2,
})

const engine = new CogniEngine(model)

// ============================================================================
// TEST SCENARIOS
// ============================================================================

const testScenarios = [
  {
    intent: "I1",
    message: "I'm worried about my presentation tomorrow.",
    description: "Situation Identification",
  },
  {
    intent: "I2",
    message: "I keep thinking 'I'm going to mess everything up and embarrass myself'.",
    description: "Automatic Thought",
  },
]

// ============================================================================
// TECHNIQUES TO COMPARE
// ============================================================================

const techniques: PromptTechnique[] = [
  "persona",
  "few-shot",
  "chain-of-thought",
  "plan-and-solve",
]

const techniqueDescriptions: Record<PromptTechnique, string> = {
  "default": "Default guidance",
  "persona": "Role-based with clear boundaries",
  "few-shot": "Learning through 6-7 examples",
  "chain-of-thought": "Explicit step-by-step reasoning",
  "plan-and-solve": "Two-phase (plan → solve)",
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function printSeparator(char: string = '━', length: number = 80) {
  console.log(char.repeat(length))
}

function printHeader(text: string, char: string = '═') {
  printSeparator(char)
  console.log(`  ${text}`)
  printSeparator(char)
}

// ============================================================================
// COMPARISON FUNCTION
// ============================================================================

async function compareTechniques() {
  console.log('This example shows how different prompting techniques')
  console.log('generate different responses for the same user input.\n')

  for (const scenario of testScenarios) {
    printHeader(`📝 SCENARIO: ${scenario.description}`, '═')
    console.log(`\n👤 User Message: "${scenario.message}"\n`)
    console.log(`🎯 Intent: ${scenario.intent}\n`)

    for (const technique of techniques) {
      printSeparator('─')
      console.log(`\n🔧 TECHNIQUE: ${technique.toUpperCase()}`)
      console.log(`   ${techniqueDescriptions[technique]}\n`)

      try {
        console.log('⏳ Generating response...\n')

        const result = await engine.respond({
          message: scenario.message,
          intent: scenario.intent,
          conversation: [],
          technique: technique,
        })

        console.log('💬 RESPONSE:')
        console.log(`   ${result.reply.split('\n').join('\n   ')}\n`)

        console.log('📊 METADATA:')
        console.log(`   Next Intent: ${result.nextIntent}`)
        if (result.distortion) {
          const confidence = Math.round(result.distortion.confidence * 100)
          console.log(`   Distortion:  ${result.distortion.distortion} (${confidence}%)`)
        }
        console.log()

      } catch (error) {
        console.error(`   ❌ Error with ${technique}:`, error)
      }

      // Small delay between techniques
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n')
  }

  // ============================================================================
  // COMPARISON SUMMARY
  // ============================================================================

  printHeader('📋 COMPARISON SUMMARY', '═')

  console.log('\n🎓 Observations:\n')

  console.log('1. **Persona** - Most structured, clear therapeutic boundaries')
  console.log('   Best for: Users who want professional, role-based guidance\n')

  console.log('2. **Few-shot** - Rich with examples, demonstrates patterns')
  console.log('   Best for: Training models with extensive behavioral examples\n')

  console.log('3. **Chain-of-Thought** - Shows reasoning process explicitly')
  console.log('   Best for: Understanding how the model thinks\n')

  console.log('4. **Plan-and-Solve** - Separates planning from execution')
  console.log('   Best for: Complex situations requiring explicit strategy\n')

  printSeparator('═')
  console.log('\n💡 All techniques implement the same CBT workflow,')
  console.log('   they just differ in HOW they guide the model.\n')
}

// ============================================================================
// RUN
// ============================================================================

compareTechniques()
  .then(() => {
    console.log('✨ Technique comparison completed successfully!\n')
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
