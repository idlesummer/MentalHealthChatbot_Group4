# Cogni API Guide

A comprehensive guide to understanding how the Cogni CBT engine works, from the ground up.

## Table of Contents
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [The Engine: Where It All Begins](#the-engine-where-it-all-begins)
- [The Flow: What Happens When You Call respond](#the-flow-what-happens-when-you-call-generateresponse)
- [Services Layer](#services-layer)
- [CBT Intent System](#cbt-intent-system)
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
  technique: 'few-shot'
})

console.log(result.reply)           // AI's therapeutic response
console.log(result.nextIntent)      // Next stage in CBT process
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
│  Coordinates 4 specialized services:            │
│  ┌───────────────────────────────────────────┐  │
│  │ 1. PromptBuilder                          │  │
│  │    → Builds prompts for LLM               │  │
│  ├───────────────────────────────────────────┤  │
│  │ 2. DistortionClassifier                   │  │
│  │    → Identifies cognitive distortions     │  │
│  ├───────────────────────────────────────────┤  │
│  │ 3. ReplyParser                            │  │
│  │    → Parses LLM responses to strings      │  │
│  ├───────────────────────────────────────────┤  │
│  │ 4. IntentManager                          │  │
│  │    → Manages intent transitions           │  │
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

The `CogniEngine` is the main entry point. When you create an engine:

```typescript
constructor(model: BaseChatModel) {
  this.model = model

  // Initialize services
  const distortionClassifier = new DistortionClassifier(model)
  const promptBuilder = new PromptBuilder()
  const replyParser = new ReplyParser()
  const intentManager = new IntentManager({ model, promptBuilder })

  // Store services for later use
  this.services = {
    promptBuilder,
    distortionClassifier,
    replyParser,
    intentManager,
  }
}
```

**What happens:**
1. Takes your base LLM model
2. Initializes four service objects
3. Services handle their own structured outputs internally
4. Stores everything for the main workflow

---

## The Flow: What Happens When You Call respond

The `respond` method orchestrates the entire CBT pipeline in 4 steps:

```typescript
async respond({ message, intent, conversation, technique }: CogniRequest) {
  // STEP 1: Classify cognitive distortion
  const distortion = await this.services.distortionClassifier.classify(message)

  // STEP 2: Build the prompt (PROMPT_REGISTRY imported in PromptBuilder)
  const replyPrompt = this.services.promptBuilder.buildReplyPrompt(
    message,
    intent,
    technique,
    conversation,
    distortion
  )

  // STEP 3: Generate response from LLM
  const completion = await this.model.invoke(replyPrompt)
  const reply = this.services.replyParser.parse(completion)

  // STEP 4: Compute next intent
  const newIntent = await this.services.intentManager.computeNextIntent(
    intent,
    message,
    conversation,
    technique
  )
  const nextIntent = newIntent || intent

  return { reply, nextIntent, distortion }
}
```

### Detailed Flow

```
User Message: "I failed my exam"
       ↓
┌──────────────────────────────────────────┐
│ STEP 1: Distortion Classification        │
│                                          │
│ DistortionClassifier.classify()            │
│   → Uses structured output model         │
│   → Returns: {                           │
│       distortion: "Catastrophizing",     │
│       confidence: 0.85,                  │
│       rationale: "..."                   │
│     }                                    │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ STEP 2: Prompt Building                  │
│                                          │
│ PromptBuilder.buildReplyPrompt()         │
│   → Accepts inline parameters:           │
│     • message, intent, technique         │
│     • conversation, distortion           │
│   → Uses PROMPT_REGISTRY (imported)      │
│   → Outputs full prompt string           │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ STEP 3: LLM Response Generation          │
│                                          │
│ model.invoke(fullPrompt)                 │
│   → Sends prompt to LLM                  │
│   → Gets back response                   │
│                                          │
│ ReplyParser.parse()           │
│   → Extracts text from response object   │
│   → Handles different response formats   │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ STEP 4: Intent Transition Evaluation     │
│                                          │
│ IntentManager.computeNextIntent()        │
│   → Checks if current intent is complete │
│   → Uses state machine logic             │
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

### 1. PromptBuilder (`prompt-builder.ts`)

**Purpose:** Centralizes all prompt construction logic

**Key Methods:**

```typescript
buildReplyPrompt(
  message: string,
  intent: Intent,
  technique: PromptTechnique,
  conversation: Message[],
  distortion: CognitiveDistortionClassification
) {
  // Builds the main prompt for generating therapeutic responses
  // Includes: conversation history, intent guidelines, distortion info
  // Uses PROMPT_REGISTRY imported directly from @/prompts
}

buildIntentEvaluationPrompt(
  state: Intent,
  input: string,
  context: Message[],
  intentConfig: IntentPromptConfig,
  completionRule: string
) {
  // Builds prompts for evaluating if intent is complete
  // Includes: conversation history, completion rules
}
```

**Example Output:**
```
You are a CBT-based assistant helping the user manage their thoughts and emotions.
Use this conversation history to inform your response:
user: I failed my exam

Use the following guidelines for this stage:
[Intent-specific system prompt from technique]

Identified Cognitive Distortion: Catastrophizing.

User Message:
'I failed my exam'

Please respond in a way that aligns with the user's CBT stage and identified distortion.
```

### 2. DistortionClassifier (`distortion-classifier.ts`)

**Purpose:** Classifies cognitive distortions in user messages

**How it works:**
```typescript
constructor(model: BaseChatModel) {
  // Creates a structured output model with cognitive distortion schema
  this.classifier = model.withStructuredOutput(cognitiveDistortionSchema)
}

async classify(message: string): Promise<CognitiveDistortionClassification> {
  // Builds prompt with all distortion options and classifies the message
  return this.classifier.invoke([...])
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
  distortion: "Catastrophizing",
  confidence: 0.85,
  rationale: "The user is treating the exam failure as..."
}
```

### 3. ReplyParser (`reply-parser.ts`)

**Purpose:** Safely extracts text from LLM responses

**Why needed:** Different LLM providers return responses in different formats:
- Some return strings directly
- Some return `{ text: "..." }`
- Some return `{ content: "..." }`

```typescript
parse(response: unknown): string {
  if (typeof response === 'string') return response

  if (typeof response === 'object' && response !== null) {
    if ('text' in response) return response.text
    if ('content' in response) return response.content
  }

  return String(response)
}
```

### 4. IntentManager (`intent-manager.ts`)

**Purpose:** Manages the 8-stage CBT intent progression

**Key Responsibility:** Decides when to move from one intent to the next

**Uses a State Machine:**
```typescript
constructor(config: IntentManagerConfig) {
  // config contains: { model, promptBuilder }
  // PROMPT_REGISTRY is imported directly from @/prompts

  this.stateMachine = new StateMachine({
    initialState: 'I1',
    routes: INTENT_ROUTE_REGISTRY,           // I1→I2→I3→...→I8→I1
    stateMeta: INTENT_COMPLETION_REGISTRY,   // Rules for each intent
    shouldAdvance: (decision) =>
      decision.moveToNextIntent && decision.confidence > 0.5,
    evaluator: async (...) => this.evaluateTransition(...)
  })
}
```

**Main Method:**
```typescript
async computeNextIntent(
  intent: string,
  message: string,
  conversation: Message[],
  technique?: PromptTechnique
): Promise<string | null> {
  const { nextState } = await this.stateMachine.step(
    intent,
    message,
    conversation
  )
  return nextState
}
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

**Defined in:** `src/services/intents.ts`

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

## Prompt Techniques

The engine supports 5 different prompting techniques for generating responses.

**Defined in:** `src/prompts/`

### 1. Default (`null`)
Simple, straightforward CBT guidance without special formatting.

### 2. Few-Shot (`few-shot`)
Includes example conversations to guide the LLM's response style.

**Structure:**
```typescript
{
  I1: {
    role: "Situation Identifier",
    system: "Your role is to help identify the situation...",
    examples: [
      {
        user: "I had a fight with my friend",
        assistant: "Can you tell me more about when this happened?"
      },
      // ... more examples
    ]
  },
  I2: { ... },
  // ... for each intent
}
```

### 3. Chain-of-Thought (`chain-of-thought`)
Encourages the LLM to show its reasoning process.

### 4. Persona (`persona`)
Uses a detailed persona with specific role, objectives, and boundaries.

### 5. Plan-and-Solve (`plan-and-solve`)
Breaks down the therapeutic approach into planning and execution steps.

### How Techniques Are Used

```typescript
// In PromptBuilder.buildReplyPrompt()
const techniquePrompts = PROMPT_REGISTRY[technique]  // Get technique-specific prompts
const intentConfig = techniquePrompts?.[intent] ?? {
  role: 'Default CBT-base assistant',
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
├── api/                       # Main API layer
│   ├── index.ts              # Re-exports (no types)
│   └── engine.ts             # CogniEngine implementation
│
├── services/                 # Service layer (business logic)
│   ├── index.ts              # Barrel export
│   ├── prompt-builder.ts     # Builds prompts for LLM
│   ├── distortion-classifier.ts  # Detects cognitive distortions
│   ├── reply-parser.ts       # Parses LLM responses
│   ├── intent-manager.ts     # Manages intent transitions
│   └── intents.ts            # Intent routes and completion rules
│
├── prompts/                  # Prompt engineering techniques
│   ├── index.ts              # Exports PROMPT_REGISTRY
│   ├── registry.ts           # Main registry of all techniques
│   ├── types.ts              # Prompt type definitions
│   ├── persona.ts            # Persona-based prompts
│   └── ...                   # Other technique implementations
│
├── utils/                    # Utility functions
│   └── state-machine.ts      # Generic state machine
│
└── index.ts                  # Main entry point (wildcard exports)
```

### Key Files

| File | Purpose |
|------|---------|
| `api/engine.ts` | The orchestrator - coordinates everything |
| `services/intent-manager.ts` | State machine for intent progression |
| `services/prompt-builder.ts` | Centralizes all prompt construction |
| `services/intents.ts` | Intent routes and completion criteria |
| `services/distortion-classifier.ts` | Cognitive distortion detection |
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
  distortion: z.enum(['Catastrophizing', 'Overgeneralization', ...]),
  confidence: z.number().min(0).max(1),
  rationale: z.string()
})

// Create structured model
const structuredModel = model.withStructuredOutput(schema)

// Now LLM always returns valid JSON matching the schema
const result = await structuredModel.invoke("I failed my exam")
// result = { distortion: "Catastrophizing", confidence: 0.85, rationale: "..." }
```

### 2. State Machine

Intent transitions use a state machine pattern:

```typescript
StateMachine({
  initialState: 'I1',
  routes: { I1: 'I2', I2: 'I3', ... },       // Where to go next
  stateMeta: { I1: 'rule...', ... },         // Completion criteria
  shouldAdvance: (decision) => ...,          // Decision function
  evaluator: async (...) => ...              // Evaluation logic
})
```

**Benefits:**
- Enforces valid state transitions
- Centralizes transition logic
- Easy to test and debug

### 3. Service Pattern

Each service is:
- **Single responsibility** - does one thing well
- **Injected** - dependencies passed to constructor
- **Testable** - can mock dependencies
- **Swappable** - easy to replace implementations

Example:
```typescript
// Service with dependency injection
class DistortionClassifier {
  constructor(private classifier: Runnable) {}

  async detect(message: string) {
    return this.classifier.invoke(message)
  }
}

// Easy to test with mocks
const mockClassifier = { invoke: () => mockResult }
const detector = new DistortionClassifier(mockClassifier)
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

### 5. Type Safety

The codebase uses TypeScript extensively:

```typescript
// Everything is typed
type Intent = 'I1' | 'I2' | 'I3' | 'I4' | 'I5' | 'I6' | 'I7' | 'I8'
type PromptTechnique = 'default' | 'few-shot' | 'chain-of-thought' | 'persona' | 'plan-and-solve'

interface CogniRequest {
  message: string
  intent: Intent
  conversation: Message[]
  technique: PromptTechnique
}

// Catches errors at compile time
engine.respond({
  message: "Hello",
  intent: "I9",  // ❌ Type error: "I9" is not valid
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
  technique: "few-shot"
})
```

**Step-by-step:**

1. **DistortionClassifier** analyzes the message
   - Detects: "Overgeneralization" (implies total failure from one exam)
   - Returns structured JSON with confidence and rationale

2. **PromptBuilder** creates a prompt
   - Loads few-shot technique prompts for I1
   - Includes conversation history (empty in this case)
   - Adds detected distortion info
   - Adds intent-specific guidelines from few-shot prompts

3. **LLM generates response**
   - Uses the constructed prompt
   - Generates therapeutic response aligned with I1 (situation identification)
   - Asks clarifying questions to fully understand the situation

4. **IntentManager evaluates transition**
   - Checks completion rule for I1: needs clear situation + context
   - User message has: what (failed exam), when (yesterday), context (studied for weeks)
   - Decision: ✅ Complete, advance to I2
   - Uses state machine to transition: I1 → I2

5. **Return result**
   ```typescript
   {
     reply: "I hear that you failed your calculus final...",
     nextIntent: "I2",
     distortion: {
       distortion: "Overgeneralization",
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

### Q: Why separate PromptBuilder from IntentManager?

**A:** Separation of concerns. PromptBuilder handles string formatting, IntentManager handles state transitions. They can be tested and modified independently.

### Q: Why use a state machine for intents?

**A:** It ensures valid transitions, makes the flow explicit, and prevents skipping stages or getting stuck.

### Q: Can I add a new prompt technique?

**A:** Yes! Create a new technique file in `src/prompts/`, define prompts for each intent, add it to `PROMPT_REGISTRY` in `prompts/registry.ts`, and update the `PromptTechnique` type in `prompts/types.ts`.

### Q: What if I want to customize completion rules?

**A:** Edit `src/services/intents.ts` and modify `INTENT_COMPLETION_REGISTRY`. The IntentManager will automatically use your new rules.

### Q: How do I add a new cognitive distortion?

**A:** Add it to `COGNITIVE_DISTORTIONS` and `COGNITIVE_DISTORTION_KEYS` in `services/distortion-classifier.ts`, then update the zod schema used for structured outputs.

---

## Next Steps

1. **Read the examples** in `examples/` to see practical usage
2. **Check `README-INTENT-EVALUATION-BUG.md`** for known issues
3. **Experiment with different prompt techniques** to see their effects
4. **Try modifying completion rules** in `services/intents.ts`
5. **Look at the service implementations** to understand internals

---

## Summary

**Core Flow:**
```
User Message → Distortion Detection → Prompt Building → LLM Generation → Intent Evaluation → Result
```

**Key Components:**
- **CogniEngine**: Thin orchestrator
- **4 Services**: PromptBuilder, DistortionClassifier, ReplyParser, IntentManager
- **8 Intents**: I1 → I2 → I3 → I4 → I5 → I6 → I7 → I8 → I1
- **5 Techniques**: default, few-shot, chain-of-thought, persona, plan-and-solve

**Architecture Pattern:**
- Service-oriented with dependency injection
- State machine for intent transitions
- Structured outputs for predictable LLM responses
- Single responsibility per module

This architecture makes the codebase:
- Easy to understand (clear responsibilities)
- Easy to test (isolated services)
- Easy to extend (add techniques, intents, distortions)
- Easy to maintain (low coupling)
