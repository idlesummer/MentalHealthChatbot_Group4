# Cognitive Distortion Analyzer

Analyze messages to automatically identify cognitive distortions using Cogni's classification engine.

## What It Does

- Analyzes 10 example messages (one for each distortion type)
- Classifies each message into a cognitive distortion category
- Shows confidence scores with visual bars
- Provides rationales for each classification
- Displays summary statistics and accuracy
- Includes educational explanations of all 10 distortions

## The 10 Cognitive Distortions

1. **All-or-Nothing Thinking** - Black and white, no middle ground
2. **Overgeneralization** - One event → broad conclusion
3. **Mental Filtering** - Focus only on negatives
4. **Discounting the Positive** - Positive experiences "don't count"
5. **Jumping to Conclusions** - Negative interpretations without evidence
6. **Catastrophizing** - Expecting the worst
7. **Emotional Reasoning** - Feelings = reality
8. **Should Statements** - Rigid rules about behavior
9. **Labeling** - Global negative labels
10. **Personalization & Blame** - Inappropriate responsibility

## Setup

```bash
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
```

## Run

```bash
npm start
```

## Expected Output

```
🧠 Cogni CBT Engine - Cognitive Distortion Analyzer

📋 Analyzing 10 messages...

⏳ [1/10] Analyzing: "I either ace this exam or I'm a complete failure..."
   ✓ Detected: All-or-Nothing Thinking (92%)

⏳ [2/10] Analyzing: "I made one mistake so I always mess everything up..."
   ✓ Detected: Overgeneralization (88%)

[... continues for all 10 messages ...]

════════════════════════════════════════════════════════════════
  📊 ANALYSIS RESULTS
════════════════════════════════════════════════════════════════

1. MESSAGE:
   "I either ace this exam or I'm a complete failure."

   DETECTED DISTORTION:
   All-or-Nothing Thinking

   CONFIDENCE: 🟢 92%
   ████████████████████░

   RATIONALE:
   The statement presents only two extreme outcomes with no middle ground,
   which is characteristic of all-or-nothing thinking.

   EXPECTED: ✅ All-or-Nothing Thinking

────────────────────────────────────────────────────────────────

[... continues for all messages ...]

════════════════════════════════════════════════════════════════
  📈 SUMMARY STATISTICS
════════════════════════════════════════════════════════════════

Total Messages Analyzed: 10
Correct Classifications:  9/10
Accuracy:                90.0%

Average Confidence:      85.3%

DETECTED DISTORTION DISTRIBUTION:
  All-or-Nothing Thinking        █ (1)
  Overgeneralization            █ (1)
  Mental Filtering              █ (1)
  ... etc

════════════════════════════════════════════════════════════════
  📚 THE 10 COGNITIVE DISTORTIONS
════════════════════════════════════════════════════════════════

1. All-or-Nothing Thinking
   Viewing things in black and white categories, with no middle ground.
   💭 Example: "If I'm not perfect, I'm a complete failure."

[... continues for all 10 distortions ...]
```

## Code Walkthrough

### Analyzing a Single Message
```typescript
const result = await engine.identifyCognitiveDistortions(message);

console.log(result.distortion);  // "All-or-Nothing Thinking"
console.log(result.confidence);  // 0.92
console.log(result.rationale);   // "The statement presents..."
```

### Batch Analysis
```typescript
const testMessages = [
  { message: "I'm either perfect or a failure", ... },
  { message: "I always mess things up", ... },
  // ... more messages
];

for (const { message } of testMessages) {
  const result = await engine.identifyCognitiveDistortions(message);
  results.push(result);
}
```

### Confidence Visualization
```typescript
function getConfidenceBar(confidence: number, width: number = 20): string {
  const filled = Math.round(confidence * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

console.log(getConfidenceBar(0.85)); // ████████████████████░
```

## Use Cases

### 1. Message Analysis
Analyze user messages in real-time to detect thinking patterns:
```typescript
const userMessage = "Nothing ever goes right for me";
const distortion = await engine.identifyCognitiveDistortions(userMessage);
// Returns: { distortion: "Overgeneralization", confidence: 0.88, ... }
```

### 2. Dataset Labeling
Label a dataset of messages for training or research:
```typescript
const dataset = loadMessages(); // Your message dataset
const labeled = [];

for (const message of dataset) {
  const classification = await engine.identifyCognitiveDistortions(message);
  labeled.push({ message, ...classification });
}

saveToCSV(labeled);
```

### 3. Quality Assurance
Test if distortion detection is working correctly:
```typescript
const testCases = [
  { message: "...", expected: "Catastrophizing" },
  // ... more test cases
];

const accuracy = calculateAccuracy(testCases);
```

## Customization

### Add Your Own Test Messages
```typescript
const testMessages = [
  {
    message: "Your custom message here",
    expectedDistortion: "The distortion you expect",
  },
  // ... more messages
];
```

### Export Results
```typescript
import fs from 'fs';

// Save as JSON
fs.writeFileSync('results.json', JSON.stringify(results, null, 2));

// Save as CSV
const csv = results.map(r =>
  `"${r.message}","${r.distortion}",${r.confidence}`
).join('\n');
fs.writeFileSync('results.csv', csv);
```

## Key Features

- ✅ Automatic classification of 10 distortion types
- ✅ Confidence scores (0-1 scale)
- ✅ Detailed rationales explaining classifications
- ✅ Visual confidence bars
- ✅ Accuracy metrics and statistics
- ✅ Educational distortion explanations

## Learn More

- See **basic-usage** for getting started with Cogni
- See **complete-session** for full CBT workflow
- Read the main Cogni documentation for API details
