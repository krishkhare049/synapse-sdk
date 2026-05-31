import OpenAI from "openai";

import {
  createSynapseClient,
} from "../src";

async function main() {
  const synapse = createSynapseClient({
    apiUrl:
      process.env.SYNAPSE_API_URL ??
      "http://localhost:8000",
    apiKey: process.env.SYNAPSE_API_KEY,
  });

  const openai = synapse.wrap(
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
    {
      namespace: "career-coach-app",
      userId: "user-123",
      topK: 5,
      source: "openai-wrap-example",
    }
  );

  const response =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "Help me prepare for frontend engineering interviews.",
        },
      ],
    });

  console.log(
    response.choices[0]?.message?.content
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
