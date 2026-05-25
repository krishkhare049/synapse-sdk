# Synapse JavaScript SDK

Minimal TypeScript SDK for Synapse AI memory infrastructure.

Synapse helps AI applications store, retrieve, and manage long-term memory using semantic retrieval.

---

## Installation

```bash
npm install @khareindustries/synapse-sdk
```

---

## Features

- Memory ingestion
- Semantic retrieval
- TypeScript support
- API key authentication
- Timeout support
- ESM + CommonJS support
- Lightweight SDK

---

## Local Development Example

```ts
import {
  createSynapseClient,
} from "@khareindustries/synapse-sdk";

const synapse = createSynapseClient({
  apiUrl: "http://localhost:8000",
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

---

## Production Example

```ts
import {
  createSynapseClient,
} from "@khareindustries/synapse-sdk";

const synapse = createSynapseClient({
  apiUrl: "https://api.synapseai.dev",
  apiKey: process.env.SYNAPSE_API_KEY,
  timeout: 30000,
});
```

---

## API

### createSynapseClient()

Creates a Synapse SDK client.

```ts
const synapse = createSynapseClient({
  apiUrl: string,
  apiKey?: string,
  timeout?: number,
});
```

| Option | Type | Required | Description |
|---|---|---|---|
| apiUrl | string | Yes | Synapse server URL |
| apiKey | string | No | API authentication key |
| timeout | number | No | Request timeout in milliseconds |

---

### synapse.ingest()

Stores memories into Synapse.

```ts
await synapse.ingest({
  namespace: "app-name",
  userId: "user-123",
  content: "User likes React Native",
});
```

---

### synapse.retrieve()

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

- Node.js 18+
- Running Synapse backend server

---

## Roadmap

- Memory update APIs
- Memory deletion APIs
- Streaming retrieval
- LangChain integration
- OpenAI Agents SDK integration
- Vercel AI SDK integration
- Namespace analytics
- Memory management APIs

---

## License

MIT License

---

## Links

- GitHub Repository: https://github.com/krishkhare049/synapse-sdk
- Documentation: https://synapse-ai-service.vercel.app/