# Complete Session Example

This example demonstrates a full CBT session progressing through all 8 intents.

## What It Does

- Simulates a complete therapeutic conversation
- Shows progression through all CBT stages (I1 → I2 → ... → I8)
- Displays the full transcript with intent transitions
- Provides a session summary at the end

## The 8-Stage Journey

1. **I1**: Situation - "My boss yelled at me..."
2. **I2**: Automatic Thought - "I'm terrible at my job"
3. **I3**: Mood Rating - 80/100 anxiety
4. **I4**: Evidence For - "I made mistakes..."
5. **I5**: Evidence Against - "I also completed projects..."
6. **I6**: Alternative Thought - "I'm human, capable but imperfect"
7. **I7**: Mood Re-rating - 40/100 (improvement!)
8. **I8**: Coping Strategy - Journaling recommendation

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
🧠 Cogni CBT Engine - Complete Session Example

════════════════════════════════════════════════════════════════
                    🧘 CBT SESSION TRANSCRIPT
════════════════════════════════════════════════════════════════

🎯 INTENT: I1 - Situation Identification
────────────────────────────────────────────────────────────────

👤 USER:
   "My boss yelled at me during the team meeting yesterday..."

⏳ Processing...

🤖 ASSISTANT:
   I'm sorry to hear that happened. That sounds really difficult...

📊 Metadata:
   Next Intent: I2
   Distortion:  Personalization & Blame (87%)

[... continues through all 8 intents ...]

════════════════════════════════════════════════════════════════
                       📋 SESSION SUMMARY
════════════════════════════════════════════════════════════════

💬 Total messages: 16
🔄 Intents covered: I1 → I2 → I3 → I4 → I5 → I6 → I7 → I8

🎓 What happened in this session:
  1. Identified the triggering situation
  2. Captured the automatic thought
  3. Rated the emotional intensity
  ... etc
```

## Key Features

- **Conversation History**: Each message is stored and passed to subsequent calls
- **Intent Progression**: Automatic advancement through stages
- **Mood Improvement**: Shows reduction from 80/100 to 40/100
- **Complete Cycle**: Demonstrates the full therapeutic arc

## Code Highlights

### Maintaining Conversation State
```typescript
const conversation: Message[] = [];

function addMessage(user: string, text: string) {
  conversation.push({
    id: `msg-${turnNumber}`,
    user,
    text,
    ts: Date.now(),
  });
}
```

### Intent Progression Loop
```typescript
while (intent !== "I1" || turnNumber === 0) {
  const result = await engine.respond({
    message: userMessage,
    intent,
    conversation,
    technique: "persona",
  });

  intent = result.nextIntent;

  if (intent === "I1" && previousIntent === "I8") {
    break; // Cycle completed
  }
}
```

## Customization

You can modify the `simulatedResponses` object to test different scenarios:

```typescript
const simulatedResponses: Record<string, string> = {
  I1: "Your custom situation...",
  I2: "Your custom thought...",
  // etc.
};
```

## Learn More

- See **basic-usage** for a simpler single-turn example
- See **technique-comparison** to compare different prompting styles
- Read the main Cogni documentation in `src/cogni/README.md`
