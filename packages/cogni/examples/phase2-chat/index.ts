/**
 * Phase 2 Chat Example - Cogni CBT Engine
 *
 * This example demonstrates the Phase 2 enhancements:
 * - Session state management
 * - Command detection (restart, repeat, pause, help, end)
 * - Automatic conversation history tracking
 * - Smart clarification when user is stuck
 * - Pause/resume functionality
 *
 * New features compared to basic usage:
 * 1. `engine.createSession()` - Initialize session state
 * 2. `engine.chat()` - Enhanced respond with commands
 * 3. Commands: "restart", "repeat", "help", "pause", "end"
 * 4. Automatic stuck detection with clarification
 */

import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, UserCommand } from '../../src/index.js'

// ============================================================================
// SETUP
// ============================================================================

console.log('🧠 Cogni CBT Engine - Phase 2 Chat Example\n')

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found')
  console.error('💡 Copy .env.example to .env and add your API key')
  process.exit(1)
}

// ============================================================================
// CONFIGURE MODEL
// ============================================================================

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  temperature: 0.2,
})

const engine = new CogniEngine(model)

// ============================================================================
// DEMONSTRATION SCENARIOS
// ============================================================================

/**
 * Scenario 1: Normal flow with restart command
 */
async function scenario1_RestartCommand() {
  console.log('\n' + '='.repeat(80))
  console.log('SCENARIO 1: Testing RESTART Command')
  console.log('='.repeat(80) + '\n')

  // Create session
  let session = engine.createSession({ userId: 'demo-user-1' })
  console.log('✅ Session created:', session.id)
  console.log(`📍 Starting intent: ${session.currentIntent}\n`)

  // User message 1
  console.log('👤 USER: "My boss yelled at me in the meeting"')
  let result = await engine.chat({
    message: 'My boss yelled at me in the meeting',
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🤖 ASSISTANT: "${result.reply.substring(0, 100)}..."`)
  console.log(`📍 Intent: ${session.currentIntent}\n`)

  // User message 2 - RESTART
  console.log('👤 USER: "actually, start over"')
  result = await engine.chat({
    message: 'actually, start over',
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🎯 Command detected: ${result.commandDetected || 'none'}`)
  console.log(`🤖 ASSISTANT: "${result.reply}"`)
  console.log(`📍 Intent after restart: ${session.currentIntent}`)
  console.log(`✨ Intent counts reset: ${result.wasCommandHandled}\n`)
}

/**
 * Scenario 2: Repeat command
 */
async function scenario2_RepeatCommand() {
  console.log('\n' + '='.repeat(80))
  console.log('SCENARIO 2: Testing REPEAT Command')
  console.log('='.repeat(80) + '\n')

  let session = engine.createSession({ userId: 'demo-user-2' })

  // First message
  console.log('👤 USER: "I had a fight with my friend"')
  let result = await engine.chat({
    message: 'I had a fight with my friend',
    session,
    technique: 'persona',
  })
  session = result.session
  const firstReply = result.reply
  console.log(`🤖 ASSISTANT: "${firstReply.substring(0, 80)}..."\n`)

  // User asks to repeat
  console.log('👤 USER: "what did you say?"')
  result = await engine.chat({
    message: 'what did you say?',
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🎯 Command detected: ${result.commandDetected}`)
  console.log(`🤖 ASSISTANT: "${result.reply.substring(0, 80)}..."`)
  console.log(`✅ Same message repeated: ${result.reply === firstReply}\n`)
}

/**
 * Scenario 3: Help command at different intents
 */
async function scenario3_HelpCommand() {
  console.log('\n' + '='.repeat(80))
  console.log('SCENARIO 3: Testing HELP Command')
  console.log('='.repeat(80) + '\n')

  let session = engine.createSession({ userId: 'demo-user-3' })

  // Ask for help at I1
  console.log(`📍 Current intent: ${session.currentIntent}`)
  console.log('👤 USER: "help, I don\'t understand"')
  let result = await engine.chat({
    message: "help, I don't understand",
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🎯 Command detected: ${result.commandDetected}`)
  console.log(`🤖 HELP MESSAGE:\n"${result.reply}"\n`)

  // Progress to I2
  result = await engine.chat({
    message: 'My boss criticized my work in front of the team today',
    session,
    technique: 'persona',
  })
  session = result.session

  // Ask for help at I2
  console.log(`📍 Current intent: ${session.currentIntent}`)
  console.log('👤 USER: "I\'m stuck, what do I do?"')
  result = await engine.chat({
    message: "I'm stuck, what do I do?",
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🎯 Command detected: ${result.commandDetected}`)
  console.log(`🤖 HELP MESSAGE:\n"${result.reply}"\n`)
}

/**
 * Scenario 4: Pause and resume
 */
async function scenario4_PauseResume() {
  console.log('\n' + '='.repeat(80))
  console.log('SCENARIO 4: Testing PAUSE and RESUME')
  console.log('='.repeat(80) + '\n')

  let session = engine.createSession({ userId: 'demo-user-4' })

  // Start conversation
  console.log('👤 USER: "I feel terrible about failing my exam"')
  let result = await engine.chat({
    message: 'I feel terrible about failing my exam',
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🤖 ASSISTANT: "${result.reply.substring(0, 60)}..."\n`)

  // User pauses
  console.log('👤 USER: "too much, need a break"')
  result = await engine.chat({
    message: 'too much, need a break',
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🎯 Command detected: ${result.commandDetected}`)
  console.log(`🤖 ASSISTANT: "${result.reply}"`)
  console.log(`⏸️  Session paused: ${session.isPaused}\n`)

  // Resume session
  console.log('--- TIME PASSES ---')
  console.log('User returns...\n')
  const resumed = engine.resumeSession(session)
  session = resumed.session
  console.log(`▶️  Session resumed: ${!session.isPaused}`)
  console.log(`🤖 WELCOME BACK: "${resumed.reply}"\n`)
}

/**
 * Scenario 5: User stuck - automatic clarification
 */
async function scenario5_StuckDetection() {
  console.log('\n' + '='.repeat(80))
  console.log('SCENARIO 5: Testing STUCK DETECTION')
  console.log('='.repeat(80) + '\n')

  let session = engine.createSession({ userId: 'demo-user-5' })

  console.log('Simulating user sending unclear messages repeatedly...\n')

  const unclearMessages = [
    'I feel bad',
    'things are terrible',
    'everything is wrong',
    'I just feel awful',
    'it\'s all bad',
    'I don\'t know what to say', // 6th message - should trigger stuck detection
  ]

  for (const msg of unclearMessages) {
    console.log(`👤 USER (${session.messagesInCurrentIntent + 1}/5): "${msg}"`)
    const result = await engine.chat({
      message: msg,
      session,
      technique: 'persona',
    })
    session = result.session

    if (session.messagesInCurrentIntent >= 5) {
      console.log(`⚠️  STUCK DETECTED (${session.messagesInCurrentIntent} messages on ${session.currentIntent})`)
      console.log(`🤖 CLARIFICATION: "${result.reply}"\n`)
      break
    } else {
      console.log(`🤖 ASSISTANT: "${result.reply.substring(0, 60)}..."\n`)
    }
  }
}

/**
 * Scenario 6: Complete session with end command
 */
async function scenario6_EndCommand() {
  console.log('\n' + '='.repeat(80))
  console.log('SCENARIO 6: Testing END Command')
  console.log('='.repeat(80) + '\n')

  let session = engine.createSession({ userId: 'demo-user-6' })

  // Have a brief conversation
  console.log('👤 USER: "I got into an argument with my sister"')
  let result = await engine.chat({
    message: 'I got into an argument with my sister',
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🤖 ASSISTANT: "${result.reply.substring(0, 60)}..."\n`)

  // User ends session
  console.log('👤 USER: "thanks, I\'m done for now"')
  result = await engine.chat({
    message: "thanks, I'm done for now",
    session,
    technique: 'persona',
  })
  session = result.session
  console.log(`🎯 Command detected: ${result.commandDetected}`)
  console.log(`🤖 ASSISTANT: "${result.reply}"`)
  console.log(`✅ Session complete: ${session.isComplete}\n`)
}

// ============================================================================
// RUN ALL SCENARIOS
// ============================================================================

async function main() {
  console.log('This example demonstrates Phase 2 features:\n')
  console.log('✨ Session state management')
  console.log('✨ Command detection (restart, repeat, help, pause, end)')
  console.log('✨ Automatic conversation tracking')
  console.log('✨ Stuck detection with clarification')
  console.log('✨ Pause/resume functionality\n')

  try {
    await scenario1_RestartCommand()
    await scenario2_RepeatCommand()
    await scenario3_HelpCommand()
    await scenario4_PauseResume()
    await scenario5_StuckDetection()
    await scenario6_EndCommand()

    console.log('\n' + '='.repeat(80))
    console.log('✅ All scenarios completed successfully!')
    console.log('='.repeat(80) + '\n')

    console.log('📚 Key Takeaways:\n')
    console.log('1. Use engine.createSession() to start tracking state')
    console.log('2. Use engine.chat() instead of engine.respond() for Phase 2 features')
    console.log('3. Commands work automatically - no special handling needed')
    console.log('4. Session state is updated with each message')
    console.log('5. Stuck detection helps guide confused users')
    console.log('6. Backward compatible - engine.respond() still works!\n')

  } catch (error) {
    console.error('\n❌ Error running scenarios:', error)
    process.exit(1)
  }
}

main()
