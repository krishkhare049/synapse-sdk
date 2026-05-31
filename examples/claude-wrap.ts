import Anthropic from "@anthropic-ai/sdk";

import {
  createSynapseClient,
} from "../src";

async function main() {
  const synapse = createSynapseClient({
    apiUrl:
      process.env.SYNAPSE_API_URL ??
      "http://localhost:3000/api/developer",
    apiKey: process.env.SYNAPSE_API_KEY,
  });

  const claude = synapse.wrapClaude(
    new Anthropic({
      apiKey:
        process.env.ANTHROPIC_API_KEY,
    }),
    {
      namespace: "career-coach-app",
      userId: "user-123",
      topK: 5,
      source: "claude-wrap-example",
    }
  );

  const response =
    await claude.messages.create({
      model: "claude-sonnet-4-0",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content:
            "Help me prepare for frontend engineering interviews.",
        },
      ],
    });

  console.log(
    response.content
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
