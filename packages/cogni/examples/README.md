# Cogni CBT Engine - Examples

This directory contains practical examples demonstrating how to use the Cogni CBT Engine.

## 📚 Available Examples

### 1. [Basic Usage](./basic-usage/)
**Perfect for: Getting started**

The simplest introduction to Cogni - shows how to:
- Set up the CogniEngine
- Generate a single CBT response
- Inspect results (reply, intent, distortion)

```bash
cd basic-usage
npm install
cp .env.example .env  # Add your OPENAI_API_KEY
npm start
```

**What you'll learn:**
- Basic API setup
- Single-turn conversation
- Reading response metadata

---

### 2. [Complete Session](./complete-session/)
**Perfect for: Understanding the full CBT cycle**

Demonstrates a complete therapeutic conversation through all 8 CBT stages:
- I1: Situation Identification
- I2: Automatic Thought
- I3: Mood Rating
- I4: Evidence For
- I5: Evidence Against
- I6: Alternative Thought
- I7: Mood Re-rating
- I8: Coping Strategy

```bash
cd complete-session
npm install
cp .env.example .env  # Add your OPENAI_API_KEY
npm start
```

**What you'll learn:**
- Managing conversation state
- Intent progression
- Full CBT workflow from start to finish
- Session summaries

---

### 3. [Technique Comparison](./technique-comparison/)
**Perfect for: Choosing the right prompting technique**

Compares all 4 prompt engineering techniques side-by-side:
- **Persona**: Role-based guidance with boundaries
- **Few-shot**: Learning through examples
- **Chain-of-Thought**: Explicit reasoning steps
- **Plan-and-Solve**: Two-phase execution

```bash
cd technique-comparison
npm install
cp .env.example .env  # Add your OPENAI_API_KEY
npm start
```

**What you'll learn:**
- Differences between prompting techniques
- When to use each technique
- How technique affects responses

---

### 4. [Distortion Analyzer](./distortion-analyzer/)
**Perfect for: Cognitive distortion detection**

Analyzes messages to identify the 10 cognitive distortions:
- All-or-Nothing Thinking
- Overgeneralization
- Mental Filtering
- Discounting the Positive
- Jumping to Conclusions
- Catastrophizing
- Emotional Reasoning
- Should Statements
- Labeling
- Personalization & Blame

```bash
cd distortion-analyzer
npm install
cp .env.example .env  # Add your OPENAI_API_KEY
npm start
```

**What you'll learn:**
- Batch message analysis
- Distortion classification
- Confidence scoring
- Educational explanations

---

## 🚀 Quick Start (Any Example)

1. **Navigate to an example:**
   ```bash
   cd examples/cogni-examples/basic-usage  # or any example
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

4. **Run the example:**
   ```bash
   npm start
   ```

---

## 📖 Learning Path

We recommend exploring the examples in this order:

```
1. basic-usage
   ↓
2. complete-session
   ↓
3. technique-comparison
   ↓
4. distortion-analyzer
```

**Why this order?**
- **basic-usage**: Learn the fundamentals
- **complete-session**: See the full CBT workflow
- **technique-comparison**: Understand prompting options
- **distortion-analyzer**: Master the classification feature

---

## 🎯 Use Case Guide

### "I want to integrate Cogni into my app"
→ Start with **basic-usage**

### "I need to understand the full CBT process"
→ Check out **complete-session**

### "I'm not sure which prompting technique to use"
→ Run **technique-comparison**

### "I want to classify cognitive distortions in text"
→ Try **distortion-analyzer**

---

## 📝 Example Structure

Each example follows this structure:

```
example-name/
├── package.json      # Dependencies and scripts
├── .env.example      # Environment template
├── index.ts          # Main example code
└── README.md         # Detailed documentation
```

All examples use:
- **TypeScript** for type safety
- **tsx** for execution (no build step needed)
- **dotenv** for environment variables
- **Same Cogni API** (consistent across examples)

---

## 🔧 Common Setup

All examples require:

1. **Node.js 18+**
   ```bash
   node --version  # Should be >= 18
   ```

2. **OpenAI API Key**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Create an API key
   - Add to `.env` file in each example

3. **Dependencies**
   ```bash
   npm install  # In each example directory
   ```

---

## 💡 Tips & Tricks

### Running Multiple Examples
```bash
# Run basic-usage
cd examples/cogni-examples/basic-usage && npm start

# Run complete-session
cd ../complete-session && npm start
```

### Development Mode (Auto-reload)
```bash
npm run dev  # Uses tsx watch mode
```

### Customizing Examples
Each `index.ts` is well-commented and easy to modify:
```typescript
// Change the user message
const userMessage = "Your custom message here";

// Change the prompt technique
technique: "chain-of-thought"  // Try different techniques

// Change the starting intent
intent: "I2"  // Start at a different stage
```

---

## 🐛 Troubleshooting

### "OPENAI_API_KEY not found"
→ Make sure you copied `.env.example` to `.env` and added your key

### "Module not found"
→ Run `npm install` in the example directory

### "tsx command not found"
→ The package.json should install tsx as a dev dependency. Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Rate Limit Errors
→ The examples include small delays between requests. If you still hit limits:
```typescript
// Increase delay in the code
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second
```

---

## 📚 Further Reading

- **Cogni Documentation**: `../../src/cogni/README.md`
- **API Reference**: See main Cogni docs for full API details
- **CBT Background**: Learn about Cognitive Behavioral Therapy principles

---

## 🤝 Contributing

To add a new example:

1. Create a new directory: `examples/cogni-examples/your-example/`
2. Add `package.json`, `.env.example`, `index.ts`, `README.md`
3. Follow the existing structure and naming conventions
4. Update this README with your example

---

## 📄 License

These examples are part of the Mental Health Chatbot project and are licensed under MIT.

---

## 🙋 Questions?

- Check individual example READMEs for detailed documentation
- Read the main Cogni documentation in `src/cogni/README.md`
- Open an issue in the main repository

---

**Happy coding! 🎉**

Start with `basic-usage` and explore from there. Each example builds on concepts from the previous ones.
