# Technique Comparison Example

Compare all 4 prompt engineering techniques side-by-side to see how they differ.

## What It Does

- Tests the same user message with all 4 techniques
- Shows response variations across techniques
- Helps you choose the right technique for your use case

## The 4 Techniques

### 1. Persona 🎭
- **Approach**: Role-based guidance with clear boundaries
- **Strength**: Professional, structured therapeutic stance
- **Best for**: Users wanting clear, boundary-aware support

### 2. Few-Shot 📚
- **Approach**: 6-7 detailed examples per CBT stage
- **Strength**: Demonstrates desired interaction patterns
- **Best for**: Training models with extensive examples

### 3. Chain-of-Thought 🧠
- **Approach**: Explicit "Think → Action" reasoning steps
- **Strength**: Transparent decision-making process
- **Best for**: Understanding model reasoning

### 4. Plan-and-Solve 📋
- **Approach**: Two-phase execution (PLAN → SOLVE)
- **Strength**: Separation of strategy and execution
- **Best for**: Complex situations requiring planning

## Setup

```bash
pnpm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
```

## Run

```bash
pnpm start
```

## Expected Output

```
🧠 Cogni CBT Engine - Technique Comparison

════════════════════════════════════════════════════════════════
  📝 SCENARIO: Situation Identification
════════════════════════════════════════════════════════════════

👤 User Message: "I'm worried about my presentation tomorrow."

🎯 Intent: I1

────────────────────────────────────────────────────────────────

🔧 TECHNIQUE: PERSONA
   Role-based with clear boundaries

⏳ Generating response...

💬 RESPONSE:
   I hear that you're worried about your presentation. That's a common
   feeling before a big event. Can you tell me more about what specifically
   is making you feel worried?

📊 METADATA:
   Next Intent: I1
   Distortion:  Catastrophizing (75%)

────────────────────────────────────────────────────────────────

🔧 TECHNIQUE: FEW-SHOT
   Learning through 6-7 examples

⏳ Generating response...

💬 RESPONSE:
   Presentations can definitely be nerve-wracking. What's the particular
   aspect of tomorrow's presentation that's weighing on you the most?

[... continues for all 4 techniques ...]
```

## Use Cases

### Choose Persona if you need:
- Clear professional boundaries
- Consistent therapeutic role
- Structured interaction format

### Choose Few-Shot if you need:
- Rich example-driven guidance
- Pattern demonstration
- Extensive behavioral modeling

### Choose Chain-of-Thought if you need:
- Transparent reasoning
- Debugging model decisions
- Understanding the "why"

### Choose Plan-and-Solve if you need:
- Explicit planning phase
- Strategic thinking shown
- Complex problem decomposition

## Code Walkthrough

### Running Multiple Techniques
```typescript
const techniques: PromptTechnique[] = [
  "persona",
  "few-shot",
  "chain-of-thought",
  "plan-and-solve",
];

for (const technique of techniques) {
  const result = await engine.respond({
    message: userMessage,
    intent: "I1",
    conversation: [],
    technique: technique, // <-- Key difference
  });

  console.log(technique, result.reply);
}
```

## Key Insight

All techniques implement the **exact same CBT workflow** (I1→I2→...→I8), they just differ in **how they prompt the model** to generate responses.

Think of them as different "coaching styles" that achieve the same therapeutic outcome.

## Experiment

Try modifying the test scenarios to see how techniques differ:

```typescript
const testScenarios = [
  {
    intent: "I1",
    message: "Your custom scenario...",
    description: "Your description",
  },
];
```

## Learn More

- See **basic-usage** for getting started
- See **complete-session** for a full CBT cycle
- Read the Cogni documentation for technique details
