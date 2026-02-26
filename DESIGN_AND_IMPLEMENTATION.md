# Software Design and Implementation

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Layers](#2-architecture-layers)
   - [Layer 1 — Presentation Layer](#layer-1--presentation-layer)
   - [Layer 2 — Application Layer](#layer-2--application-layer)
   - [Layer 3 — Domain Layer](#layer-3--domain-layer)
   - [Layer 4 — Infrastructure Layer](#layer-4--infrastructure-layer)
3. [Component Design](#3-component-design)
   - [CogniEngine](#cogniengine)
   - [CrisisDetector](#crisisdetector)
   - [DistortionClassifier](#distortionclassifier)
   - [IntentManager](#intentmanager)
   - [ReplyGenerator](#replygenerator)
   - [SessionTracker & SessionSummaryGenerator](#sessiontracker--sessionsummarygenerator)
4. [Data Flow](#4-data-flow)
5. [State Management](#5-state-management)
6. [Prompt Engineering](#6-prompt-engineering)
7. [CBT Workflow — Intent State Machine](#7-cbt-workflow--intent-state-machine)
8. [Crisis Detection Pipeline](#8-crisis-detection-pipeline)
9. [Key Design Decisions](#9-key-design-decisions)

---

## 1. System Overview

**Pebbles** is a web-based mental health chatbot that delivers evidence-based Cognitive Behavioral Therapy (CBT) conversations. It is built as a monorepo containing two main packages:

| Package | Role |
|---|---|
| `@rainev/cogni` | A standalone, reusable CBT engine that orchestrates LLM calls, manages therapeutic intent, detects cognitive distortions, and screens for crisis situations. |
| `apps/web` | A Next.js web application that provides the user-facing chat interface and wires the Cogni engine to a live chat experience. |

The system guides users through a structured 8-stage CBT workflow, detects cognitive distortions in real time, and always screens messages for crisis risk before generating any therapeutic response.

---

## 2. Architecture Layers

The system is organized into four horizontal layers. Each layer has a distinct responsibility and may only depend on layers below it.

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │  ← React UI, pages, hooks
├─────────────────────────────────────────────────────────┤
│                  Application Layer                       │  ← Next.js server actions, state stores
├─────────────────────────────────────────────────────────┤
│                  Domain Layer                            │  ← Cogni engine, CBT services, prompts
├─────────────────────────────────────────────────────────┤
│                 Infrastructure Layer                     │  ← OpenAI / LangChain, SMTP, localStorage
└─────────────────────────────────────────────────────────┘
```

---

### Layer 1 — Presentation Layer

**Location:** `apps/web/src/components/`, `apps/web/src/app/`, `apps/web/src/hooks/`

This layer is responsible for everything the user sees and interacts with. It is built with React 19 and styled with Tailwind CSS 4.

#### Pages

| Route | Description |
|---|---|
| `/chat` | Production chat interface — clean, minimal, focused on the conversation. |
| `/chat-test` | Development interface — includes a live analytics side panel showing the session summary in real time. |

#### Core UI Components

| Component | Responsibility |
|---|---|
| `chat.tsx` | Root chat layout: composes the message list and input bar. |
| `ChatHeader` | Top bar with session controls (e.g., clear, export). |
| `ChatMessages` | Scrollable message list; renders user and assistant bubbles. |
| `ChatInput` | Text input with send button; manages input field state. |
| `session-summary.tsx` | Analytics panel showing mood delta, distortion profile, and the Mermaid flowchart (chat-test only). |
| `mermaid-chart.tsx` | Renders a Mermaid.js flowchart diagram of the session intent progression. |

#### Custom Hooks

| Hook | Purpose |
|---|---|
| `use-chat-input.ts` | Controls the text input field value and reset. |
| `use-chat-messages.ts` | Reads and mutates the message list from the Zustand store. |
| `use-fake-loading.ts` | Introduces a 1.5 s artificial delay to simulate a thinking state. |
| `use-scroll-to-bottom.ts` | Auto-scrolls the message list to the latest message on update. |
| `use-mobile.ts` | Detects narrow viewports to enable responsive layout behavior. |

**Design rationale:** The presentation layer contains no business logic. It delegates all decisions to server actions (Application Layer) and reads derived state from Zustand stores.

---

### Layer 2 — Application Layer

**Location:** `apps/web/src/app/(chat)/chat/actions.ts`, `apps/web/src/lib/store/`

This layer orchestrates user intent: it receives a user message, calls the Domain Layer, persists results, and returns a response to the UI. In Next.js terms, these are **server actions** and **Zustand stores**.

#### Server Actions

**`generateResponse(message, intent, technique, history)`**

The primary request handler. Execution order:

1. Instantiate `CrisisDetector` and classify the message.
2. If risk is `MED` or `HIGH`: return a pre-written safe response immediately. Do not call the CBT engine.
3. If risk is `LOW`: call `CogniEngine.respond()` with the full conversation history, current intent, and chosen prompt technique.
4. Return the assistant reply, next intent, detected distortion, and crisis metadata to the UI.

**`sendDataSMTP(records)`**

Exports the raw session records as a JSON attachment via Nodemailer over SMTP. Environment variables configure the mail server and recipient.

#### Zustand State Stores

| Store | Persisted | Contents |
|---|---|---|
| `ChatMessagesStore` | Yes (localStorage) | Ordered list of `Message` objects (id, user, text, timestamp). |
| `SessionDataStore` | Yes (localStorage) | Array of `SessionStageRecord` entries, current intent, and active prompt technique. |
| `PromptStateStore` | No | The currently selected `PromptTechnique` (default: `'pebbles'`). |

**Design rationale:** Server actions act as a thin transaction boundary — they coordinate services but contain no CBT logic themselves. Stores provide a single source of truth that both pages (`/chat` and `/chat-test`) can read without prop drilling.

---

### Layer 3 — Domain Layer

**Location:** `packages/cogni/src/`

This is the core of the system. The Domain Layer encodes all CBT knowledge, conversation management logic, and therapeutic response generation. It is entirely independent of the web application and can be used as a standalone npm package.

#### Sub-modules

| Sub-module | Path | Responsibility |
|---|---|---|
| `CogniEngine` | `src/api/engine.ts` | Public API — orchestrates all services for a single turn. |
| `CrisisDetector` | `src/services/crisis-detector.ts` | Screens every message for five categories of crisis risk. |
| `DistortionClassifier` | `src/services/distortion-classifier.ts` | Identifies one of ten cognitive distortions in a user message. |
| `IntentManager` | `src/services/intent-manager/` | Finite state machine that advances through the 8-stage CBT workflow. |
| `ReplyGenerator` | `src/services/reply-generator.ts` | Generates a therapeutic reply using a chosen prompt technique. |
| `SessionTracker` | `src/services/session-summary/` | Records per-turn data during a session. |
| `SessionSummaryGenerator` | `src/services/session-summary/` | Computes session analytics from recorded data. |
| Prompts | `src/prompts/` | Six distinct prompt technique implementations. |

See [Section 3 — Component Design](#3-component-design) for detailed descriptions of each service.

**Design rationale:** Isolating CBT logic into a separate package enforces clean boundaries. The web app cannot accidentally bypass the therapeutic pipeline. It also makes Cogni testable in isolation (unit tests via Vitest) and reusable in other applications such as a CLI or mobile client.

---

### Layer 4 — Infrastructure Layer

**Location:** External APIs, browser storage, environment configuration

This layer provides the concrete implementations that the Domain and Application layers depend on. It includes:

#### OpenAI via LangChain

All LLM calls are made through `@langchain/openai` using `ChatOpenAI`. Services receive a `BaseChatModel` instance via dependency injection, making them testable with mock models.

- **Model:** `gpt-4.1`
- **Temperature:** `0.2` (near-deterministic for consistent therapeutic responses)
- **Structured outputs:** Every service uses `model.withStructuredOutput(zodSchema)` to guarantee that LLM responses conform to typed interfaces.

#### SMTP (Nodemailer)

Used exclusively by the `sendDataSMTP` server action. Configured via environment variables:

```
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
SMTP_SECURE, MAIL_FROM_EMAIL, MAIL_TO
```

#### Browser localStorage

Zustand's `persist` middleware serializes the `ChatMessagesStore` and `SessionDataStore` to `localStorage`. This gives the user a persistent session across page reloads without requiring a backend database.

#### Environment Variables

```
OPENAI_API_KEY     # Required — authenticates all LLM calls
```

---

## 3. Component Design

### CogniEngine

**File:** `packages/cogni/src/api/engine.ts`

The public entry point for the Domain Layer. For each user turn it:

1. Selects the correct prompt configuration for the current intent and technique.
2. Runs `DistortionClassifier`, `IntentManager`, and `ReplyGenerator` in sequence.
3. Returns a `CogniResponse` containing the assistant reply, the next intent, and the detected distortion.

```typescript
class CogniEngine {
  constructor(model: BaseChatModel)
  async respond(request: CogniRequest): Promise<CogniResponse>
  async identifyCognitiveDistortions(message: string): Promise<CognitiveDistortionClassification>
  getIntents(): Intent[]
  getPromptTechniques(): PromptTechnique[]
}
```

---

### CrisisDetector

**File:** `packages/cogni/src/services/crisis-detector.ts`

A standalone service that runs **before** the CBT pipeline on every message. It classifies messages into five crisis categories and assigns a risk level.

**Crisis categories:** `suicidal_ideation`, `self_harm`, `harm_to_others`, `abuse_or_violence`, `severe_distress`

**Risk levels:** `LOW` | `MED` | `HIGH`

For `MED` and `HIGH` risk, `getSafeResponse(category)` returns a pre-written, empathetic message that includes Philippine crisis hotline information. The CBT engine is never called in these cases.

```typescript
class CrisisDetector {
  constructor(model: BaseChatModel)
  async classify(message: string): Promise<CrisisClassification>
  static requiresIntervention(risk: RiskLevel): boolean
  static getSafeResponse(category: CrisisCategory): string
}
```

---

### DistortionClassifier

**File:** `packages/cogni/src/services/distortion-classifier.ts`

Classifies a user message into one of ten cognitive distortions from CBT literature. Returns the distortion type, a confidence score (0–1), and the reasoning used.

**Distortions detected:**

| # | Distortion |
|---|---|
| 1 | All-or-nothing thinking |
| 2 | Overgeneralization |
| 3 | Mental filtering |
| 4 | Discounting the positive |
| 5 | Jumping to conclusions |
| 6 | Catastrophizing |
| 7 | Emotional reasoning |
| 8 | Should statements |
| 9 | Labeling |
| 10 | Personalization and blame |

---

### IntentManager

**File:** `packages/cogni/src/services/intent-manager/`

Implements a finite state machine over the 8 CBT intents (`I1`–`I8`). For each turn, it:

1. Evaluates whether the user's response satisfies the completion criteria for the current intent.
2. If complete: transitions to the next intent.
3. If not complete: keeps the current intent so the assistant re-addresses the same stage.

After `I8` the cycle resets to `I1`, allowing multiple CBT cycles in a single session.

---

### ReplyGenerator

**File:** `packages/cogni/src/services/reply-generator.ts`

Generates the final therapeutic response. It receives:

- The current intent
- The detected cognitive distortion
- The full conversation history
- The selected prompt technique configuration

It injects the appropriate system prompt for the active technique and intent, then calls the LLM to produce a structured reply.

---

### SessionTracker & SessionSummaryGenerator

**Files:** `packages/cogni/src/services/session-summary/`

`SessionTracker` records a `SessionStageRecord` for every completed turn:

```typescript
interface SessionStageRecord {
  intent: Intent
  userMessage: string
  assistantReply: string
  distortion?: CognitiveDistortionClassification
  nextIntent: Intent
  timestamp: number
}
```

`SessionSummaryGenerator` is a pure, stateless function that takes an array of records and computes:

- **Mood delta** — change in self-reported mood between `I3` (initial rating) and `I7` (re-rating)
- **Distortion profile** — frequency and average confidence per distortion type
- **Intent funnel** — turns spent per stage and whether each stage was completed
- **Mermaid flowchart** — a visual diagram of the session flow
- **Text summary** — a clinician-facing plain-text narrative

---

## 4. Data Flow

The following describes the full lifecycle of a single user message:

```
User types message
       │
       ▼
  ChatInput (UI)
       │  calls server action
       ▼
generateResponse(message, intent, technique, history)
       │
       ├─► CrisisDetector.classify(message)
       │         │
       │    risk MED/HIGH ──► return safe template response
       │         │
       │    risk LOW
       │         │
       ├─► CogniEngine.respond(request)
       │         │
       │         ├─► DistortionClassifier → distortion + confidence
       │         ├─► IntentManager       → should advance intent?
       │         └─► ReplyGenerator      → therapeutic reply text
       │
       │    returns { reply, nextIntent, distortion, crisis }
       │
       ├─► SessionDataStore.recordTurn(...)   ← persisted to localStorage
       └─► ChatMessagesStore.addMessage(...)  ← persisted to localStorage
                  │
                  ▼
           ChatMessages re-renders
           (+ SessionSummary panel in /chat-test)
```

---

## 5. State Management

State is divided by concern across three Zustand stores:

```
ChatMessagesStore
  ├── messages: Message[]
  ├── addMessage(text, user)
  └── clearMessages()

SessionDataStore
  ├── records: SessionStageRecord[]
  ├── technique: PromptTechnique
  ├── currentIntent: Intent
  ├── recordTurn(input)
  └── clearSession()

PromptStateStore
  ├── promptTechnique: PromptTechnique
  └── setPromptTechnique(technique)
```

Both `ChatMessagesStore` and `SessionDataStore` use Zustand's `persist` middleware so session state survives page refreshes. On session clear, both stores are reset together to maintain consistency.

---

## 6. Prompt Engineering

Six prompt techniques are available. Each technique defines a per-intent system prompt that shapes how the assistant responds at each CBT stage.

| Technique | Description |
|---|---|
| `default` | No custom system prompt. Relies on base model behaviour. |
| `persona` | Assigns a therapist persona with explicit objectives and boundaries per intent. |
| `few-shot` | Provides 6–7 worked examples per intent to demonstrate the desired response style. |
| `chain-of-thought` | Instructs the model to reason step-by-step before producing a response. |
| `plan-and-solve` | Two-phase approach: first produce a plan, then execute it to generate a reply. |
| `pebbles` | A hybrid technique combining persona, chain-of-thought, and few-shot. **Default for the web app.** |

Techniques are registered in `packages/cogni/src/prompts/registry.ts`, which maps each `PromptTechnique` identifier to an object of per-intent prompt configurations.

---

## 7. CBT Workflow — Intent State Machine

The engine progresses through eight intents in order. Each intent corresponds to a stage in a standard CBT session.

```
I1 → I2 → I3 → I4 → I5 → I6 → I7 → I8 → (restart at I1)
```

| Intent | Stage | Therapeutic Goal |
|---|---|---|
| `I1` | Situation Identification | Help the user describe the triggering event clearly. |
| `I2` | Automatic Thought | Surface the negative automatic thought associated with the event. |
| `I3` | Mood Rating | Ask the user to rate their distress from 1–100. |
| `I4` | Evidence For | Explore evidence that supports the automatic thought. |
| `I5` | Evidence Against | Challenge the thought by finding contradictory evidence. |
| `I6` | Alternative Thought | Guide the user to formulate a more balanced perspective. |
| `I7` | Mood Re-rating | Ask the user to re-rate distress to measure the intervention's effect. |
| `I8` | Coping Strategy | Provide practical coping strategies the user can apply. |

The `IntentManager` uses completion rules to decide whether to advance. If a user's message does not satisfy the current stage's criteria (e.g., gives a non-numeric answer at `I3`), the intent does not advance and the assistant tries again.

---

## 8. Crisis Detection Pipeline

Crisis detection is the first operation on every message and acts as an unconditional safety gate.

```
Every user message
       │
       ▼
CrisisDetector.classify(message)
       │
       ├── risk: LOW  ──► proceed to CogniEngine (normal CBT flow)
       │
       ├── risk: MED  ──► return safe response + hotline info (no LLM call)
       │
       └── risk: HIGH ──► return safe response + hotline info (no LLM call)
```

Safe responses are hard-coded strings — not LLM-generated — to guarantee they are never harmful. They are returned immediately without contacting the CBT engine, ensuring speed and safety under distress.

---

## 9. Key Design Decisions

### Structured LLM Outputs

All LLM calls use `model.withStructuredOutput(zodSchema)`. This eliminates free-form text parsing and ensures every service receives a strongly typed result. If the LLM fails to conform to the schema, LangChain raises an error rather than silently returning malformed data.

### Dependency Injection for the LLM Model

Every service (`CrisisDetector`, `DistortionClassifier`, `ReplyGenerator`, `IntentManager`) accepts a `BaseChatModel` in its constructor. This makes each service independently testable with a mock model and allows callers to swap the underlying LLM without modifying service code.

### Separation of Cogni from the Web App

The CBT engine lives in `packages/cogni` with no dependency on Next.js or any web framework. This means:
- It can be tested in isolation.
- It can be used in other clients (CLI tools, mobile apps, APIs) without modification.
- The web app cannot accidentally couple UI concerns into therapeutic logic.

### No Backend Database

Session state is stored in `localStorage` via Zustand persist. This eliminates the need for a database server, simplifies deployment, and means no user data is stored server-side by default. Sessions can be exported manually via the SMTP action when needed.

### Crisis Response Safety

Crisis responses are static strings, not LLM-generated. This is an intentional decision: LLM responses under crisis conditions could vary unpredictably. Hard-coded responses guarantee that users in distress always receive a safe, human-reviewed message.

### Low LLM Temperature

All LLM calls use `temperature: 0.2`. This reduces randomness and produces more consistent therapeutic responses across turns, which is critical for a CBT workflow that depends on structured progression.
