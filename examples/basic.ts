import {
  createSynapseClient,
} from "../src";

async function main() {
  const synapse = createSynapseClient({
    apiUrl: "http://localhost:8000",
    apiKey: "your_api_key",
  });

  await synapse.ingest({
    namespace: "career-coach-app",
    userId: "user-123",
    content:
      "I am preparing for React Native interviews.",
    source: "chat",
  });

  const result =
    await synapse.retrieve({
      namespace: "career-coach-app",
      userId: "user-123",
      query: "Resume help",
    });

  console.log(result.summary);
}

main();