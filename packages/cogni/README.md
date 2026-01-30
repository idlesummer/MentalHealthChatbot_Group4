# Cogni - Cognitive Behavioral Therapy Engine

A standalone, reusable CBT (Cognitive Behavioral Therapy) pipeline implementation with support for 8-stage intent-driven workflow, cognitive distortion classification, and multiple prompt engineering techniques.

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

✅ **8-Stage Intent System** - Structured progression through CBT stages
✅ **Cognitive Distortion Classification** - Classifies 10 cognitive distortions
✅ **4 Prompt Techniques** - Persona, Few-shot, Chain-of-Thought, Plan-and-Solve
✅ **Flexible API** - Class-based or function-based interfaces
✅ **Type-Safe** - Full TypeScript support with comprehensive types
✅ **LLM Agnostic** - Works with any LLM through dependency injection
✅ **Isolated & Reusable** - No external dependencies on UI or specific frameworks

---

## Installation

Since this is an internal module, import it directly from the source:

```typescript
import { CogniEngine } from '@/cogni/src';
```

Or if published as a package:

```bash
npm install @mental-health-chatbot/cogni
```

---

## Quick Start

### Basic Usage

```typescript
import { CogniEngine } from '@/cogni/src';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

// 1. Set up your LLM models
const mainModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const distortionClassifier = mainModel.withStructuredOutput(
  z.object({
    distortion: z.enum([
      "All-or-Nothing Thinking",
      "Overgeneralization",
      // ... other distortions
    ]),
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

// 2. Create the engine
const engine = new CogniEngine({
  mainModel,
  distortionClassifier,
  intentEvaluator,
});

// 3. Generate a response
const result = await engine.respond({
  message: "I failed my exam and I feel terrible.",
  intent: "I1",
  conversation: [],
  technique: "persona",
});

console.log(result.reply); // Assistant's therapeutic response
console.log(result.nextIntent); // Next CBT stage (e.g., "I2")
console.log(result.distortion); // Identified distortion
```

---

## API Reference

### `CogniEngine`

The main class for interacting with the CBT pipeline.

#### Constructor

```typescript
constructor(config: CogniEngineConfig)
```

**Parameters:**
- `config.mainModel` - The main LLM model for generating responses
- `config.distortionClassifier` - Model for classifying cognitive distortions
- `config.intentEvaluator` - Model for evaluating intent transitions

#### Methods

##### `respond(params: CogniRequest): Promise<CogniResponse>`

Generates a CBT response for the user's message.

**Parameters:**
```typescript
{
  message: string;              // User's message
  intent: string;        // Current CBT stage (I1-I8)
  conversation: Message[]; // Full conversation history
  technique: PromptTechnique; // Selected prompting technique
}
```

**Returns:**
```typescript
{
  reply: string;                // Assistant's response
  nextIntent: string;           // Next CBT stage
  distortion?: {       // Identified distortion
    distortion: string;
    confidence: number;
    rationale: string;
  };
}
```

##### `identifyCognitiveDistortions(message: string): Promise<CognitiveDistortionClassification>`

Identifies cognitive distortions in a message.

##### `computeNextIntent(params): Promise<string>`

Evaluates whether to transition to the next intent.

##### `getIntents(): Intent[]`

Returns all available intents: `["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8"]`

##### `getInitialIntent(): Intent`

Returns the initial intent for a new session: `"I1"`

##### `getPromptTechniques(): PromptTechnique[]`

Returns available prompt techniques: `["default", "few-shot", "chain-of-thought", "persona", "plan-and-solve"]`

---

### Function-Based API

For one-off calls without instantiating the engine:

```typescript
import { generateCBTResponse } from '@/cogni/src';

const result = await generateCBTResponse({
  // Request parameters
  message: "I'm worried about my presentation",
  intent: "I1",
  conversation: [],
  technique: "persona",

  // Model dependencies
  mainModel,
  distortionClassifier,
  intentEvaluator,
});
```

---

## Architecture

### Directory Structure

```
src/cogni/
├── src/
│   ├── core/
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── intent.ts         # Intent routing & transitions
│   │   └── distortion.ts     # Cognitive distortion classification
│   ├── prompts/
│   │   ├── Persona.ts        # Persona-based prompts
│   │   ├── Fewshot.ts        # Few-shot learning prompts
│   │   ├── ChainOfThought.ts # Chain-of-thought prompts
│   │   ├── PlanAndSolve.ts   # Plan-and-solve prompts
│   │   └── index.ts          # Prompt exports
│   ├── api/
│   │   └── index.ts          # Main API interface
│   └── index.ts              # Main export file
├── package.json
├── tsconfig.json
└── README.md
```

### Key Concepts

#### **Intents**
Intents represent the 8 stages of the CBT process. Each intent has:
- **Completion Rules**: Criteria for advancing to the next stage
- **Prompt Configuration**: Stage-specific guidance for the LLM
- **Routing**: Automatic progression (I1→I2→I3...→I8→I1)

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

#### **Prompt Techniques**
Four prompting strategies with identical CBT workflows:
- **Persona**: Role-based guidance with clear boundaries
- **Few-shot**: Learning through 6-7 examples per stage
- **Chain-of-Thought**: Explicit reasoning steps
- **Plan-and-Solve**: Two-phase execution (plan → solve)

---

## Examples

### Example 1: Complete Session Flow

```typescript
import { CogniEngine } from '@/cogni/src';

const engine = new CogniEngine({ /* ... */ });

// Stage 1: Situation Identification
const stage1 = await engine.respond({
  message: "My boss yelled at me in the meeting",
  intent: "I1",
  conversation: [],
  technique: "persona",
});
// nextIntent: "I2" (ready to identify automatic thought)

// Stage 2: Automatic Thought
const stage2 = await engine.respond({
  message: "I thought I must be terrible at my job",
  intent: "I2",
  conversation: [/* previous messages */],
  technique: "persona",
});
// nextIntent: "I3" (ready for mood rating)

// ... continue through all 8 stages
```

### Example 2: Switching Prompt Techniques

```typescript
// Use different techniques for different users
const techniques = ["persona", "few-shot", "chain-of-thought", "plan-and-solve"];

for (const technique of techniques) {
  const result = await engine.respond({
    message: userMessage,
    intent: intent,
    conversation: history,
    technique: technique,
  });

  console.log(`${technique}: ${result.reply}`);
}
```

### Example 3: Cognitive Distortion Analysis

```typescript
const messages = [
  "I always mess things up",
  "Nobody likes me",
  "This will be a disaster",
];

for (const message of messages) {
  const distortion = await engine.identifyCognitiveDistortions(message);
  console.log(`"${message}" → ${distortion.distortion} (${distortion.confidence})`);
}

// Output:
// "I always mess things up" → Overgeneralization (0.92)
// "Nobody likes me" → All-or-Nothing Thinking (0.88)
// "This will be a disaster" → Catastrophizing (0.95)
```

---

## Integration with Existing App

To integrate Cogni with the existing chatbot:

```typescript
// In your actions.ts or equivalent
import { CogniEngine } from '@/cogni/src';

// Initialize once
const cogniEngine = new CogniEngine({
  mainModel: model,
  distortionClassifier: classifyModel,
  intentEvaluator: determineModel,
});

// In your respond function
export async function respond(
  message: string,
  intent: string,
  prompt: string,
  messages: Message[]
) {
  const result = await cogniEngine.respond({
    message,
    intent: intent,
    conversation: messages,
    technique: prompt,
  });

  return {
    reply: result.reply,
    identifiedIntent: result.nextIntent,
  };
}
```

---

## Type Definitions

### Core Types

```typescript
// Message structure
interface Message {
  id: string;
  user: string;
  text: string;
  ts: number;
}

// Intent type
type Intent = "I1" | "I2" | "I3" | "I4" | "I5" | "I6" | "I7" | "I8";

// Prompt technique
type PromptTechnique =
  | "default"
  | "few-shot"
  | "chain-of-thought"
  | "persona"
  | "plan-and-solve";

// Cognitive distortion result
interface CognitiveDistortionClassification {
  distortion: CognitiveDistortion;
  confidence: number;
  rationale: string;
}
```

---

## Design Principles

1. **Separation of Concerns**: Business logic (CBT) is isolated from UI and infrastructure
2. **Dependency Injection**: LLM models are injected, making the engine testable and flexible
3. **Type Safety**: Comprehensive TypeScript types prevent runtime errors
4. **Immutability**: Pure functions with no side effects where possible
5. **Modularity**: Each component can be used independently

---

## Testing

```typescript
// Mock LLM for testing
const mockModel = {
  invoke: jest.fn().mockResolvedValue({ text: "Mock response" })
};

const mockClassifier = {
  invoke: jest.fn().mockResolvedValue({
    distortion: "Overgeneralization",
    confidence: 0.9,
    rationale: "Test"
  })
};

const engine = new CogniEngine({
  mainModel: mockModel,
  distortionClassifier: mockClassifier,
  intentEvaluator: mockEvaluator,
});

// Run tests
const result = await engine.respond(/* ... */);
expect(result.reply).toBe("Mock response");
```

---

## Contributing

This module is part of the Mental Health Chatbot project. To contribute:

1. Make changes in `src/cogni/`
2. Ensure TypeScript types are correct: `npm run type-check`
3. Test with the main application
4. Document API changes in this README

---

## License

MIT License - See LICENSE file for details

---

## Version History

- **1.0.0** (2026-01-27): Initial release with full CBT pipeline, 10 distortions, and 4 prompt techniques

---

## Support

For questions or issues, please open an issue in the main repository:
https://github.com/idlesummer/MentalHealthChatbot_Group4/issues
