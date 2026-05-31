import Link from "next/link";

const installCommand =
  "npm install @khareindustries/synapse-sdk";

const apiBaseUrl =
  "http://localhost:3000/api/developer";

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    wrapper: "wrapOpenAI()",
    method: "chat.completions.create(...)",
    model: "gpt-4o-mini",
    snippet: `import OpenAI from "openai";
import { createSynapseClient } from "@khareindustries/synapse-sdk";

const synapse = createSynapseClient({
  apiUrl: "${apiBaseUrl}",
  apiKey: process.env.SYNAPSE_API_KEY,
});

const openai = synapse.wrapOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  {
    namespace: "career-coach-app",
    userId: "user-123",
    topK: 5,
  }
);

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: "Help me prepare for frontend interviews.",
    },
  ],
});`,
  },
  {
    id: "claude",
    name: "Claude",
    wrapper: "wrapClaude()",
    method: "messages.create(...)",
    model: "claude-sonnet-4-0",
    snippet: `import Anthropic from "@anthropic-ai/sdk";
import { createSynapseClient } from "@khareindustries/synapse-sdk";

const synapse = createSynapseClient({
  apiUrl: "${apiBaseUrl}",
  apiKey: process.env.SYNAPSE_API_KEY,
});

const claude = synapse.wrapClaude(
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  }),
  {
    namespace: "career-coach-app",
    userId: "user-123",
    topK: 5,
  }
);

const response = await claude.messages.create({
  model: "claude-sonnet-4-0",
  max_tokens: 512,
  messages: [
    {
      role: "user",
      content: "Help me prepare for frontend interviews.",
    },
  ],
});`,
  },
  {
    id: "gemini",
    name: "Gemini",
    wrapper: "wrapGemini()",
    method: "models.generateContent(...)",
    model: "gemini-2.5-flash",
    snippet: `import { GoogleGenAI } from "@google/genai";
import { createSynapseClient } from "@khareindustries/synapse-sdk";

const synapse = createSynapseClient({
  apiUrl: "${apiBaseUrl}",
  apiKey: process.env.SYNAPSE_API_KEY,
});

const gemini = synapse.wrapGemini(
  new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  }),
  {
    namespace: "career-coach-app",
    userId: "user-123",
    topK: 5,
  }
);

const response = await gemini.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: "Help me prepare for frontend interviews.",
        },
      ],
    },
  ],
});`,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ffe4a8_0%,#fff8e7_32%,#f7f3eb_100%)] text-[#261f17]">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <section className="overflow-hidden rounded-[2.8rem] border border-[#e8d3a4] bg-white/80 shadow-[0_30px_120px_rgba(185,140,52,0.16)] backdrop-blur-xl">
          <div className="grid gap-12 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ead39f] bg-[#fff4d0] px-4 py-2 text-sm font-semibold text-[#8b5e16]">
                Synapse SDK Demo
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                One memory SDK.
                <span className="block text-[#9a6618]">
                  OpenAI, Claude, and Gemini wrappers.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#665948]">
                Synapse sits in front of your provider client, injects relevant
                memory before generation, and ingests assistant responses back
                into long-term memory after the call completes.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#providers"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2d2419] px-7 py-3 text-sm font-semibold text-[#fff2cf] transition hover:bg-[#3d3122]"
                >
                  Explore Wrappers
                </a>
                <Link
                  href="https://github.com/krishkhare049/synapse-sdk"
                  className="inline-flex items-center justify-center rounded-full border border-[#e3cfaa] bg-white px-7 py-3 text-sm font-semibold text-[#554632] transition hover:bg-[#fff9ec]"
                >
                  SDK Repository
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#ead7b0] bg-[linear-gradient(180deg,#fffaf0_0%,#fff2d5_100%)] p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Install",
                    value: installCommand,
                  },
                  {
                    label: "Developer API",
                    value: apiBaseUrl,
                  },
                  {
                    label: "OpenAI",
                    value: "wrapOpenAI()",
                  },
                  {
                    label: "Claude + Gemini",
                    value: "wrapClaude() / wrapGemini()",
                  },
                ].map((item) => {
                  return (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-[#eddcb8] bg-white/85 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1c9] text-sm font-semibold text-[#996514]">
                          {item.label
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-[#90785b]">
                            {item.label}
                          </p>
                          <p className="mt-2 break-all text-sm font-semibold text-[#2d2419]">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="providers"
          className="mt-14 grid gap-6"
        >
          {providers.map((provider) => (
            <article
              key={provider.id}
              className="rounded-[2.2rem] border border-[#ead8b4] bg-white/85 p-7 shadow-[0_10px_40px_rgba(185,140,52,0.09)]"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9a6618]">
                    {provider.name}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    {provider.wrapper}
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-8 text-[#665948]">
                    Wraps <code>{provider.method}</code> and automatically
                    connects provider calls to Synapse retrieval and memory
                    ingestion.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#ead8b4] bg-[#fff8e8] px-5 py-4 text-sm text-[#5f513e]">
                  <p className="font-semibold text-[#2d2419]">Suggested model</p>
                  <p className="mt-2 font-mono text-xs">{provider.model}</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[#ead8b4] bg-[#1f1a14] text-[#f7e8c5]">
                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                  <div className="h-3 w-3 rounded-full bg-[#ff7b72]" />
                  <div className="h-3 w-3 rounded-full bg-[#f1c45b]" />
                  <div className="h-3 w-3 rounded-full bg-[#6ecf6a]" />
                </div>
                <pre className="overflow-x-auto p-6 text-sm leading-7">
                  <code>{provider.snippet}</code>
                </pre>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
