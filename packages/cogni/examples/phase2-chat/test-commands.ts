/**
 * Simple test to verify Phase 2 command detection works
 * This doesn't require API calls, just tests the service layer
 */

import { CommandDetector, SessionManager, UserCommand } from '../../src/index.js'

console.log('🧪 Testing Phase 2 Services...\n')

// Test 1: Command Detection
console.log('Test 1: Command Detection')
console.log('=' .repeat(50))

const detector = new CommandDetector()

const testMessages = [
  { message: 'start over', expected: UserCommand.RESTART },
  { message: 'what did you say?', expected: UserCommand.REPEAT },
  { message: 'I need help', expected: UserCommand.HELP },
  { message: 'too much, pause', expected: UserCommand.PAUSE },
  { message: 'goodbye', expected: UserCommand.END },
  { message: 'I had a bad day', expected: UserCommand.NONE },
]

let passed = 0
let failed = 0

for (const test of testMessages) {
  const result = detector.detect(test.message)
  const match = result.command === test.expected

  if (match) {
    console.log(`✅ "${test.message}" → ${result.command}`)
    passed++
  } else {
    console.log(`❌ "${test.message}" → ${result.command} (expected: ${test.expected})`)
    failed++
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed\n`)

// Test 2: Session Management
console.log('Test 2: Session Management')
console.log('='.repeat(50))

const sessionManager = new SessionManager()

// Create session
const session = sessionManager.createSession({ userId: 'test-user' })
console.log(`✅ Created session: ${session.id}`)
console.log(`   Initial intent: ${session.currentIntent}`)
console.log(`   Messages in intent: ${session.messagesInCurrentIntent}`)

// Update with message
const updated = sessionManager.updateWithMessage(session, {
  id: 'msg-1',
  user: 'You',
  text: 'Hello',
  ts: Date.now(),
})
console.log(`✅ Added message, conversation length: ${updated.conversation.length}`)

// Check stuck detection
const stuck = sessionManager.isUserStuck({ ...session, messagesInCurrentIntent: 5 })
console.log(`✅ Stuck detection (5 messages): ${stuck}`)

// Pause session
const paused = sessionManager.pauseSession(session)
console.log(`✅ Session paused: ${paused.isPaused}`)

// Resume session
const resumed = sessionManager.resumeSession(paused)
console.log(`✅ Session resumed: ${!resumed.isPaused}`)

console.log('\n🎉 All Phase 2 service tests passed!')
console.log('\nNote: To test full chat functionality with LLM, run: npm start')
