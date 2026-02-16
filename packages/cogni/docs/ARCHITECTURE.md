# Cogni Architecture Guide

A comprehensive guide to understanding how the Cogni CBT engine works, from the ground up.

## Table of Contents
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [The Engine: Where It All Begins](#the-engine-where-it-all-begins)
- [The Flow: What Happens When You Call respond](#the-flow-what-happens-when-you-call-respond)
- [Services Layer](#services-layer)
- [CBT Intent System](#cbt-intent-system)
- [Crisis Detection](#crisis-detection)
- [Session Analytics](#session-analytics)
- [Prompt Techniques](#prompt-techniques)
- [File Structure](#file-structure)
- [Key Concepts](#key-concepts)

---

## Quick Start

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { CogniEngine } from '@rainev/cogni'

// 1. Create an LLM model
const model = new ChatOpenAI({ model: 'gpt-4o-mini' })

// 2. Create the engine
const engine = new CogniEngine(model)

// 3. Generate a response
const result = await engine.respond({
  message: 'I failed my exam and feel terrible',
  intent: 'I1',
  conversation: [],
  technique: 'pebbles'
})

console.log(result.reply)       // AI's therapeutic response
console.log(result.nextIntent)  // Next stage in CBT process
console.log(result.distortion)  // Detected distortion
```

---

## Architecture Overview

Cogni uses a **service-oriented architecture** with a thin orchestrator pattern:

```
┌─────────────────────────────────────────────────┐
│                  CogniEngine                    │
│              (Thin Orchestrator)                │
│                                                 │
│  Coordinates 3 specialized services:            │
│  ┌───────────────────────────────────────────┐  │
│  │ 1. DistortionClassifier                   │  │
│  │    → Identifies cognitive distortions     │  │
│  ├───────────────────────────────────────────┤  │
│  │ 2. ReplyGenerator                         │  │
│  │    → Builds prompts & generates replies   │  │
│  ├───────────────────────────────────────────┤  │
│  │ 3. IntentManager                          │  │
│  │    → Manages intent transitions           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  + Standalone services (used externally):       │
│  ┌───────────────────────────────────────────┐  │
│  │ 4. CrisisDetector                         │  │
│  │    → Safety screening (LOW/MED/HIGH)      │  │
│  ├───────────────────────────────────────────┤  │
│  │ 5. SessionTracker / SessionSummaryGen.    │  │
│  │    → Session analytics & summaries        │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Benefits:**
- Each service has one clear responsibility
- Services are decoupled and independently testable
- Easy to swap implementations
- Reduced mental overhead

---

## The Engine: Where It All Begins

**Location:** `src/api/engine.ts`

The `CogniEngine` is the main entry point. It takes a single LangChain `BaseChatModel` and internally wires up all services:

```typescript
constructor(model: BaseChatModel) {
  this.model = model

  // Initialize services — each creates its own structured output wrapper
  this.distortionClassifier = new DistortionClassifier(model)
  this.replyGenerator = new ReplyGenerator(model)
  this.intentManager = new IntentManager({ model })
}
```

**What happens:**
1. Takes your base LLM model
2. Initializes three service objects
3. Each service internally creates its own `model.withStructuredOutput()` wrappers as needed
4. Stores services for the main `respond()` workflow

---

## The Flow: What Happens When You Call respond

The `respond` method orchestrates the entire CBT pipeline in 3 steps:

```typescript
async respond({ message, intent, conversation, technique }: CogniRequest) {
  // STEP 1: Classify cognitive distortion
  const distortion = await this.distortionClassifier.classify(message)

  // STEP 2: Generate therapeutic reply (prompt building is internal)
  const { reply } = await this.replyGenerator.generate({
    message, intent, technique, conversation, distortion
  })

  // STEP 3: Compute next intent via state machine
  const nextIntent = await this.intentManager.computeNextIntent(
    intent, message, conversation, technique
  )

  return { reply, nextIntent: nextIntent || intent, distortion }
}
```

### Detailed Flow

```
User Message: "I failed my exam"
       ↓
┌──────────────────────────────────────────┐
│ STEP 1: Distortion Classification        │
│                                          │
│ DistortionClassifier.classify()          │
│   → Uses structured output (zod schema)  │
│   → Returns: {                           │
│       distortion: "catastrophizing",     │
│       confidence: 0.85,                  │
│       rationale: "..."                   │
│     }                                    │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ STEP 2: Reply Generation                 │
│                                          │
│ ReplyGenerator.generate()                │
│   → Looks up prompt from PROMPT_REGISTRY │
│     for the given technique + intent     │
│   → Builds system/user messages          │
│   → Calls model with structured output   │
│   → Returns { reply: string }            │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ STEP 3: Intent Transition Evaluation     │
│                                          │
│ IntentManager.computeNextIntent()        │
│   → Checks completion rule from          │
│     INTENT_COMPLETION_REGISTRY           │
│   → Uses state machine to evaluate       │
│   → Returns next intent or stays current │
│   → Example: I1 → I2 (if complete)       │
└──────────────────────────────────────────┘
       ↓
    Result: {
      reply: "I hear that failing...",
      nextIntent: "I2",
      distortion: {...}
    }
```

---

## Services Layer

Located in `src/services/`, each service handles one responsibility.

### 1. DistortionClassifier (`distortion-classifier.ts`)

**Purpose:** Classifies cognitive distortions in user messages using structured output.

**How it works:**
```typescript
constructor(model: BaseChatModel) {
  // Creates a structured output model with cognitive distortion schema
  this.classifier = model.withStructuredOutput(cognitiveDistortionSchema)
}

async classify(message: string): Promise<CognitiveDistortionClassification> {
  return this.classifier.invoke([
    { role: 'system', content: DISTORTION_SYSTEM_PROMPT },
    { role: 'user', content: message },
  ])
}
```

**10 Cognitive Distortions:**
1. All-or-Nothing Thinking
2. Overgeneralization
3. Mental Filter
4. Discounting the Positive
5. Jumping to Conclusions
6. Magnification/Catastrophizing
7. Emotional Reasoning
8. Should Statements
9. Labeling
10. Personalization and Blame

**Returns:**
```typescript
{
  distortion: "catastrophizing",
  confidence: 0.85,
  rationale: "The user is treating the exam failure as..."
}
```

### 2. ReplyGenerator (`reply-generator.ts`)

**Purpose:** Generates therapeutic replies using the selected prompt technique.

**How it works:**
```typescript
constructor(model: BaseChatModel) {
  this.generator = model.withStructuredOutput(replySchema)
}

async generate({ message, intent, technique, conversation, distortion }) {
  // 1. Look up prompt config from PROMPT_REGISTRY[technique][intent]
  // 2. Build system prompt with role, guidelines, distortion info
  // 3. Include conversation history
  // 4. Call structured output model
  // 5. Return { reply: string }
}
```

The `PROMPT_REGISTRY` maps each `(technique, intent)` pair to a `{ role, system }` configuration that tells the LLM how to respond at each CBT stage.

### 3. IntentManager (`intent-manager/manager.ts`)

**Purpose:** Manages the 8-stage CBT intent progression using a finite state machine.

**Uses a State Machine:**
```typescript
constructor(config: IntentManagerConfig) {
  this.stateMachine = new StateMachine({
    initialState: 'I1',
    routes: INTENT_ROUTE_REGISTRY,         // I1→I2→I3→...→I8→I1
    stateMeta: INTENT_COMPLETION_REGISTRY,  // Completion rules per intent
    shouldAdvance: (decision) =>
      decision.moveToNextIntent && decision.confidence > 0.5,
    evaluator: async (...) => this.evaluateTransition(...)
  })
}
```

**Main Method:**
```typescript
async computeNextIntent(
  intent: Intent,
  message: string,
  conversation: Message[],
  technique?: PromptTechnique
): Promise<Intent | null> {
  const { nextState } = await this.stateMachine.step(
    intent, message, conversation
  )
  return nextState
}
```

### 4. CrisisDetector (`crisis-detector.ts`)

**Purpose:** Safety screening that runs *before* the CBT pipeline to catch crisis-level messages.

**Used externally** (not wired into CogniEngine — the caller decides the flow):

```typescript
const detector = new CrisisDetector(model)
const crisis = await detector.classify(message)

if (CrisisDetector.requiresIntervention(crisis.risk)) {
  return CrisisDetector.getSafeResponse(crisis.category)
}
// else proceed to engine.respond(...)
```

**Risk levels:** `LOW`, `MED`, `HIGH`

**Categories:** `none`, `suicidal_ideation`, `self_harm`, `harm_to_others`, `abuse_or_violence`, `severe_distress`

Each category has a pre-written safe template with crisis hotline information (988 Lifeline, Crisis Text Line, RAINN, etc.).

### 5. Session Analytics (`session-summary/`)

**SessionTracker** — collects turn-by-turn data during a session:
```typescript
tracker.record({ intent, userMessage, assistantReply, nextIntent, distortion })
```

**SessionSummaryGenerator** — pure computation (no LLM) that produces:
- Mood delta (pre/post scores from I3 and I7)
- Distortion frequency profile with average confidence
- Intent funnel (turns per stage, completed status)
- Mermaid flowchart of the session
- Clinician-facing text summary

```typescript
const generator = new SessionSummaryGenerator()
const summary = generator.generate(records, technique)
```

---

## CBT Intent System

The engine progresses through 8 intents (stages) in the CBT process.

### Intent Flow

```
I1: Situation Identification
    ↓
I2: Automatic Thought Identification
    ↓
I3: Mood Rating (initial)
    ↓
I4: Evidence For (thought)
    ↓
I5: Evidence Against (thought)
    ↓
I6: Alternative Thought
    ↓
I7: Mood Re-rating
    ↓
I8: Coping Strategy
    ↓
Back to I1 (new cycle)
```

### Intent Routes

**Defined in:** `src/services/intent-manager/intents.ts`

```typescript
export const INTENT_ROUTE_REGISTRY = {
  I1: 'I2',
  I2: 'I3',
  I3: 'I4',
  I4: 'I5',
  I5: 'I6',
  I6: 'I7',
  I7: 'I8',
  I8: 'I1',  // Cycle complete
}
```

### Completion Rules

Each intent has specific criteria for completion:

```typescript
export const INTENT_COMPLETION_REGISTRY = {
  I1: 'Complete only if the user described a clear situation AND at least one contextual detail...',
  I2: 'Complete if the user expressed an automatic thought...',
  I3: 'Complete if the user described emotional intensity...',
  // ... etc for I4-I8
}
```

**Example:**

```
Intent: I1 (Situation Identification)

User: "I failed my exam"
→ NOT COMPLETE (no context: when? where? circumstances?)

User: "I failed my calculus final yesterday. I studied for weeks but still got a D."
→ COMPLETE (has what, when, context)
→ Advance to I2
```

---

## Crisis Detection

The `CrisisDetector` is a standalone service that screens user messages *before* they enter the CBT pipeline.

### Flow

```
User message
    ↓
┌──────────────────────────┐
│ CrisisDetector.classify()│
│ → risk: LOW/MED/HIGH     │
│ → category               │
└──────────────────────────┘
    ↓
  risk == MED or HIGH?
    ├── YES → Serve safe template with crisis hotlines
    └── NO  → Proceed to CogniEngine.respond()
```

### Safe Response Templates

Each crisis category maps to a compassionate response with specific resources:

| Category | Resources Included |
|----------|-------------------|
| `suicidal_ideation` | 988 Lifeline, Crisis Text Line, IASP |
| `self_harm` | 988 Lifeline, Crisis Text Line |
| `harm_to_others` | 988 Lifeline, 911 |
| `abuse_or_violence` | National DV Hotline, RAINN, Childhelp |
| `severe_distress` | 988 Lifeline, Crisis Text Line |

---

## Session Analytics

The session analytics system has two components:

### SessionTracker (data collection)

Records each turn with: intent, user message, assistant reply, detected distortion, next intent, timestamp.

### SessionSummaryGenerator (computation)

Takes the recorded session data and produces a `SessionSummary` containing:

- **Metadata**: total turns, duration, technique, whether a full cycle was completed
- **Mood Delta**: extracts numeric scores from I3 (initial mood) and I7 (re-rating) to compute improvement
- **Distortion Profile**: aggregates detected distortions with frequency counts and average confidence
- **Intent Funnel**: shows how many turns each stage took and which stages were completed
- **Mermaid Flowchart**: a visual representation of the session flow
- **Text Summary**: a clinician-facing narrative summary

This is **pure computation** — no LLM calls needed. It can be run client-side for instant updates.

---

## Prompt Techniques

The engine supports 6 different prompting techniques for generating responses.

**Defined in:** `src/prompts/`

### 1. Default (`default`)
Simple, straightforward CBT guidance without special formatting. Uses `null` in the prompt registry (falls back to generic prompts).

### 2. Persona (`persona`)
Uses a detailed persona with specific role, objectives, and boundaries for each intent stage.

### 3. Few-Shot (`few-shot`)
Includes example conversations (6-7 per stage) to guide the LLM's response style.

**Structure:**
```typescript
{
  I1: {
    role: "Situation Identifier",
    system: "Your role is to help identify the situation...\n\nExamples:\n..."
  },
  // ... for each intent
}
```

### 4. Chain-of-Thought (`chain-of-thought`)
Encourages the LLM to show its reasoning process step by step.

### 5. Plan-and-Solve (`plan-and-solve`)
Breaks down the therapeutic approach into planning and execution phases.

### 6. Pebbles (`pebbles`)
A hybrid technique combining elements of persona, chain-of-thought, and few-shot. This is the default technique used by the Pebbles web app.

### How Techniques Are Used

```typescript
// In ReplyGenerator
const techniquePrompts = PROMPT_REGISTRY[technique]  // Get technique-specific prompts
const intentConfig = techniquePrompts?.[intent] ?? {
  role: 'Default CBT-based assistant',
  system: 'Use general CBT-based guidance to assist the user.',
}

// intentConfig contains:
// - role: "Situation Identifier"
// - system: "Detailed instructions for this intent stage"
```

---

## File Structure

```
src/
├── api/                              # Main API layer
│   ├── index.ts                     # Re-exports
│   └── engine.ts                    # CogniEngine implementation
│
├── services/                        # Service layer (business logic)
│   ├── index.ts                     # Barrel export
│   ├── types.ts                     # Message interface
│   ├── distortion-classifier.ts     # Detects cognitive distortions
│   ├── crisis-detector.ts           # Crisis risk screening
│   ├── reply-generator.ts           # Generates therapeutic replies
│   ├── intent-manager/              # Manages intent transitions
│   │   ├── manager.ts               # IntentManager class
│   │   ├── intents.ts               # Routes and completion rules
│   │   └── index.ts
│   └── session-summary/             # Session analytics
│       ├── tracker.ts               # SessionTracker class
│       ├── generator.ts             # SessionSummaryGenerator class
│       ├── types.ts                 # Summary type definitions
│       └── index.ts
│
├── prompts/                         # Prompt engineering techniques
│   ├── index.ts                     # Exports PROMPT_REGISTRY
│   ├── registry.ts                  # Registry mapping techniques to intent configs
│   ├── types.ts                     # PromptTechnique, IntentPromptConfig types
│   ├── persona.ts                   # Persona-based prompts
│   ├── few-shot.ts                  # Few-shot learning prompts
│   ├── chain-of-thought.ts          # Chain-of-thought prompts
│   ├── plan-and-solve.ts            # Plan-and-solve prompts
│   └── pebbles.ts                   # Pebbles hybrid prompts
│
├── utils/                           # Utility functions
│   └── state-machine.ts             # Generic finite state machine
│
└── index.ts                         # Main entry point (wildcard exports)
```

### Key Files

| File | Purpose |
|------|---------|
| `api/engine.ts` | The orchestrator — coordinates all services |
| `services/distortion-classifier.ts` | Cognitive distortion detection |
| `services/crisis-detector.ts` | Crisis risk screening with safe templates |
| `services/reply-generator.ts` | Prompt construction and reply generation |
| `services/intent-manager/manager.ts` | State machine for intent progression |
| `services/intent-manager/intents.ts` | Intent routes and completion criteria |
| `services/session-summary/generator.ts` | Session analytics computation |
| `services/session-summary/tracker.ts` | Session data collection |
| `prompts/registry.ts` | All prompt techniques registry |
| `prompts/types.ts` | Prompt type definitions |
| `utils/state-machine.ts` | Generic state machine implementation |

---

## Key Concepts

### 1. Structured Outputs

The engine uses **structured outputs** to get predictable JSON from the LLM:

```typescript
// Define schema with zod
const schema = z.object({
  distortion: z.enum(['catastrophizing', 'overgeneralization', ...]),
  confidence: z.number().min(0).max(1),
  rationale: z.string()
})

// Create structured model
const structuredModel = model.withStructuredOutput(schema)

// Now LLM always returns valid JSON matching the schema
const result = await structuredModel.invoke([...])
// result = { distortion: "catastrophizing", confidence: 0.85, rationale: "..." }
```

### 2. State Machine

Intent transitions use a state machine pattern:

```typescript
StateMachine({
  initialState: 'I1',
  routes: { I1: 'I2', I2: 'I3', ... },       // Where to go next
  stateMeta: { I1: 'rule...', ... },          // Completion criteria
  shouldAdvance: (decision) => ...,           // Decision function
  evaluator: async (...) => ...               // Evaluation logic
})
```

**Benefits:**
- Enforces valid state transitions
- Centralizes transition logic
- Easy to test and debug

### 3. Service Pattern

Each service is:
- **Single responsibility** — does one thing well
- **Injected** — dependencies (model) passed to constructor
- **Testable** — can mock the model
- **Swappable** — easy to replace implementations

Example:
```typescript
// Service with dependency injection
class DistortionClassifier {
  constructor(model: BaseChatModel) {
    this.classifier = model.withStructuredOutput(schema)
  }

  async classify(message: string) {
    return this.classifier.invoke([...])
  }
}

// Easy to test with mocks
const mockModel = { withStructuredOutput: () => ({ invoke: () => mockResult }) }
const detector = new DistortionClassifier(mockModel)
```

### 4. Prompt Techniques

Different techniques optimize LLM responses:

| Technique | When to Use |
|-----------|-------------|
| **default** | Quick responses, simple cases |
| **few-shot** | Need consistent response style |
| **chain-of-thought** | Complex reasoning required |
| **persona** | Need specific therapeutic voice |
| **plan-and-solve** | Multi-step problem solving |
| **pebbles** | Production use (hybrid of best approaches) |

### 5. Type Safety

The codebase uses TypeScript extensively:

```typescript
// Everything is typed
type Intent = 'I1' | 'I2' | 'I3' | 'I4' | 'I5' | 'I6' | 'I7' | 'I8'
type PromptTechnique = 'default' | 'few-shot' | 'chain-of-thought' | 'persona' | 'plan-and-solve' | 'pebbles'

interface CogniRequest {
  message: string
  intent: Intent
  conversation: Message[]
  technique: PromptTechnique
}

// Catches errors at compile time
engine.respond({
  message: "Hello",
  intent: "I9",  // Type error: "I9" is not valid
  // ...
})
```

---

## Understanding a Complete Example

Let's trace through a complete interaction:

```typescript
const engine = new CogniEngine(model)

const result = await engine.respond({
  message: "I failed my calculus final yesterday. I studied for weeks but got a D.",
  intent: "I1",
  conversation: [],
  technique: "pebbles"
})
```

**Step-by-step:**

1. **DistortionClassifier** analyzes the message
   - Detects: "overgeneralization" (implies total failure from one exam)
   - Returns structured JSON with confidence and rationale

2. **ReplyGenerator** constructs prompt and generates response
   - Loads pebbles technique prompts for I1
   - Builds system prompt with role, intent guidelines, and distortion context
   - Includes conversation history (empty in this case)
   - Calls model with structured output to get the reply

3. **IntentManager evaluates transition**
   - Checks completion rule for I1: needs clear situation + context
   - User message has: what (failed exam), when (yesterday), context (studied for weeks)
   - Decision: Complete, advance to I2
   - Uses state machine to transition: I1 -> I2

4. **Return result**
   ```typescript
   {
     reply: "I hear that you failed your calculus final...",
     nextIntent: "I2",
     distortion: {
       distortion: "overgeneralization",
       confidence: 0.78,
       rationale: "..."
     }
   }
   ```

**Next call would use:**
```typescript
{
  intent: "I2",  // From previous result.nextIntent
  conversation: [
    { user: 'user', text: "I failed my calculus..." },
    { user: 'assistant', text: "I hear that you failed..." }
  ]
}
```

---

## Common Questions

### Q: Why use a single model instead of separate models per service?

**A:** Simplicity. Each service internally calls `model.withStructuredOutput(schema)` to create its own specialized wrapper. The caller only provides one model.

### Q: Why is CrisisDetector separate from CogniEngine?

**A:** The crisis gate runs *before* the CBT pipeline and may short-circuit it entirely. Keeping it separate lets the caller decide the control flow (e.g., a server action can return a safe response without touching the engine).

### Q: Why use a state machine for intents?

**A:** It ensures valid transitions, makes the flow explicit, and prevents skipping stages or getting stuck.

### Q: Can I add a new prompt technique?

**A:** Yes! Create a new technique file in `src/prompts/`, define prompts for each intent, add it to `PROMPT_REGISTRY` in `prompts/registry.ts`, and update the `PromptTechnique` type in `prompts/types.ts`.

### Q: What if I want to customize completion rules?

**A:** Edit `src/services/intent-manager/intents.ts` and modify `INTENT_COMPLETION_REGISTRY`. The IntentManager will automatically use your new rules.

### Q: How do I add a new cognitive distortion?

**A:** Add it to `COGNITIVE_DISTORTIONS` and `COGNITIVE_DISTORTION_KEYS` in `services/distortion-classifier.ts`, then update the zod schema used for structured outputs.

### Q: How do I add a new crisis category?

**A:** Add the category to the `CrisisCategory` type and zod schema in `services/crisis-detector.ts`, update the system prompt, and add a safe response template to `CRISIS_SAFE_RESPONSES`.

---

## Next Steps

1. **Read the examples** in `examples/` to see practical usage
2. **Check `README-INTENT-EVALUATION-BUG.md`** for known issues
3. **Experiment with different prompt techniques** to see their effects
4. **Try modifying completion rules** in `services/intent-manager/intents.ts`
5. **Look at the service implementations** to understand internals

---

## Summary

**Core Flow:**
```
User Message → Crisis Detection → Distortion Detection → Reply Generation → Intent Evaluation → Result
```

**Key Components:**
- **CogniEngine**: Thin orchestrator coordinating 3 internal services
- **3 Internal Services**: DistortionClassifier, ReplyGenerator, IntentManager
- **2 Standalone Services**: CrisisDetector, SessionTracker/SessionSummaryGenerator
- **8 Intents**: I1 -> I2 -> I3 -> I4 -> I5 -> I6 -> I7 -> I8 -> I1
- **6 Techniques**: default, few-shot, chain-of-thought, persona, plan-and-solve, pebbles

**Architecture Pattern:**
- Service-oriented with dependency injection
- State machine for intent transitions
- Structured outputs for predictable LLM responses
- Single responsibility per module

This architecture makes the codebase:
- Easy to understand (clear responsibilities)
- Easy to test (isolated services)
- Easy to extend (add techniques, intents, distortions, crisis categories)
- Easy to maintain (low coupling)
