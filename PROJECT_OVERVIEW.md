# Project Overview - Mental Health Chatbot

> Quick reference guide for understanding the project at a glance

---

## What Is This?

**Pebbles the Pibble** - An AI-powered CBT (Cognitive Behavioral Therapy) chatbot that helps users work through stressful situations using proven therapeutic techniques.

---

## The 30-Second Explanation

1. User describes a stressful situation
2. Chatbot guides them through 8 CBT steps
3. AI identifies negative thought patterns (cognitive distortions)
4. User explores evidence for/against their thoughts
5. User develops more balanced perspectives
6. Chatbot suggests coping strategies

---

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **AI**: OpenAI GPT-4o-mini via LangChain
- **State**: Zustand (with localStorage persistence)
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod

---

## The 8 CBT Steps (Intents)

| # | Name | What It Does |
|---|------|--------------|
| I1 | Situation | Describe what happened |
| I2 | Automatic Thought | Identify negative thought |
| I3 | Mood Rating | Rate emotional intensity (0-100) |
| I4 | Evidence For | Find supporting evidence |
| I5 | Evidence Against | Find contradicting evidence |
| I6 | Alternative Thought | Develop balanced perspective |
| I7 | Mood Re-rating | Measure emotional change |
| I8 | Coping Strategy | Get actionable next steps |

**Flow**: I1 → I2 → I3 → I4 → I5 → I6 → I7 → I8 → (repeat)

---

## 10 Cognitive Distortions Detected

1. **All-or-Nothing Thinking** - Black and white thinking
2. **Overgeneralization** - One event = always true
3. **Mental Filtering** - Only seeing negatives
4. **Discounting the Positive** - Dismissing good things
5. **Jumping to Conclusions** - Assuming without evidence
6. **Catastrophizing** - Expecting the worst
7. **Emotional Reasoning** - Feelings = facts
8. **Should Statements** - Rigid rules
9. **Labeling** - Defining by one trait
10. **Personalization & Blame** - Everything is your fault

---

## 5 Prompting Techniques

Users can switch between different AI prompting strategies:

1. **Default** - Basic CBT guidance
2. **Few-Shot** - Learns from example conversations
3. **Chain-of-Thought** - AI reasons step-by-step
4. **Persona** - Detailed CBT therapist character
5. **Plan-and-Solve** - Two-phase (plan → execute)

---

## Key Files

### Business Logic (Mental Health)
- `/src/lib/ai/intent.ts` - 8-step CBT flow & completion rules
- `/src/lib/ai/distortion.ts` - Cognitive distortion detection
- `/src/lib/blueprints/*.js` - 5 prompting strategies (Persona, Few-Shot, etc.)

### Technical Implementation
- `/src/app/(chat)/chat/page.tsx` - Main chat UI
- `/src/app/(chat)/chat/actions.ts` - AI response generation (server-side)
- `/src/components/chat.tsx` - Reusable chat components
- `/src/lib/store/*.ts` - State management (Zustand)

---

## How It Works (Simple Flow)

```
User sends message
    ↓
Identify cognitive distortion (OpenAI)
    ↓
Get prompt template for current intent
    ↓
Build comprehensive prompt (role + history + distortion)
    ↓
Generate AI response (GPT-4o-mini)
    ↓
Check if intent is complete
    ↓
Move to next intent (or stay on current)
    ↓
Display response to user
```

---

## Project Structure

```
src/
├── app/
│   ├── (chat)/chat/      # Main chat interface
│   │   ├── page.tsx      # UI component
│   │   └── actions.ts    # AI logic
│   └── layout.tsx        # Root layout
├── components/
│   ├── chat.tsx          # Chat UI components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── ai/               # Intent & distortion logic
│   ├── blueprints/       # 5 prompting strategies
│   ├── store/            # State management
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Helper functions
└── hooks/                # Custom React hooks
```

---

## Quick Start

```bash
# Install
npm install

# Add OpenAI API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-...

# Run
npm run dev

# Open
http://localhost:3000
```

---

## State Management (3 Stores)

| Store | What It Stores | Persisted? |
|-------|----------------|------------|
| Messages | Conversation history | ✅ localStorage |
| Input | Current typed text | ✅ localStorage |
| Prompt Technique | Selected strategy | ❌ No |

---

## Key Concepts

### Intent Completion
- Each intent has specific criteria
- AI evaluates if criteria are met
- Only advances when confidence > 0.5
- Prevents rushing through therapy steps

### Distortion Detection
- Runs on every user message
- Returns: classification, confidence (0-1), rationale
- Used to inform AI responses

### Prompt Building
- Combines: role + intent + technique + history + distortion + message
- Different for each prompting strategy
- Temperature: 0.2 (consistent, less creative)

---

## Contributing Areas

1. **Mental Health**: Improve CBT logic, add distortions, enhance prompts
2. **AI**: Create new prompting strategies, fine-tune responses
3. **UI/UX**: Improve design, add features, mobile optimization
4. **Testing**: Add unit tests, integration tests, E2E tests
5. **Documentation**: Improve guides, add examples

---

## Important Notes

⚠️ **Not a Replacement for Therapy**: This is a learning tool, not professional care

🔒 **Privacy**: Data only stored in browser localStorage, not on any server

💰 **Cost**: Uses GPT-4o-mini (~$0.01-0.05 per conversation)

🎯 **Purpose**: Educational tool for understanding CBT techniques

---

## Resources

- **Full Guide**: See `CONTRIBUTOR_GUIDE.md` for comprehensive documentation
- **Code Bundle**: See `docs/bundle.txt` for all source code
- **Next.js Docs**: https://nextjs.org/docs
- **LangChain Docs**: https://js.langchain.com/docs/
- **OpenAI API**: https://platform.openai.com/docs

---

## Architecture Highlights

### Separation of Concerns

**Business Logic** (Mental Health):
- Lives in `/src/lib/ai/` and `/src/lib/blueprints/`
- Can be modified without touching UI code
- Prompts are plain JavaScript objects

**Technical Implementation**:
- Lives in `/src/app/` and `/src/components/`
- Can be modified without changing CBT logic
- Standard Next.js patterns

### Clean Data Flow

```
User Input → Zustand Store → Server Action → OpenAI API
                                    ↓
                            Distortion Detection
                                    ↓
                             Prompt Building
                                    ↓
                           Response Generation
                                    ↓
                          Intent Completion Check
                                    ↓
Store Update ← Next Intent ← Response
```

---

## File Size Reference

- `Persona.js`: 368 lines (detailed role-based prompts)
- `Fewshot.js`: 332 lines (example conversations)
- `ChainOfThought.js`: 307 lines (step-by-step reasoning)
- `PlanAndSolve.js`: 222 lines (two-phase approach)
- `chat.tsx`: 193 lines (all chat UI components)
- `intent.ts`: 97 lines (intent routing)
- `actions.ts`: 69 lines (AI server actions)
- `page.tsx`: 63 lines (main chat page)
- `distortion.ts`: 55 lines (distortion detection)

**Total codebase**: ~2,133 lines (excluding dependencies)

---

## Next Steps for New Contributors

1. ✅ Read this overview
2. ✅ Read `CONTRIBUTOR_GUIDE.md` for deep dive
3. ✅ Set up local environment
4. ✅ Test the chatbot with different inputs
5. ✅ Read through key files (start with `intent.ts`)
6. ✅ Try modifying a prompt in `Persona.js`
7. ✅ Make your first contribution!

---

**Questions?** Open a GitHub Discussion or Issue!
