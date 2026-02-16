# Cogni Monorepo

A monorepo containing the **Cogni** CBT engine and the **Pebbles** web chatbot for building mental health support systems.

---

## What's Inside

This repository contains:

* **[@rainev/cogni](./packages/cogni/)** – A standalone, reusable Cognitive Behavioral Therapy (CBT) engine for LLM-powered therapeutic conversations
* **[Web App](./apps/web/)** – A Next.js 16 web application (chat interface + session analytics) powered by the Cogni engine
* **Examples** – Working examples demonstrating various use cases and prompt techniques

---

## Quick Start (Monorepo)

### Prerequisites

* Node.js >= 20
* **pnpm** (recommended)

```bash
corepack enable
```

---

### Installation

From the **repository root**:

```bash
# Install all workspace dependencies
pnpm install

# Build all packages
pnpm -r --if-present build

# Run tests
pnpm -r --if-present test

# Lint all packages
pnpm -r --if-present lint
```

> Do not run `npm install` in this repository.
> Dependency installation is managed centrally with pnpm.

---

## Package Structure

```
.
├── packages/
│   └── cogni/              # CBT engine package (@rainev/cogni)
│       ├── src/
│       │   ├── api/        # CogniEngine orchestrator
│       │   ├── services/   # Core services (distortion, crisis, intent, reply, session)
│       │   ├── prompts/    # 6 prompt engineering techniques
│       │   └── utils/      # Finite state machine
│       ├── examples/       # Usage examples
│       └── docs/           # Architecture documentation
├── apps/
│   └── web/                # Next.js 16 web application
│       ├── src/app/        # App router pages (chat, chat-test)
│       ├── src/components/ # Chat UI, session summary panel
│       └── src/lib/        # Zustand stores, utilities
├── pnpm-workspace.yaml     # Workspace definition
├── pnpm-lock.yaml          # Lockfile (single source of truth)
└── package.json            # Monorepo root
```

---

## What is Cogni?

Cogni is an LLM-powered CBT engine that implements evidence-based therapeutic techniques. It guides users through an 8-stage process:

1. **Situation Identification** – Identify the triggering event
2. **Automatic Thought** – Capture negative thoughts
3. **Mood Rating** – Quantify emotional intensity
4. **Evidence For** – Examine supporting evidence
5. **Evidence Against** – Challenge with contradictory evidence
6. **Alternative Thought** – Cognitive restructuring
7. **Mood Re-rating** – Measure emotional shift
8. **Coping Strategy** – Provide actionable strategies

### Key Capabilities

- **Crisis Detection** – LLM-powered safety screening that intercepts HIGH/MED risk messages before they enter the CBT pipeline, serving safe template responses with crisis hotline information
- **Cognitive Distortion Classification** – Identifies 10 cognitive distortions (all-or-nothing thinking, catastrophizing, etc.)
- **6 Prompt Techniques** – Default, Few-shot, Chain-of-Thought, Persona, Plan-and-Solve, and Pebbles (hybrid)
- **Session Analytics** – Mood delta tracking, distortion profiling, intent funnels, Mermaid flowcharts, and clinician-facing text summaries

---

## Web Application (Pebbles)

The web app at `apps/web/` provides two chat interfaces:

- **`/chat`** – Production chat experience with the Pebbles chatbot
- **`/chat-test`** – Development chat with a live session summary panel (mood delta, distortion profile, flowchart, stage notes)

### Running the Web App

```bash
# From the monorepo root
cd apps/web
cp .env.example .env  # Add your OPENAI_API_KEY
pnpm dev
```

**Stack:** Next.js 16, React 19, Zustand, Radix UI, Tailwind CSS 4, LangChain + OpenAI

---

## Development

### Building the Cogni Package

From **anywhere** in the monorepo:

```bash
pnpm --filter cogni build
```

Or from inside the package directory:

```bash
cd packages/cogni
pnpm build
```

---

### Running Cogni Examples

From the monorepo root:

```bash
pnpm --filter basic-usage build
pnpm --filter basic-usage start
```

Or locally inside an example directory:

```bash
cd packages/cogni/examples/basic-usage
pnpm build
tsx index.ts
```

---

## Documentation

* [Cogni Package README](./packages/cogni/README.md)
* [Architecture Guide](./packages/cogni/docs/ARCHITECTURE.md)
* [Examples](./packages/cogni/examples/)

---

## Using Cogni as a Standalone Package

If you are only interested in the Cogni engine:

```bash
cd packages/cogni
pnpm install
pnpm build
```

Cogni behaves like an independent package and can be published or consumed separately.

---

## Contributing

This is a group project for Mental Health Chatbot development.

**Contributors**

* idlesummer
* lettertoelias
* rainev
* saac03

---

## License

MIT – see [LICENSE](./packages/cogni/LICENSE)

---

## Links

* [Cogni Package](./packages/cogni/)
* [Examples](./packages/cogni/examples/)
* [Architecture Documentation](./packages/cogni/docs/ARCHITECTURE.md)
