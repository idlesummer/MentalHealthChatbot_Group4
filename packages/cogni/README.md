# Cogni - Cognitive Behavioral Therapy Engine

A standalone, reusable CBT (Cognitive Behavioral Therapy) pipeline implementation with support for an 8-stage intent-driven workflow, cognitive distortion classification, crisis detection, session analytics, and multiple prompt engineering techniques.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Examples](#examples)
- [License](#license)

---

## Overview

**Cogni** is a modular CBT engine that implements evidence-based cognitive behavioral therapy techniques in a conversational AI system. It guides users through a structured 8-stage process to identify, challenge, and restructure negative thought patterns.

### The 8-Stage CBT Workflow

1. **I1: Situation Identification** - Identify the triggering event
2. **I2: Automatic Thought Identification** - Capture negative thoughts
3. **I3: Mood Rating** - Quantify emotional intensity
4. **I4: Evidence For** - Examine supporting evidence
5. **I5: Evidence Against** - Challenge with contradictory evidence
6. **I6: Alternative Thought Generation** - Cognitive restructuring
7. **I7: Mood Re-rating** - Measure emotional shift
8. **I8: Coping Strategy Recommendation** - Provide actionable strategies

---

## Features

- **8-Stage Intent System** - Structured progression through CBT stages with completion rules
- **Crisis Detection** - LLM-powered safety screening (LOW/MED/HIGH risk) with safe template responses
- **Cognitive Distortion Classification** - Classifies 10 cognitive distortions with confidence scores
- **6 Prompt Techniques** - Default, Few-shot, Chain-of-Thought, Persona, Plan-and-Solve, and Pebbles
- **Session Analytics** - Mood delta tracking, distortion profiles, intent funnels, Mermaid flowcharts, clinician summaries
- **Type-Safe** - Full TypeScript support with comprehensive types
- **LLM Agnostic** - Works with any LangChain-compatible `BaseChatModel` through dependency injection
- **Isolated & Reusable** - No external dependencies on UI or specific frameworks

---

## Installation

Since this is a workspace package, import it from within the monorepo:

```typescript
import { CogniEngine } from '@rainev/cogni'
```

---

## Quick Start

### Basic Usage

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine } from '@rainev/cogni'

// 1. Create an LLM model
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  temperature: 0.2,
})

// 2. Create the engine (single model handles all services internally)
const engine = new CogniEngine(model)

// 3. Generate a response
const result = await engine.respond({
  message: 'I failed my exam and I feel terrible.',
  intent: 'I1',
  conversation: [],
  technique: 'pebbles',
})

console.log(result.reply)       // AI's therapeutic response
console.log(result.nextIntent)  // Next CBT stage (e.g., 'I2')
console.log(result.distortion)  // Identified cognitive distortion
```

### Crisis Detection

```typescript
import { CrisisDetector } from '@rainev/cogni'

const detector = new CrisisDetector(model)
const crisis = await detector.classify('I feel like giving up on everything')

if (CrisisDetector.requiresIntervention(crisis.risk)) {
  // risk is 'MED' or 'HIGH' — serve a safe response
  const safeReply = CrisisDetector.getSafeResponse(crisis.category)
  console.log(safeReply) // Crisis hotline info
} else {
  // risk is 'LOW' — proceed with normal CBT pipeline
}
```

### Session Summary

```typescript
import { SessionSummaryGenerator } from '@rainev/cogni'

const generator = new SessionSummaryGenerator()
const summary = generator.generate(records, 'pebbles')

console.log(summary.moodDelta)         // { preScore: 70, postScore: 40, delta: -30 }
console.log(summary.distortionProfile) // [{ distortion: 'catastrophizing', count: 3, ... }]
console.log(summary.mermaidChart)      // Mermaid flowchart string
console.log(summary.textSummary)       // Clinician-facing text summary
```

---

## API Reference

### `CogniEngine`

The main class for interacting with the CBT pipeline.

#### Constructor

```typescript
constructor(model: BaseChatModel)
```

Takes a single LangChain-compatible chat model. Internally creates `DistortionClassifier`, `ReplyGenerator`, and `IntentManager` services.

#### Methods

##### `respond(params: CogniRequest): Promise<CogniResponse>`

Generates a CBT response for the user's message. Orchestrates: distortion classification, prompt construction, reply generation, and intent transition evaluation.

**Parameters:**
```typescript
{
  message: string           // User's message
  intent: Intent            // Current CBT stage (I1-I8)
  conversation: Message[]   // Full conversation history
  technique: PromptTechnique // Selected prompting technique
}
```

**Returns:**
```typescript
{
  reply: string                       // Therapeutic response
  nextIntent: Intent                  // Next CBT stage
  distortion?: {                      // Identified distortion
    distortion: CognitiveDistortion
    confidence: number
    rationale: string
  }
}
```

##### `identifyCognitiveDistortions(message: string): Promise<CognitiveDistortionClassification>`

Identifies cognitive distortions in a message (standalone, outside the main pipeline).

##### `getIntents(): Intent[]`

Returns all available intents: `['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8']`

##### `getInitialIntent(): Intent`

Returns the initial intent for a new session: `'I1'`

##### `getPromptTechniques(): PromptTechnique[]`

Returns available prompt techniques: `['default', 'few-shot', 'chain-of-thought', 'persona', 'plan-and-solve', 'pebbles']`

##### `getIntentCounts(): Record<Intent, number>`

Returns how many times each intent has been visited (for analytics).

##### `resetIntentCounts(): void`

Resets intent counters (useful when starting a new session).

---

### `CrisisDetector`

LLM-powered safety screening that classifies user messages by risk level.

#### Constructor

```typescript
constructor(model: BaseChatModel)
```

#### Methods

##### `classify(message: string): Promise<CrisisClassification>`

Returns:
```typescript
{
  risk: 'LOW' | 'MED' | 'HIGH'
  category: 'none' | 'suicidal_ideation' | 'self_harm' | 'harm_to_others' | 'abuse_or_violence' | 'severe_distress'
  reasoning: string
}
```

##### `static requiresIntervention(risk: RiskLevel): boolean`

Returns `true` for `MED` or `HIGH`.

##### `static getSafeResponse(category: CrisisCategory): string`

Returns a pre-written safe response with crisis hotline information for the given category.

---

### `SessionSummaryGenerator`

Stateless transformer that converts session records into a complete summary.

#### `generate(records, technique, options?): SessionSummary`

Returns:
```typescript
{
  metadata: { totalTurns, startTime, endTime, durationMs, completedFullCycle, technique, finalIntent }
  stages: SessionStageRecord[]
  stageSummaries: Partial<Record<Intent, string>>
  moodDelta: MoodDelta | null
  distortionProfile: DistortionProfile[]
  intentFunnel: IntentFunnel[]
  mermaidChart: string
  textSummary: string
}
```

---

### `SessionTracker`

Collects structured data during a live CBT session.

```typescript
const tracker = new SessionTracker()
tracker.record({ intent, userMessage, response, technique })
// After session:
const records = tracker.getRecords()
const technique = tracker.getTechnique()
```

---

## Architecture

### Directory Structure

```
src/
├── api/
│   ├── engine.ts                  # CogniEngine orchestrator
│   └── index.ts                   # API exports
├── services/
│   ├── distortion-classifier.ts   # Cognitive distortion detection (10 types)
│   ├── crisis-detector.ts         # Crisis risk screening (LOW/MED/HIGH)
│   ├── reply-generator.ts         # Therapeutic reply generation (structured output)
│   ├── intent-manager/
│   │   ├── manager.ts             # State machine-driven intent transitions
│   │   ├── intents.ts             # Intent routes & completion rules
│   │   └── index.ts
│   ├── session-summary/
│   │   ├── tracker.ts             # Session data collection
│   │   ├── generator.ts           # Summary computation (mood delta, distortion profile, etc.)
│   │   ├── types.ts               # SessionSummary, MoodDelta, DistortionProfile types
│   │   └── index.ts
│   ├── types.ts                   # Message interface
│   └── index.ts                   # Service exports
├── prompts/
│   ├── persona.ts                 # Persona-based prompts (I1-I8)
│   ├── few-shot.ts                # Few-shot learning prompts (I1-I8)
│   ├── chain-of-thought.ts        # Chain-of-thought prompts (I1-I8)
│   ├── plan-and-solve.ts          # Plan-and-solve prompts (I1-I8)
│   ├── pebbles.ts                 # Pebbles hybrid prompts (I1-I8)
│   ├── registry.ts                # Central prompt technique registry
│   ├── types.ts                   # PromptTechnique, IntentPromptConfig types
│   └── index.ts
├── utils/
│   └── state-machine.ts           # Generic finite state machine
└── index.ts                       # Main entry point (re-exports all public APIs)
```

### Key Concepts

#### **Intents**
Intents represent the 8 stages of the CBT process. Each intent has:
- **Completion Rules**: LLM-evaluated criteria for advancing (defined in `INTENT_COMPLETION_REGISTRY`)
- **Prompt Configuration**: Stage-specific guidance for the LLM (per technique)
- **Routing**: Automatic progression via state machine (I1 -> I2 -> ... -> I8 -> I1)

#### **Cognitive Distortions**
The engine identifies 10 cognitive distortions:
1. All-or-Nothing Thinking
2. Overgeneralization
3. Mental Filtering
4. Discounting the Positive
5. Jumping to Conclusions
6. Catastrophizing
7. Emotional Reasoning
8. Should Statements
9. Labeling
10. Personalization & Blame

#### **Crisis Categories**
The crisis detector screens for:
- Suicidal ideation
- Self-harm
- Harm to others
- Abuse or violence
- Severe distress

#### **Prompt Techniques**
Six prompting strategies with identical CBT workflows:
- **Default**: No custom prompts — generic CBT guidance
- **Persona**: Role-based guidance with clear boundaries
- **Few-shot**: Learning through 6-7 examples per stage
- **Chain-of-Thought**: Explicit step-by-step reasoning
- **Plan-and-Solve**: Two-phase execution (plan then solve)
- **Pebbles**: Hybrid approach combining multiple techniques (default for the web app)

---

## Examples

### Example 1: Complete Session Flow

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine } from '@rainev/cogni'

const model = new ChatOpenAI({ model: 'gpt-4o-mini' })
const engine = new CogniEngine(model)

// Stage 1: Situation Identification
const stage1 = await engine.respond({
  message: 'My boss yelled at me in the meeting',
  intent: 'I1',
  conversation: [],
  technique: 'pebbles',
})
// stage1.nextIntent: 'I2' (ready to identify automatic thought)

// Stage 2: Automatic Thought
const stage2 = await engine.respond({
  message: 'I thought I must be terrible at my job',
  intent: stage1.nextIntent,
  conversation: [/* previous messages */],
  technique: 'pebbles',
})
// stage2.nextIntent: 'I3' (ready for mood rating)

// ... continue through all 8 stages
```

### Example 2: Cognitive Distortion Analysis

```typescript
const messages = [
  'I always mess things up',
  'Nobody likes me',
  'This will be a disaster',
]

for (const message of messages) {
  const distortion = await engine.identifyCognitiveDistortions(message)
  console.log(`"${message}" -> ${distortion.distortion} (${distortion.confidence})`)
}

// Output:
// "I always mess things up" -> overgeneralization (0.92)
// "Nobody likes me" -> all-or-nothing thinking (0.88)
// "This will be a disaster" -> catastrophizing (0.95)
```

### Example 3: Crisis Detection Gate

```typescript
import { CrisisDetector, CogniEngine } from '@rainev/cogni'

const detector = new CrisisDetector(model)
const engine = new CogniEngine(model)

async function handleUserMessage(message: string, intent: Intent, conversation: Message[]) {
  // Step 0: Screen for crisis
  const crisis = await detector.classify(message)

  if (CrisisDetector.requiresIntervention(crisis.risk)) {
    return { reply: CrisisDetector.getSafeResponse(crisis.category), intent }
  }

  // Step 1: Normal CBT pipeline
  const result = await engine.respond({ message, intent, conversation, technique: 'pebbles' })
  return { reply: result.reply, intent: result.nextIntent }
}
```

---

## Integration with a Web App

```typescript
// In your server action (e.g., actions.ts)
'use server'
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine, CrisisDetector } from '@rainev/cogni'
import type { Intent, PromptTechnique, Message } from '@rainev/cogni'

const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY!, model: 'gpt-4o-mini' })
const engine = new CogniEngine(model)
const crisisDetector = new CrisisDetector(model)

export async function generateResponse(
  message: string,
  intent: Intent,
  technique: PromptTechnique,
  messages: Message[],
) {
  const crisis = await crisisDetector.classify(message)

  if (CrisisDetector.requiresIntervention(crisis.risk)) {
    return {
      reply: CrisisDetector.getSafeResponse(crisis.category),
      identifiedIntent: intent,
    }
  }

  const result = await engine.respond({ message, intent, conversation: messages, technique })
  return { reply: result.reply, identifiedIntent: result.nextIntent }
}
```

---

## Type Definitions

### Core Types

```typescript
// Message structure
interface Message {
  id: string
  user: string
  text: string
  ts: number
}

// Intent type
type Intent = 'I1' | 'I2' | 'I3' | 'I4' | 'I5' | 'I6' | 'I7' | 'I8'

// Prompt technique
type PromptTechnique =
  | 'default'
  | 'few-shot'
  | 'chain-of-thought'
  | 'persona'
  | 'plan-and-solve'
  | 'pebbles'

// Cognitive distortion result
interface CognitiveDistortionClassification {
  distortion: CognitiveDistortion
  confidence: number
  rationale: string
}

// Crisis classification result
interface CrisisClassification {
  risk: 'LOW' | 'MED' | 'HIGH'
  category: CrisisCategory
  reasoning: string
}

// Session summary
interface SessionSummary {
  metadata: { totalTurns, startTime, endTime, durationMs, completedFullCycle, technique, finalIntent }
  stages: SessionStageRecord[]
  stageSummaries: Partial<Record<Intent, string>>
  moodDelta: MoodDelta | null
  distortionProfile: DistortionProfile[]
  intentFunnel: IntentFunnel[]
  mermaidChart: string
  textSummary: string
}
```

---

## Design Principles

1. **Separation of Concerns**: Business logic (CBT) is isolated from UI and infrastructure
2. **Dependency Injection**: A single LLM model is injected; services create their own structured output wrappers
3. **Type Safety**: Comprehensive TypeScript types prevent runtime errors
4. **Stateless Services**: Services don't hold conversation state — the caller manages it
5. **Modularity**: Each service (distortion, crisis, intent, reply, session) can be used independently

---

## Contributing

This module is part of the Mental Health Chatbot project. To contribute:

1. Make changes in `packages/cogni/src/`
2. Ensure TypeScript types are correct: `pnpm build`
3. Test with the main application
4. Document API changes in this README

---

## License

MIT License - See LICENSE file for details

---

## Version History

- **0.1.0** (2026-01-27): Initial release with full CBT pipeline, 10 distortions, and 4 prompt techniques
- **0.2.0** (2026-02-16): Added CrisisDetector service, Pebbles prompt technique, session analytics (SessionTracker, SessionSummaryGenerator)

---

## Support

For questions or issues, please open an issue in the main repository:
https://github.com/idlesummer/MentalHealthChatbot_Group4/issues
