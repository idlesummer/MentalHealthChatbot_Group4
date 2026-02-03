# Phase 2 Chat Example

This example demonstrates the **Phase 2 enhancements** to the Cogni CBT Engine, which add chat-based session management and command detection.

## What's New in Phase 2

### 1. **Session State Management**
- Track user progress across multiple messages
- Maintain conversation history automatically
- Pause and resume sessions
- Detect when users are stuck

### 2. **Command Detection**
Automatically detects and handles user commands:
- `restart` - Start over with a new situation
- `repeat` - Hear the last message again
- `help` - Get context-specific guidance
- `pause` - Take a break (preserves state)
- `end` - End the current session

### 3. **Smart Clarification**
- Detects when users are stuck (5+ messages without progressing)
- Provides helpful clarification based on current intent
- Guides users gently without being pushy

### 4. **Backward Compatible**
- All existing `engine.respond()` code still works
- New `engine.chat()` is opt-in
- Progressive enhancement approach

## Installation

```bash
# From the phase2-chat directory
npm install

# Or from cogni root
npm install
```

## Usage

```bash
# Make sure you have OPENAI_API_KEY in your .env file
npm start
```

## Code Examples

### Basic Session-Based Chat

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine } from '@rainev/cogni'

const model = new ChatOpenAI({ model: 'gpt-4o-mini' })
const engine = new CogniEngine(model)

// Create a new session
let session = engine.createSession({ userId: 'user-123' })

// Chat with session management
let result = await engine.chat({
  message: 'I had a bad day at work',
  session,
  technique: 'persona'
})

// Session is automatically updated
session = result.session
console.log(result.reply)
console.log(`Intent: ${session.currentIntent}`)
```

### Handling Commands

```typescript
// User can type commands naturally
result = await engine.chat({
  message: 'start over',
  session,
  technique: 'persona'
})

// Check if command was detected
if (result.wasCommandHandled) {
  console.log(`Command: ${result.commandDetected}`)
  // session.currentIntent is now 'I1'
  // session.currentThoughtRecord is reset
}
```

### Pause and Resume

```typescript
// User pauses
result = await engine.chat({
  message: 'too much, need a break',
  session,
  technique: 'persona'
})
session = result.session
// session.isPaused === true

// Later, resume the session
const resumed = engine.resumeSession(session)
session = resumed.session
console.log(resumed.reply) // "Welcome back! We were working on..."
```

### Stuck Detection

```typescript
// Engine automatically detects when user is stuck
// (5+ messages on same intent without progressing)

// After multiple unclear messages...
result = await engine.chat({
  message: 'I just feel bad',
  session,
  technique: 'persona'
})

// If stuck, engine provides clarification
// "I want to make sure I understand the situation clearly.
//  Could you describe what happened in a bit more detail?"
```

## Scenario Demonstrations

This example runs 6 scenarios:

1. **Restart Command** - User changes their mind mid-flow
2. **Repeat Command** - User asks to hear the message again
3. **Help Command** - User asks for help at different intents
4. **Pause/Resume** - User takes a break and comes back
5. **Stuck Detection** - User sends unclear messages repeatedly
6. **End Command** - User ends the session gracefully

## API Reference

### New Methods

#### `engine.createSession(options)`
Creates a new session with state tracking.

```typescript
const session = engine.createSession({
  userId: 'user-123',
  sessionId?: 'custom-id',  // Optional
  initialIntent?: 'I1'       // Optional, defaults to I1
})
```

#### `engine.chat(request)`
Enhanced respond with session management and command detection.

```typescript
const result = await engine.chat({
  message: string,
  session: SessionState,
  technique: PromptTechnique
})

// Returns:
// {
//   reply: string,
//   session: SessionState,  // Updated session
//   distortion?: CognitiveDistortionClassification,
//   commandDetected?: UserCommand,
//   wasCommandHandled: boolean
// }
```

#### `engine.resumeSession(session)`
Resume a paused session with a greeting.

```typescript
const { reply, session } = engine.resumeSession(pausedSession)
console.log(reply) // Welcome back message
```

### Session State

```typescript
interface SessionState {
  id: string
  userId: string
  startTime: number
  lastActiveTime: number
  currentIntent: Intent
  currentThoughtRecord: ThoughtRecord
  conversation: Message[]
  isPaused: boolean
  isComplete: boolean
  messagesInCurrentIntent: number
}
```

### User Commands

```typescript
enum UserCommand {
  RESTART = 'restart',
  REPEAT = 'repeat',
  PAUSE = 'pause',
  HELP = 'help',
  END = 'end',
  NONE = 'none'
}
```

## Migration from Phase 1

Phase 1 code:
```typescript
const result = await engine.respond({
  message: 'I failed my exam',
  intent: 'I1',
  conversation: [],
  technique: 'persona'
})
```

Phase 2 equivalent:
```typescript
// Create session once
let session = engine.createSession({ userId: 'user-123' })

// Use chat instead of respond
const result = await engine.chat({
  message: 'I failed my exam',
  session,
  technique: 'persona'
})
session = result.session  // Update session with each message
```

Benefits:
- ✅ Automatic conversation tracking
- ✅ Command detection
- ✅ Stuck detection
- ✅ Pause/resume support
- ✅ No need to manually track intent or conversation

## Architecture

Phase 2 adds three new services:

1. **CommandDetector** - Pattern-based command detection
2. **SessionManager** - Session lifecycle management
3. **Enhanced CogniEngine** - Integrates new services

The architecture maintains separation of concerns:
- Services remain stateless
- State is managed explicitly in SessionState
- Backward compatible with Phase 1 API

## Next Steps

- Integrate session persistence (database storage)
- Add multi-session management (user history)
- Implement intelligent situation extraction (conversational intake)
- Add analytics and progress tracking

## Learn More

- [Main README](../../README.md)
- [Architecture Guide](../../docs/ARCHITECTURE.md)
- [Basic Usage Example](../basic-usage/)
- [Complete Session Example](../complete-session/)
