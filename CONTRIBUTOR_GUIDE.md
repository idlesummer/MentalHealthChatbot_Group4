# Mental Health Chatbot - Contributor Guide

> A comprehensive guide for new contributors to understand the project, separated into business logic (mental health) and technical implementation.

---

## Table of Contents

1. [What is This Project?](#what-is-this-project)
2. [Part A: Mental Health Business Logic](#part-a-mental-health-business-logic)
3. [Part B: Technical Implementation](#part-b-technical-implementation)
4. [Getting Started](#getting-started)
5. [How to Contribute](#how-to-contribute)

---

## What is This Project?

**Pebbles the Pibble** is an AI-powered mental health chatbot that uses **Cognitive Behavioral Therapy (CBT)** techniques to help users work through stressful situations and negative thought patterns.

### The Simple Version

Imagine a friendly therapist that guides you through questions to:
1. Understand what's bothering you
2. Identify negative thoughts
3. Challenge those thoughts with evidence
4. Find more balanced ways of thinking
5. Suggest coping strategies

This chatbot does exactly that, using AI to have natural conversations while following proven CBT frameworks.

---

## Part A: Mental Health Business Logic

> This section explains the "mental health stuff" - the therapeutic approach and reasoning behind the chatbot.

### 1. The 8-Step CBT Framework

The chatbot guides users through **8 sequential intents** (stages) in every conversation:

| Intent | Name | Purpose | Example Question |
|--------|------|---------|------------------|
| **I1** | Situation Identification | Help user describe what happened | "Can you tell me about the situation that's bothering you?" |
| **I2** | Automatic Thought | Identify the immediate negative thought | "What thoughts went through your mind when this happened?" |
| **I3** | Mood Rating | Measure emotional intensity (0-100) | "On a scale of 0-100, how anxious/sad/angry do you feel?" |
| **I4** | Evidence For | Explore why the thought might be true | "What evidence supports this thought?" |
| **I5** | Evidence Against | Find contradicting evidence | "What evidence suggests this thought might not be completely accurate?" |
| **I6** | Alternative Thought | Develop balanced perspective | "What's a more balanced way to think about this?" |
| **I7** | Mood Re-rating | Assess emotional change | "How would you rate your mood now?" |
| **I8** | Coping Strategy | Provide actionable next steps | "Here are some strategies that might help..." |

**Flow**: I1 → I2 → I3 → I4 → I5 → I6 → I7 → I8 → (back to I1 for new situation)

### 2. Cognitive Distortions

The chatbot identifies **10 types of thinking errors** (cognitive distortions) that people commonly make:

1. **All-or-Nothing Thinking**: Seeing things in black and white
   - *Example*: "I failed this test, so I'm a total failure"

2. **Overgeneralization**: One event = always true
   - *Example*: "I messed up once, so I always mess up"

3. **Mental Filtering**: Focusing only on negatives
   - *Example*: "I got 9 compliments and 1 criticism. The criticism proves I'm bad at my job"

4. **Discounting the Positive**: Dismissing good things
   - *Example*: "That success doesn't count, it was just luck"

5. **Jumping to Conclusions**: Assuming without evidence
   - *Example*: "They didn't text back, they must hate me"

6. **Catastrophizing**: Expecting the worst
   - *Example*: "If I fail this exam, my entire life is ruined"

7. **Emotional Reasoning**: Feelings = facts
   - *Example*: "I feel stupid, therefore I am stupid"

8. **Should Statements**: Rigid rules about how things "should" be
   - *Example*: "I should be perfect at everything"

9. **Labeling**: Defining yourself/others by one trait
   - *Example*: "I made a mistake, so I'm an idiot"

10. **Personalization & Blame**: Everything is your fault (or someone else's)
    - *Example*: "My friend is upset, it must be because of me"

**Why this matters**: The chatbot identifies these patterns and gently helps users recognize them in real-time.

### 3. Completion Rules

Each intent has **specific criteria** that must be met before moving to the next stage. Think of these as "checkpoints" to ensure the user has fully engaged with each step.

Examples:
- **I1 Completion**: User must provide contextual details (who, what, where, when)
- **I2 Completion**: User must articulate a specific automatic thought
- **I3 Completion**: User must provide a numerical mood rating
- **I4 Completion**: User must list at least one piece of supporting evidence

**Why this matters**: Prevents rushing through therapy steps without proper reflection.

### 4. The Therapeutic Approach

The chatbot acts as:
- **Non-judgmental listener**: Never criticizes or dismisses feelings
- **Gentle guide**: Asks questions rather than giving direct advice
- **Socratic questioner**: Uses questions to help users discover insights themselves
- **Empathetic companion**: Validates emotions while challenging unhelpful thoughts

**Conversational Style**:
- Warm and friendly (not clinical)
- Short, simple sentences
- One question at a time
- Reflective listening ("It sounds like you're feeling...")

---

## Part B: Technical Implementation

> This section explains how the application is built - the code, architecture, and tools.

### 1. Technology Stack (The Tools We Use)

| Category | Technology | What It Does |
|----------|-----------|--------------|
| **Frontend Framework** | Next.js 15 + React 19 | Builds the web interface |
| **Language** | TypeScript | JavaScript with type safety |
| **AI Engine** | OpenAI GPT-4o-mini | Powers the chatbot responses |
| **AI Framework** | LangChain | Organizes AI workflows |
| **State Management** | Zustand | Manages application state |
| **Styling** | Tailwind CSS + shadcn/ui | Makes it look good |
| **Validation** | Zod | Ensures data structure correctness |

### 2. Project Structure

```
MentalHealthChatbot_Group4/
│
├── src/
│   ├── app/                    # Next.js pages and routes
│   │   ├── (chat)/chat/        # Main chat interface
│   │   │   ├── page.tsx        # Chat UI component
│   │   │   ├── actions.ts      # AI logic (server-side)
│   │   │   └── layout.tsx      # Layout wrapper
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage (redirects to chat)
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # Reusable UI components
│   │   ├── chat.tsx            # Main chat components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── elements/           # Custom elements (loaders, etc)
│   │
│   ├── lib/                    # Core application logic
│   │   ├── ai/                 # AI-specific logic
│   │   │   ├── intent.ts       # Intent routing & completion
│   │   │   └── distortion.ts  # Cognitive distortion detection
│   │   ├── blueprints/         # Prompting strategies
│   │   │   ├── Persona.js
│   │   │   ├── Fewshot.js
│   │   │   ├── ChainOfThought.js
│   │   │   ├── PlanAndSolve.js
│   │   │   └── promptStore.ts
│   │   ├── store/              # State management
│   │   │   ├── chat-messages.ts
│   │   │   ├── chat-input.ts
│   │   │   └── prompt-store.ts
│   │   ├── types.ts            # TypeScript type definitions
│   │   └── utils.ts            # Helper functions
│   │
│   └── hooks/                  # Custom React hooks
│       ├── use-scroll-to-bottom.ts
│       ├── use-fake-loading.ts
│       └── use-mobile.ts
│
├── public/                     # Static assets
│   └── avatars/pebbles.svg     # Chatbot avatar
│
├── .env                        # Environment variables (API keys)
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript configuration
```

### 3. How a Conversation Works (Step-by-Step)

Let me walk you through what happens when a user sends a message:

```
USER TYPES: "I failed my exam and feel terrible"

┌─────────────────────────────────────────────────┐
│ 1. USER INTERFACE (page.tsx)                    │
│    - User types in ChatInput component          │
│    - Clicks send button                         │
│    - Message added to Zustand store             │
│    - UI shows user's message bubble             │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 2. SERVER ACTION (actions.ts)                   │
│    - Receives message + conversation history    │
│    - Knows current intent (e.g., I1)            │
│    - Knows selected prompting technique         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 3. DISTORTION DETECTION (distortion.ts)         │
│    - AI analyzes: "I failed my exam..."         │
│    - Identifies: "All-or-Nothing Thinking"      │
│    - Confidence: 0.85                           │
│    - Rationale: "Equating one failure with      │
│      being a total failure"                     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 4. PROMPT BUILDING (blueprints/)                │
│    - Gets I1 prompt from selected technique     │
│    - Injects:                                   │
│      • CBT therapist role                       │
│      • Current intent guidelines                │
│      • Conversation history                     │
│      • Identified distortion                    │
│      • User's message                           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 5. AI RESPONSE GENERATION (OpenAI)              │
│    - GPT-4o-mini processes the prompt           │
│    - Generates empathetic response:             │
│      "I'm sorry to hear that. Failing an exam   │
│       can feel really discouraging. Can you     │
│       tell me more about what happened?"        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 6. INTENT COMPLETION CHECK (intent.ts)          │
│    - AI evaluates if I1 is complete             │
│    - Checks: Did user provide situation details?│
│    - Decision: moveToNextIntent = false         │
│    - Reason: "Needs more context"               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 7. UI UPDATE (page.tsx)                         │
│    - Chatbot message added to store             │
│    - UI shows bot's message bubble              │
│    - Current intent remains I1                  │
│    - Auto-scroll to bottom                      │
└─────────────────────────────────────────────────┘
```

### 4. Key Files and Their Responsibilities

#### **`/src/app/(chat)/chat/page.tsx`**
**What it does**: Main chat interface
**Responsibilities**:
- Renders chat UI (messages, input box, header)
- Handles user input submission
- Tracks current intent
- Manages loading/typing states
- Calls server actions to get AI responses

**Key code**:
```typescript
const handleSend = async () => {
  addMessage(input, "user")
  setIsTyping(true)
  const result = await generateResponse(message, currentIntent, ...)
  addMessage(result.text, "bot")
  setCurrentIntent(result.nextIntent)
  setIsTyping(false)
}
```

---

#### **`/src/app/(chat)/chat/actions.ts`**
**What it does**: Server-side AI logic
**Responsibilities**:
- Configures OpenAI models
- Builds dynamic prompts based on intent + technique
- Detects cognitive distortions
- Generates AI responses
- Determines if ready for next intent

**Key code**:
```typescript
export async function generateResponse(
  message: string,
  currentIntent: Intent,
  technique: PromptTechnique,
  history: Message[]
) {
  // 1. Detect distortion
  const distortion = await identifyDistortion(message)

  // 2. Build prompt
  const prompt = buildPrompt(currentIntent, technique, distortion, history)

  // 3. Generate response
  const response = await openai.chat.completions.create({...})

  // 4. Check intent completion
  const nextIntent = await computeNextIntent(currentIntent, message, history)

  return { text: response, nextIntent }
}
```

---

#### **`/src/lib/ai/intent.ts`**
**What it does**: Intent routing logic
**Responsibilities**:
- Defines completion rules for each intent
- Determines when to advance to next intent
- Provides intent descriptions and context

**Key code**:
```typescript
export const INTENT_ROUTE = ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8"]

export const COMPLETION_RULES = {
  I1: "User must describe situation with contextual details...",
  I2: "User must articulate specific automatic thought...",
  // ...
}

export async function computeNextIntent(current, message, history) {
  // AI evaluates if completion rule is satisfied
  const result = await model.invoke({...})
  if (result.moveToNextIntent && result.confidence > 0.5) {
    return getNextIntent(current)
  }
  return current
}
```

---

#### **`/src/lib/ai/distortion.ts`**
**What it does**: Cognitive distortion detection
**Responsibilities**:
- Uses OpenAI structured output
- Classifies message into 10 distortion types
- Returns confidence level and rationale

**Key code**:
```typescript
const DistortionSchema = z.object({
  classification: z.enum([
    "All-or-Nothing Thinking",
    "Overgeneralization",
    // ... 8 more types
  ]),
  confidence: z.number().min(0).max(1),
  rationale: z.string()
})

export async function identifyDistortion(message: string) {
  const response = await model.withStructuredOutput(DistortionSchema).invoke(message)
  return response
}
```

---

#### **`/src/lib/blueprints/`**
**What it does**: Prompting strategies (5 different approaches)
**Responsibilities**:
- Each file defines prompts for all 8 intents
- Provides role context and system instructions
- Implements different AI prompting techniques

**Files**:
1. **Persona.js**: AI adopts specific CBT therapist persona
2. **Fewshot.js**: Provides example conversations
3. **ChainOfThought.js**: AI reasons step-by-step before responding
4. **PlanAndSolve.js**: Two-phase approach (plan → execute)
5. **Default**: Basic prompting with no special technique

**Structure**:
```javascript
export const INTENT_PROMPTS_PERSONA = {
  I1: {
    role: "Situation identification",
    system: "You are a warm, empathetic CBT therapist named Pebbles..."
  },
  I2: { role: "...", system: "..." },
  // ... I3-I8
}
```

---

#### **`/src/lib/store/chat-messages.ts`**
**What it does**: Message history state management
**Responsibilities**:
- Stores all messages (user + bot)
- Persists to localStorage
- Provides methods to add/clear messages

**Key code**:
```typescript
interface Message {
  id: string
  user: "user" | "bot"
  text: string
  timestamp: Date
}

const useChatMessages = create<ChatMessagesState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (text, user) => set(state => ({
        messages: [...state.messages, { id, user, text, timestamp }]
      })),
      clearMessages: () => set({ messages: [] })
    }),
    { name: "chat-messages-store" }
  )
)
```

---

#### **`/src/components/chat.tsx`**
**What it does**: Reusable chat UI components
**Responsibilities**:
- Exports multiple components:
  - `Chat`: Container wrapper
  - `ChatHeader`: Avatar, online status, prompt selector, clear button
  - `ChatMessages`: Scrollable message list
  - `ChatMessage`: Individual message bubble
  - `ChatInput`: Textarea + send button
  - `ChatMessageSkeleton`: Loading state

**Key components**:
```typescript
<Chat>
  <ChatHeader
    avatar={<Avatar />}
    onClear={clearMessages}
    promptSelector={<DropdownMenu />}
  />
  <ChatMessages>
    {messages.map(msg => (
      <ChatMessage key={msg.id} message={msg} />
    ))}
  </ChatMessages>
  <ChatInput onSend={handleSend} />
</Chat>
```

---

### 5. State Management with Zustand

The app uses **3 global stores** that persist across page refreshes:

| Store | Location | Purpose | Persisted? |
|-------|----------|---------|------------|
| **Messages** | `chat-messages.ts` | Stores conversation history | ✅ localStorage |
| **Input** | `chat-input.ts` | Saves typed text (draft) | ✅ localStorage |
| **Prompt Technique** | `promptStore.ts` | Current prompting strategy | ❌ No |

**Why Zustand?**
- Lightweight (no boilerplate)
- Works seamlessly with React
- Built-in localStorage persistence
- No context providers needed

---

### 6. The Five Prompting Techniques

Users can switch between different AI prompting strategies via a dropdown menu:

#### 1. **Default**
- Basic CBT guidance
- No special prompting technique
- Simple and straightforward

#### 2. **Few-Shot**
- Provides example conversations
- Shows the AI how similar interactions should look
- Best for consistent tone and structure

Example:
```
User: "I'm really stressed about work"
Bot: "I hear you. Can you tell me more about what's happening at work?"
```

#### 3. **Chain-of-Thought**
- AI reasons step-by-step before responding
- Makes the thought process explicit
- Better for complex reasoning

Example:
```
Thought: User seems overwhelmed. Need to:
1. Validate emotion
2. Ask open-ended question
3. Keep response brief
Response: "It sounds like work is really weighing on you..."
```

#### 4. **Persona**
- AI adopts a detailed CBT therapist persona
- Named "Pebbles the Pibble"
- Warm, empathetic, non-judgmental
- Uses therapeutic techniques explicitly

#### 5. **Plan-and-Solve**
- Two-phase approach:
  1. **Plan**: What should I accomplish in this response?
  2. **Solve**: Execute the plan
- Best for structured, goal-oriented conversations

---

### 7. How to Add a New Feature

Let's say you want to add a "Save Conversation" feature:

**Step 1: Identify affected files**
- UI: `/src/components/chat.tsx` (add button)
- Logic: `/src/lib/store/chat-messages.ts` (add save function)
- Types: `/src/lib/types.ts` (if needed)

**Step 2: Add the functionality**
```typescript
// In chat-messages.ts
export const useChatMessages = create<ChatMessagesState>()(
  persist(
    (set, get) => ({
      messages: [],
      // ... existing methods
      saveConversation: () => {
        const messages = get().messages
        const json = JSON.stringify(messages, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `conversation-${Date.now()}.json`
        a.click()
      }
    }),
    { name: "chat-messages-store" }
  )
)
```

**Step 3: Add UI button**
```typescript
// In chat.tsx (ChatHeader component)
import { Download } from "lucide-react"

<Button
  variant="ghost"
  size="icon"
  onClick={saveConversation}
>
  <Download className="h-4 w-4" />
</Button>
```

**Step 4: Test**
- Run `npm run dev`
- Open app, have a conversation
- Click download button
- Verify JSON file downloads

---

### 8. Environment Configuration

The app requires one critical environment variable:

```bash
# .env (create this file)
OPENAI_API_KEY=sk-...your-key-here...
```

**Where to get the key?**
1. Go to https://platform.openai.com
2. Sign in / create account
3. Navigate to API Keys
4. Create new secret key
5. Copy and paste into `.env` file

**Cost considerations:**
- Uses `gpt-4o-mini` (very cheap)
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Typical conversation: ~$0.01-0.05

---

## Getting Started

### Prerequisites
```bash
- Node.js 20+ (check with: node --version)
- npm/yarn/pnpm (check with: npm --version)
- OpenAI API key
```

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd MentalHealthChatbot_Group4

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 4. Run development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:3000
```

### Verify It's Working

You should see:
- Pebbles avatar in the header
- "Online" status indicator
- Default message: "Hey, hows it going?"
- Prompt technique dropdown (Persona, Few-Shot, etc.)
- Text input at the bottom

Try sending: "I'm feeling stressed about school"
- Bot should respond within 2-5 seconds
- Response should be empathetic and ask follow-up questions

---

## How to Contribute

### Areas You Can Contribute To

#### 1. **Mental Health Logic** (Business Logic)
- Add new cognitive distortions
- Improve completion rules
- Create new therapeutic approaches
- Enhance intent descriptions

**Files to modify**:
- `/src/lib/ai/distortion.ts`
- `/src/lib/ai/intent.ts`
- `/src/lib/blueprints/*.js`

#### 2. **AI Prompting** (Business Logic + Technical)
- Create new prompting strategies
- Improve existing prompts
- Fine-tune responses for specific intents

**Files to modify**:
- `/src/lib/blueprints/NewStrategy.js`
- `/src/lib/blueprints/promptStore.ts`

#### 3. **User Interface** (Technical)
- Improve chat design
- Add new features (export, search, etc.)
- Mobile responsiveness
- Accessibility improvements

**Files to modify**:
- `/src/components/chat.tsx`
- `/src/components/ui/*.tsx`
- `/src/app/globals.css`

#### 4. **State Management** (Technical)
- Add persistence for more data
- Implement conversation history
- User preferences

**Files to modify**:
- `/src/lib/store/*.ts`

#### 5. **Testing & Quality** (Technical)
- Add unit tests
- Integration tests
- E2E tests with Playwright

**New files**:
- `/__tests__/*.test.ts`
- `/e2e/*.spec.ts`

---

### Development Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/save-conversation

# 2. Make your changes
# Edit files...

# 3. Test locally
npm run dev

# 4. Check for errors
npm run lint

# 5. Commit changes
git add .
git commit -m "Add save conversation feature"

# 6. Push to GitHub
git push origin feature/save-conversation

# 7. Create Pull Request
# Go to GitHub and create PR
```

---

### Code Style Guidelines

**TypeScript/React**:
- Use functional components (no classes)
- Use TypeScript types (no `any`)
- Use descriptive variable names
- Keep components small and focused

**Example**:
```typescript
// Good ✅
interface ChatMessageProps {
  message: Message
  isBot: boolean
}

export function ChatMessage({ message, isBot }: ChatMessageProps) {
  return <div>{message.text}</div>
}

// Bad ❌
export function ChatMessage(props: any) {
  return <div>{props.msg}</div>
}
```

**Prompts** (Blueprint files):
- Keep language warm and empathetic
- Use "I" statements ("I notice...", "I hear...")
- Ask one question at a time
- Avoid jargon
- Keep responses under 100 words

---

### Common Tasks

#### Add a new Intent (I9)
1. Update `INTENT_ROUTE` in `/src/lib/ai/intent.ts`
2. Add `I9` completion rule
3. Add `I9` prompts to all blueprint files
4. Test the flow

#### Change the chatbot's personality
1. Go to `/src/lib/blueprints/Persona.js`
2. Modify the `system` prompts
3. Test with different user inputs

#### Add a new cognitive distortion
1. Open `/src/lib/ai/distortion.ts`
2. Add to the `CognitiveDistortionClassification` enum
3. Update the schema
4. Retrain by testing with examples

---

## Frequently Asked Questions

### Q: Why are there 5 different prompting techniques?
**A**: It's an experiment to see which approach produces the best therapeutic responses. Users can switch between them to find what works best.

### Q: Does this store any user data?
**A**: Only in the browser's localStorage. No data is sent to any server (except OpenAI for AI processing). No database, no analytics.

### Q: Can this replace real therapy?
**A**: **No.** This is a learning tool and support aid, not a replacement for professional mental health care. Always recommend users seek professional help for serious concerns.

### Q: Why is the response sometimes slow?
**A**: AI processing takes 1-5 seconds depending on:
- OpenAI API response time
- Prompt complexity
- Internet connection speed

### Q: Can I use a different AI model?
**A**: Yes! Modify `/src/app/(chat)/chat/actions.ts`:
```typescript
const model = new ChatOpenAI({
  modelName: "gpt-4o",  // Change this
  temperature: 0.2,
})
```

---

## Resources for Learning

### CBT and Mental Health
- [Cognitive Behavioral Therapy Basics](https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral)
- [Cognitive Distortions List](https://psychcentral.com/lib/15-common-cognitive-distortions)
- [CBT Techniques](https://www.verywellmind.com/cognitive-behavioral-therapy-2795747)

### Technical Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## Need Help?

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an Issue with reproduction steps
- **Feature Requests**: Create an Issue with "Feature Request" label
- **Documentation**: Create a PR to improve this guide!

---

## Summary

**Business Logic (Mental Health)**:
- 8-step CBT framework
- 10 cognitive distortions
- 5 prompting strategies
- Completion rules for progression

**Technical Implementation**:
- Next.js + React + TypeScript
- OpenAI GPT-4o-mini via LangChain
- Zustand for state management
- Tailwind CSS for styling
- Structured outputs with Zod

**Key Insight**: The business logic (CBT) is cleanly separated from implementation. You can modify prompts without touching React code, and vice versa.

---

**Welcome to the project! 🎉**
Start by exploring the chat interface, then dive into the code. Don't hesitate to ask questions or propose improvements!
