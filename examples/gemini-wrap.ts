import {
  GoogleGenAI,
} from "@google/genai";

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

  const gemini = synapse.wrapGemini(
    new GoogleGenAI({
      apiKey:
        process.env.GEMINI_API_KEY,
    }),
    {
      namespace: "career-coach-app",
      userId: "user-123",
      topK: 5,
      source: "gemini-wrap-example",
    }
  );

  const response =
    await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Help me prepare for frontend engineering interviews.",
            },
          ],
        },
      ],
    });

  if (typeof response.text === "function") {
    console.log(response.text());
    return;
  }

  console.log(response.text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
