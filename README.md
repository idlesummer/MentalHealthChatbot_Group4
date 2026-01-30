# Mental Health Chatbot - Group 4

A monorepo containing the **Cogni** CBT engine and related applications for building mental health chatbot systems.

## 🎯 What's Inside

This repository contains:

- **[@rainev/cogni](./packages/cogni/)** - A standalone, reusable Cognitive Behavioral Therapy (CBT) engine for LLM-powered therapeutic conversations
- **Examples** - Working examples demonstrating various use cases and prompt techniques

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- npm

### Installation

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Lint all packages
npm run lint
```

### Using the Cogni Package

```bash
cd packages/cogni

# Install dependencies
npm install

# Build the package
npm run build

# Run examples
cd examples/basic-usage
npm install
tsx index.ts
```

## 📦 Package Structure

```
.
├── packages/
│   └── cogni/              # CBT engine package
│       ├── src/            # Source code
│       ├── examples/       # Usage examples
│       ├── docs/           # Documentation
│       └── README.md       # Package documentation
├── apps/                   # (Future: Web applications)
└── package.json            # Monorepo root
```

## 📖 Documentation

For detailed documentation on the CBT engine, see:

- [Cogni Package README](./packages/cogni/README.md) - API reference and usage guide
- [Architecture Guide](./packages/cogni/docs/ARCHITECTURE.md) - Deep dive into the system design
- [Examples](./packages/cogni/examples/) - Working code examples

## 🧠 What is Cogni?

Cogni is an LLM-powered CBT engine that implements evidence-based therapeutic techniques. It guides users through an 8-stage process:

1. **Situation Identification** - Identify the triggering event
2. **Automatic Thought** - Capture negative thoughts
3. **Mood Rating** - Quantify emotional intensity
4. **Evidence For** - Examine supporting evidence
5. **Evidence Against** - Challenge with contradictory evidence
6. **Alternative Thought** - Cognitive restructuring
7. **Mood Re-rating** - Measure emotional shift
8. **Coping Strategy** - Provide actionable strategies

## 🛠️ Development

### Building the Cogni Package

```bash
# From anywhere in the monorepo
npm run build:cogni

# Or from the package directory
cd packages/cogni
npm run build
```

### Running Examples

```bash
cd packages/cogni/examples/basic-usage
npm install
tsx index.ts
```

## 🤝 Contributing

This is a group project for Mental Health Chatbot development.

**Contributors:**
- idlesummer
- lettertoelias
- rainev
- saac03

## 📄 License

MIT - See [LICENSE](./packages/cogni/LICENSE) for details.

## 🔗 Links

- [Package: @idlesummer/cogni](./packages/cogni/)
- [Examples](./packages/cogni/examples/)
- [Architecture Documentation](./packages/cogni/docs/ARCHITECTURE.md)
