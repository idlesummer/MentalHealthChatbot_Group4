You should update this README to reflect **pnpm as the package manager** and **monorepo-first workflows**, while still keeping it friendly for people who want to use `packages/cogni` standalone.

Below is a **clean, modern, pnpm-correct rewrite** with minimal disruption to your intent.

You do **not** need to explain pnpm internals—just correct commands and expectations.

---

# Mental Health Chatbot – Group 4

A monorepo containing the **Cogni** CBT engine and related applications for building mental health chatbot systems.

---

## 🎯 What’s Inside

This repository contains:

* **[@rainev/cogni](./packages/cogni/)** – A standalone, reusable Cognitive Behavioral Therapy (CBT) engine for LLM-powered therapeutic conversations
* **Examples** – Working examples demonstrating various use cases and prompt techniques
* **Apps** – Web and application-level integrations

---

## 🚀 Quick Start (Monorepo)

### Prerequisites

* Node.js ≥ 20
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

> ⚠️ Do not run `npm install` in this repository.
> Dependency installation is managed centrally with pnpm.

---

## 📦 Package Structure

```
.
├── packages/
│   └── cogni/              # CBT engine package
│       ├── src/            # Source code
│       ├── examples/       # Usage examples
│       ├── docs/           # Documentation
│       └── README.md       # Package documentation
├── apps/                   # Web / application integrations
├── pnpm-workspace.yaml     # Workspace definition
├── pnpm-lock.yaml          # Lockfile (single source of truth)
└── package.json            # Monorepo root
```

---

## 🧠 What is Cogni?

Cogni is an LLM-powered CBT engine that implements evidence-based therapeutic techniques. It guides users through an 8-stage process:

1. **Situation Identification** – Identify the triggering event
2. **Automatic Thought** – Capture negative thoughts
3. **Mood Rating** – Quantify emotional intensity
4. **Evidence For** – Examine supporting evidence
5. **Evidence Against** – Challenge with contradictory evidence
6. **Alternative Thought** – Cognitive restructuring
7. **Mood Re-rating** – Measure emotional shift
8. **Coping Strategy** – Provide actionable strategies

---

## 🛠️ Development

### Building the Cogni Package

From **anywhere** in the monorepo:

```bash
pnpm --filter cogni build
```

Or from inside the package directory:

```bash
cd packages/cogni
npm run build
```

(Using npm for scripts is fine; installs are handled by pnpm.)

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
npm run build
tsx index.ts
```

---

## 📖 Documentation

* [Cogni Package README](./packages/cogni/README.md)
* [Architecture Guide](./packages/cogni/docs/ARCHITECTURE.md)
* [Examples](./packages/cogni/examples/)

---

## 📦 Using Cogni as a Standalone Package

If you are only interested in the Cogni engine:

```bash
cd packages/cogni
pnpm install
pnpm build
```

Cogni behaves like an independent package and can be published or consumed separately.

---

## 🤝 Contributing

This is a group project for Mental Health Chatbot development.

**Contributors**

* idlesummer
* lettertoelias
* rainev
* saac03

---

## 📄 License

MIT – see [LICENSE](./packages/cogni/LICENSE)

---

## 🔗 Links

* [Cogni Package](./packages/cogni/)
* [Examples](./packages/cogni/examples/)
* [Architecture Documentation](./packages/cogni/docs/ARCHITECTURE.md)
