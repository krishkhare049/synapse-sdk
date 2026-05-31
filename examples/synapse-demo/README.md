# Synapse Demo

`synapse-demo` is a small Next.js showcase app for the Synapse SDK.

It highlights:

- `wrapOpenAI()` for OpenAI chat completions
- `wrapClaude()` / `wrapAnthropic()` for Claude messages
- `wrapGemini()` for Gemini `models.generateContent()`
- the correct Synapse developer API base URL: `http://localhost:3000/api/developer`

## Getting Started

Run the demo app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## What this demo is for

- launch-facing SDK provider examples
- wrapper method documentation
- a quick visual reference for integration snippets

## Related Files

- `sdk/examples/openai-wrap.ts`
- `sdk/examples/claude-wrap.ts`
- `sdk/examples/gemini-wrap.ts`
- `sdk/src/client.ts`

## Synapse Setup

Before using the wrappers in a real app:

- deploy `synapse-web` and `synapse-ai-service`
- generate a developer API key from the Synapse profile page
- set `SYNAPSE_API_KEY`
- point the SDK to `http://localhost:3000/api/developer`
