# Basic Usage Example

This example demonstrates the simplest way to use the Cogni CBT Engine.

## What It Does

- Sets up the CogniEngine with LLM models
- Processes a single user message
- Displays the assistant's reply, next intent, and cognitive distortion

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

## Run

```bash
npm start
```

## Expected Output

```
🧠 Cogni CBT Engine - Basic Usage Example

⚙️  Setting up LLM models...
🚀 Initializing Cogni Engine...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Example: User shares a distressing situation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 User: "I failed my math exam and I feel terrible about it."

⏳ Processing...

✅ Response Generated!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 ASSISTANT REPLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I'm sorry to hear that you failed your exam. That can be really tough...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 METADATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Current Intent:  I1 (Situation Identification)
➡️  Next Intent:     I2

🧩 COGNITIVE DISTORTION DETECTED:
   Type:       All-or-Nothing Thinking
   Confidence: 85%
   Rationale:  The user is viewing the exam failure as absolute...
```

## Code Walkthrough

### 1. Setup Models
```typescript
const mainModel = new ChatOpenAI({...});
const distortionClassifier = mainModel.withStructuredOutput(...);
const intentEvaluator = mainModel.withStructuredOutput(...);
```

### 2. Create Engine
```typescript
const engine = new CogniEngine({
  mainModel,
  distortionClassifier,
  intentEvaluator,
});
```

### 3. Generate Response
```typescript
const result = await engine.respond({
  message: "I failed my exam...",
  intent: "I1",
  conversation: [],
  technique: "persona",
});
```

### 4. Use Results
```typescript
console.log(result.reply);           // Assistant's response
console.log(result.nextIntent);      // "I2"
console.log(result.distortion); // Detected distortion
```

## Next Steps

- Check out the **complete-session** example to see a full CBT cycle
- Try the **technique-comparison** example to see different prompting styles
- Explore the **distortion-analyzer** to classify messages in bulk
