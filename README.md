# README.md

<p align="center">
  <img src="https://raw.githubusercontent.com/krishkhare049/synapse-sdk/main/assets/synapse-khare-industries.png" width="120" alt="Synapse Logo" />
</p>

<h1 align="center">Synapse</h1>

<p align="center">
  Persistent Memory Infrastructure for AI Applications
</p>

<p align="center">
  Long-term semantic memory for AI agents, assistants, copilots, and AI-native applications.
</p>

<p align="center">

<img src="https://img.shields.io/npm/v/@khareindustries/synapse-sdk?style=for-the-badge" />
<img src="https://img.shields.io/npm/dm/@khareindustries/synapse-sdk?style=for-the-badge" />
<img src="https://img.shields.io/npm/unpacked-size/@khareindustries/synapse-sdk?style=for-the-badge" />
<img src="https://img.shields.io/npm/l/@khareindustries/synapse-sdk?style=for-the-badge" />
<img src="https://img.shields.io/badge/status-alpha-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/typescript-supported-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/node-%3E%3D18-green?style=for-the-badge" />
<img src="https://img.shields.io/github/stars/krishkhare049/synapse-sdk?style=for-the-badge" />

</p>

<p align="center">
  <a href="https://github.com/krishkhare049/synapse-sdk">GitHub</a>
  ·
  <a href="https://github.com/krishkhare049/synapse-sdk#readme">Documentation</a>
  ·
  <a href="https://www.linkedin.com/in/krishkhare/">LinkedIn</a>
  ·
  <a href="https://x.com/_krishkhare">X / Twitter</a>
</p>

---

<p align="center">
  <img src="https://raw.githubusercontent.com/krishkhare049/synapse-sdk/main/assets/synapsebannercode.png" alt="Synapse Banner" />
</p>

---

Synapse currently focuses on self-hosted and developer-operated memory infrastructure for AI applications.

---

## Why Synapse?

Most AI applications still forget users between conversations.

Developers often need to manually build:

* embedding pipelines
* vector databases
* semantic retrieval systems
* reranking
* memory persistence
* context injection
* long-term memory orchestration

Synapse provides a unified memory infrastructure layer for AI systems.

The goal is to make persistent AI memory:

* scalable
* developer-friendly
* composable
* production-ready
* low-latency

---

# Automatic Memory Injection

```ts
const openai = synapse.wrap(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  {
    namespace: "medical-app",
    userId: "user-123",
  }
);

await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "user",
      content: "my stomach hurts",
    },
  ],
});
```

Synapse automatically:

* retrieves relevant memories
* formats memory context
* injects context into prompts
* ingests assistant responses
* persists long-term memory

No manual prompt engineering required.

---

## Demo

<p align="center">
  <img src="https://raw.githubusercontent.com/krishkhare049/synapse-sdk/main/assets/demo.gif" alt="Synapse Demo" />
</p>

🎥 Full introduction video coming soon.

---

## Features

| Feature                       | Status |
| ----------------------------- | ------ |
| Semantic memory retrieval     | ✅      |
| Long-term memory storage      | ✅      |
| Redis working memory          | ✅      |
| Vector retrieval              | ✅      |
| Reranking pipelines           | ✅      |
| Prompt-ready context building | ✅      |
| Automatic message injection   | ✅      |
| AI client wrapping            | ✅      |
| Memory update APIs            | ✅      |
| Memory deletion APIs          | ✅      |
| TypeScript SDK                | ✅      |
| API authentication            | ✅      |
| Self-hosted architecture      | ✅      |
| Hosted Synapse Cloud          | 🚧     |
| LangChain integration         | 🚧     |
| OpenAI Agents SDK integration | 🚧     |
| Vercel AI SDK integration     | 🚧     |
| Dashboard & analytics         | 🚧     |

---

## Architecture

<p align="center">
  <img src="https://raw.githubusercontent.com/krishkhare049/synapse-sdk/main/assets/synapsearch.png" alt="Synapse Architecture" />
</p>

Synapse combines:

* semantic embeddings
* vector search
* reranking pipelines
* Redis working memory
* long-term vector storage
* retrieval optimization
* memory orchestration

to provide persistent contextual memory for AI systems.

---

## Memory Pipeline

```txt
retrieve()
  ↓
buildContext()
  ↓
inject()
  ↓
wrap()
```

Synapse is designed around composable memory primitives.

Developers can:

* use low-level retrieval APIs
* inject memory manually
* or fully automate memory workflows using wrap()

---

## Installation

```bash
npm install @khareindustries/synapse-sdk
```

---

## Quick Start

```ts
import {
  createSynapseClient,
} from "@khareindustries/synapse-sdk";

const synapse = createSynapseClient({
  apiUrl: "http://localhost:3000/api/developer",
  apiKey: process.env.SYNAPSE_API_KEY,
});

async function main() {
  await synapse.ingest({
    namespace: "career-coach-app",
    userId: "user-123",
    source: "chat",
    content:
      "I am preparing for React Native interviews and targeting Bangalore startups.",
    metadata: {
      app: "career-coach",
      sessionId: "sess_abc123",
    },
  });

  const memory =
    await synapse.retrieve({
      namespace: "career-coach-app",
      userId: "user-123",
      query: "Help optimize my resume",
    });

  console.log(memory.summary);
  console.log(memory.memories);
}

main();
```

More local examples live in `sdk/examples/`:

- `basic.ts` for direct ingest/retrieve usage
- `openai-wrap.ts` for automatic OpenAI chat memory injection
- `claude-wrap.ts` for Anthropic Claude message wrapping
- `gemini-wrap.ts` for Google Gemini content generation wrapping

---
# Core APIs

## createSynapseClient()

Creates a Synapse SDK client.

```ts
const synapse = createSynapseClient({
  apiUrl: string,
  apiKey?: string,
  timeout?: number,
});
```

| Option  | Type   | Required | Description                     |
| ------- | ------ | -------- | ------------------------------- |
| apiUrl  | string | Yes      | Synapse server URL              |
| apiKey  | string | No       | API authentication key          |
| timeout | number | No       | Request timeout in milliseconds |

---

## synapse.ingest()

Stores memories into Synapse.

```ts
await synapse.ingest({
  namespace: "app-name",
  userId: "user-123",
  content: "User likes React Native",
});
```

---

## synapse.retrieve()

Retrieves relevant memories semantically.

```ts
const result =
  await synapse.retrieve({
    namespace: "app-name",
    userId: "user-123",
    query: "What technologies does user like?",
  });
```

---

## synapse.buildContext()

Formats retrieved memories into a prompt-ready string.

```ts
const context =
  await synapse.buildContext({
    namespace: "medical-app",
    userId: "user-123",
    query: "my stomach hurts",
    maxTokens: 120,
  });
```

---

## synapse.inject()

Injects memory context into an OpenAI-style messages array.

```ts
const messages =
  await synapse.inject({
    namespace: "medical-app",
    userId: "user-123",
    messages: [
      {
        role: "user",
        content: "my stomach hurts",
      },
    ],
  });
```

---

## synapse.wrap()

Wraps OpenAI and Anthropic clients with automatic memory orchestration.

```ts
const openai = synapse.wrap(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  {
    namespace: "medical-app",
    userId: "user-123",
  }
);

await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "user",
      content: "my stomach hurts",
    },
  ],
});
```

Supported wrapped methods:

* openai.chat.completions.create(...)
* anthropic.messages.create(...)

After responses return, Synapse automatically ingests assistant messages into long-term memory.

---

## Provider Helpers

For explicit provider integrations, Synapse also exposes dedicated wrappers:

```ts
const openai = synapse.wrapOpenAI(client, options);
const claude = synapse.wrapClaude(client, options);
const anthropic = synapse.wrapAnthropic(client, options);
const gemini = synapse.wrapGemini(client, options);
```

Current provider method support:

* `wrapOpenAI()` wraps `chat.completions.create(...)`
* `wrapClaude()` and `wrapAnthropic()` wrap `messages.create(...)`
* `wrapGemini()` wraps `models.generateContent(...)`

---

## synapse.updateMemory()

Updates an existing memory.

```ts
await synapse.updateMemory({
  namespace: "app-name",
  userId: "user-123",
  memoryId: "mem_123",
  text: "User prefers React Native with Expo",
});
```

---

## synapse.deleteMemory()

Deletes an outdated or incorrect memory.

```ts
await synapse.deleteMemory({
  namespace: "app-name",
  userId: "user-123",
  memoryId: "mem_123",
});
```

---

## Example Response

```json
{
  "success": true,
  "summary": "User is preparing for React Native interviews.",
  "memories": [
    {
      "id": "mem_123",
      "text": "User is preparing for React Native interviews.",
      "category": "career",
      "importance": 0.92
    }
  ]
}
```

---

## Error Handling

```ts
try {
  await synapse.retrieve({
    namespace: "app",
    userId: "123",
    query: "React Native",
  });
} catch (error) {
  console.error(error);
}
```

---

## Requirements

* Node.js 18+
* Running Synapse backend server

---

## Roadmap

* [x] Semantic retrieval
* [x] TypeScript SDK
* [x] Local infrastructure
* [x] Prompt-ready context building
* [x] Automatic memory injection
* [x] AI client wrapping
* [x] Memory update APIs
* [x] Memory deletion APIs
* [ ] Hosted Synapse Cloud
* [ ] Streaming retrieval
* [ ] LangChain integration
* [ ] Vercel AI SDK integration
* [ ] Memory importance scoring
* [ ] Structured memory extraction
* [ ] Memory observability & debugging
* [ ] Dashboard & analytics
* [ ] Multi-agent memory systems
* [ ] Agent memory graphs
* [ ] Memory visualization tools

---

## Community

<p align="center">
  <a href="https://github.com/krishkhare049/synapse-sdk">GitHub</a>
  ·
  <a href="https://github.com/krishkhare049/synapse-sdk#readme">Documentation</a>
  ·
  <a href="https://www.linkedin.com/in/krishkhare/">LinkedIn</a>
  ·
  <a href="https://x.com/_krishkhare">X / Twitter</a>
</p>

---

## License

MIT License

---

<p align="center">
  Built with ❤️ by Khare Industries
</p>
