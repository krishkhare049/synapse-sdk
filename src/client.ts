import {
  SynapseClientOptions,
  IngestRequest,
  IngestResponse,
  RetrieveRequest,
  RetrieveResponse,
  BuildContextRequest,
  InjectRequest,
  OpenAIMessage,
  UpdateMemoryRequest,
  UpdateMemoryResponse,
  DeleteMemoryRequest,
  DeleteMemoryResponse,
  WrapOptions,
} from "./types";

import {
  deleteRequest,
  postRequest,
  putRequest,
} from "./utils/request";

const OPENAI_METHOD = "chat.completions.create";
const CLAUDE_METHOD = "messages.create";
const GEMINI_METHOD = "models.generateContent";

type GeminiPart =
  | string
  | {
      text?: string;
      [key: string]: unknown;
    };

type GeminiContent =
  | string
  | {
      role?: string;
      parts?: GeminiPart[];
      [key: string]: unknown;
    };

type BeforeInvoke = (
  args: unknown[]
) => Promise<unknown[]>;

type AfterInvoke = (
  response: unknown
) => Promise<void>;

export class SynapseClient {
  private readonly apiUrl: string;
  private readonly apiKey?: string;
  private readonly timeout?: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: SynapseClientOptions) {
    this.apiUrl = options.apiUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.timeout = options.timeout;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async ingest(
    payload: IngestRequest
  ): Promise<IngestResponse> {
    return postRequest(
      "/ingest",
      payload,
      {
        apiUrl: this.apiUrl,
        apiKey: this.apiKey,
        timeout: this.timeout,
        fetchImpl: this.fetchImpl,
      }
    );
  }

  async retrieve(
    payload: RetrieveRequest
  ): Promise<RetrieveResponse> {
    return postRequest(
      "/retrieve",
      payload,
      {
        apiUrl: this.apiUrl,
        apiKey: this.apiKey,
        timeout: this.timeout,
        fetchImpl: this.fetchImpl,
      }
    );
  }

  async buildContext(
    payload: BuildContextRequest
  ): Promise<string> {
    const {
      maxTokens,
      ...retrievePayload
    } = payload;
    const result = await this.retrieve(
      retrievePayload
    );

    const segments: string[] = [];
    const summary = result.summary.trim();

    if (summary) {
      segments.push(summary);
    }

    for (const memory of result.memories) {
      const text = memory.text.trim();

      if (
        text &&
        !segments.some(
          (segment) =>
            segment.toLowerCase() ===
            text.toLowerCase()
        )
      ) {
        segments.push(text);
      }
    }

    if (segments.length === 0) {
      return "";
    }

    const denseContext = `User context: ${segments.join(" ")}`;

    return trimToApproxTokens(
      denseContext,
      maxTokens
    );
  }

  async inject(
    payload: InjectRequest
  ): Promise<OpenAIMessage[]> {
    const query =
      payload.query ??
      extractQueryFromMessages(
        payload.messages
      );

    if (!query) {
      return payload.messages.map(
        (message) => ({ ...message })
      );
    }

    const context = await this.buildContext({
      namespace: payload.namespace,
      userId: payload.userId,
      query,
      topK: payload.topK,
      category: payload.category,
      tags: payload.tags,
      includeArchived:
        payload.includeArchived,
      includeWorkingMemory:
        payload.includeWorkingMemory,
      maxTokens: payload.maxTokens,
    });

    if (!context) {
      return payload.messages.map(
        (message) => ({ ...message })
      );
    }

    const messages = payload.messages.map(
      (message) => ({ ...message })
    );
    const systemIndex = messages.findIndex(
      (message) => message.role === "system"
    );

    if (systemIndex >= 0) {
      messages[systemIndex] = {
        ...messages[systemIndex],
        content: appendContextToContent(
          messages[systemIndex].content,
          context
        ),
      };

      return messages;
    }

    return [
      {
        role: "system",
        content: context,
      },
      ...messages,
    ];
  }

  wrap<TClient extends object>(
    client: TClient,
    options: WrapOptions
  ): TClient {
    return this.wrapMessageClient(
      client,
      new Set([
        OPENAI_METHOD,
        CLAUDE_METHOD,
      ]),
      options
    );
  }

  wrapOpenAI<TClient extends object>(
    client: TClient,
    options: WrapOptions
  ): TClient {
    return this.wrapMessageClient(
      client,
      new Set([OPENAI_METHOD]),
      options
    );
  }

  wrapClaude<TClient extends object>(
    client: TClient,
    options: WrapOptions
  ): TClient {
    return this.wrapMessageClient(
      client,
      new Set([CLAUDE_METHOD]),
      options
    );
  }

  wrapAnthropic<TClient extends object>(
    client: TClient,
    options: WrapOptions
  ): TClient {
    return this.wrapClaude(
      client,
      options
    );
  }

  wrapGemini<TClient extends object>(
    client: TClient,
    options: WrapOptions
  ): TClient {
    return createClientProxy(
      client,
      [],
      new Set([GEMINI_METHOD]),
      async (args) => {
        const payload =
          (args[0] as Record<
            string,
            unknown
          >) ?? {};
        const originalMessages =
          getMessagesFromGeminiPayload(
            payload
          );

        if (!originalMessages) {
          return args;
        }

        const injectedMessages =
          await this.inject({
            namespace: options.namespace,
            userId: options.userId,
            messages: originalMessages,
            query: options.query,
            topK: options.topK,
            category: options.category,
            tags: options.tags,
            includeArchived:
              options.includeArchived,
            includeWorkingMemory:
              options.includeWorkingMemory,
            maxTokens: options.maxTokens,
          });

        return [
          buildGeminiPayload(
            payload,
            injectedMessages
          ),
          ...args.slice(1),
        ];
      },
      async (response) => {
        await this.ingestAssistantResponse(
          response,
          options
        );
      }
    );
  }

  async updateMemory(
    payload: UpdateMemoryRequest
  ): Promise<UpdateMemoryResponse> {
    const { memoryId, ...body } = payload;

    return putRequest(
      `/memories/${memoryId}`,
      body,
      {
        apiUrl: this.apiUrl,
        apiKey: this.apiKey,
        timeout: this.timeout,
        fetchImpl: this.fetchImpl,
      }
    );
  }

  async deleteMemory(
    payload: DeleteMemoryRequest
  ): Promise<DeleteMemoryResponse> {
    const { memoryId, ...body } = payload;

    return deleteRequest(
      `/memories/${memoryId}`,
      body,
      {
        apiUrl: this.apiUrl,
        apiKey: this.apiKey,
        timeout: this.timeout,
        fetchImpl: this.fetchImpl,
      }
    );
  }

  private wrapMessageClient<TClient extends object>(
    client: TClient,
    methods: Set<string>,
    options: WrapOptions
  ): TClient {
    return createClientProxy(
      client,
      [],
      methods,
      async (args) => {
        const payload =
          (args[0] as Record<
            string,
            unknown
          >) ?? {};
        const originalMessages =
          getMessagesFromPayload(payload);

        if (!originalMessages) {
          return args;
        }

        const injectedMessages =
          await this.inject({
            namespace: options.namespace,
            userId: options.userId,
            messages: originalMessages,
            query: options.query,
            topK: options.topK,
            category: options.category,
            tags: options.tags,
            includeArchived:
              options.includeArchived,
            includeWorkingMemory:
              options.includeWorkingMemory,
            maxTokens: options.maxTokens,
          });

        return [
          {
            ...payload,
            messages: injectedMessages,
          },
          ...args.slice(1),
        ];
      },
      async (response) => {
        await this.ingestAssistantResponse(
          response,
          options
        );
      }
    );
  }

  private async ingestAssistantResponse(
    response: unknown,
    options: WrapOptions
  ) {
    const content =
      extractAssistantText(response);

    if (!content) {
      return;
    }

    await this.ingest({
      namespace: options.namespace,
      userId: options.userId,
      content,
      source:
        options.source ?? "assistant",
      metadata:
        options.ingestMetadata,
      store_full_context: true,
    });
  }
}

function trimToApproxTokens(
  value: string,
  maxTokens?: number
): string {
  if (
    !maxTokens ||
    maxTokens <= 0
  ) {
    return value;
  }

  const words = value.split(/\s+/).filter(Boolean);

  if (words.length <= maxTokens) {
    return value;
  }

  return `${words
    .slice(0, maxTokens)
    .join(" ")}...`;
}

function appendContextToContent(
  content: unknown,
  context: string
): unknown {
  if (typeof content === "string") {
    return content.trim()
      ? `${content}\n\n${context}`
      : context;
  }

  if (Array.isArray(content)) {
    return [
      ...content,
      {
        type: "text",
        text: context,
      },
    ];
  }

  return context;
}

function extractTextFromContent(
  content: unknown
): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (
        typeof part === "string"
      ) {
        return part.trim();
      }

      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        (part as { type?: unknown }).type ===
          "text" &&
        "text" in part &&
        typeof (part as { text?: unknown })
          .text === "string"
      ) {
        return (
          part as { text: string }
        ).text.trim();
      }

      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function extractQueryFromMessages(
  messages: OpenAIMessage[]
): string {
  for (
    let index = messages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message = messages[index];

    if (message.role !== "user") {
      continue;
    }

    const text = extractTextFromContent(
      message.content
    );

    if (text) {
      return text;
    }
  }

  return "";
}

function getMessagesFromPayload(
  payload: Record<string, unknown>
): OpenAIMessage[] | null {
  if (!Array.isArray(payload.messages)) {
    return null;
  }

  return payload.messages as OpenAIMessage[];
}

function extractTextFromGeminiParts(
  parts: GeminiPart[] | undefined
): string {
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => {
      if (typeof part === "string") {
        return part.trim();
      }

      if (
        part &&
        typeof part === "object" &&
        typeof part.text === "string"
      ) {
        return part.text.trim();
      }

      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function normalizeGeminiRole(
  role: string | undefined
): string {
  if (role === "model") {
    return "assistant";
  }

  return role === "system"
    ? "system"
    : "user";
}

function getMessagesFromGeminiPayload(
  payload: Record<string, unknown>
): OpenAIMessage[] | null {
  const contents = payload.contents;
  const systemInstruction =
    getGeminiSystemInstructionText(
      payload.config
    );
  const messages: OpenAIMessage[] = [];

  if (systemInstruction) {
    messages.push({
      role: "system",
      content: systemInstruction,
    });
  }

  if (typeof contents === "string") {
    messages.push({
      role: "user",
      content: contents,
    });
    return messages;
  }

  if (
    contents &&
    typeof contents === "object" &&
    !Array.isArray(contents)
  ) {
    const content = contents as {
      role?: string;
      parts?: GeminiPart[];
    };
    const text = extractTextFromGeminiParts(
      content.parts
    );

    if (!text) {
      return messages.length
        ? messages
        : null;
    }

    messages.push({
      role: normalizeGeminiRole(
        content.role
      ),
      content: text,
    });

    return messages;
  }

  if (!Array.isArray(contents)) {
    return messages.length
      ? messages
      : null;
  }

  for (const item of contents as GeminiContent[]) {
    if (typeof item === "string") {
      if (item.trim()) {
        messages.push({
          role: "user",
          content: item.trim(),
        });
      }
      continue;
    }

    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const text = extractTextFromGeminiParts(
      item.parts
    );

    if (!text) {
      continue;
    }

    messages.push({
      role: normalizeGeminiRole(
        item.role
      ),
      content: text,
    });
  }

  return messages.length
    ? messages
    : null;
}

function getGeminiSystemInstructionText(
  config: unknown
): string {
  if (
    !config ||
    typeof config !== "object"
  ) {
    return "";
  }

  const instruction = (
    config as {
      systemInstruction?: unknown;
    }
  ).systemInstruction;

  if (
    typeof instruction === "string"
  ) {
    return instruction.trim();
  }

  if (
    instruction &&
    typeof instruction === "object"
  ) {
    const content =
      instruction as {
        parts?: GeminiPart[];
      };
    return extractTextFromGeminiParts(
      content.parts
    );
  }

  return "";
}

function buildGeminiPayload(
  payload: Record<string, unknown>,
  messages: OpenAIMessage[]
): Record<string, unknown> {
  const clonedPayload = {
    ...payload,
  };
  const systemMessages = messages.filter(
    (message) =>
      message.role === "system"
  );
  const nonSystemMessages = messages.filter(
    (message) =>
      message.role !== "system"
  );
  const systemInstruction = systemMessages
    .map((message) =>
      extractTextFromContent(
        message.content
      )
    )
    .filter(Boolean)
    .join("\n\n");

  const nextConfig = {
    ...((payload.config as Record<
      string,
      unknown
    >) ?? {}),
  };

  if (systemInstruction) {
    nextConfig.systemInstruction =
      systemInstruction;
  }

  clonedPayload.config = nextConfig;
  clonedPayload.contents =
    nonSystemMessages.map(
      (message) => ({
        role:
          message.role === "assistant"
            ? "model"
            : "user",
        parts: [
          {
            text: extractTextFromContent(
              message.content
            ),
          },
        ],
      })
    );

  return clonedPayload;
}

function createClientProxy<TClient extends object>(
  target: TClient,
  path: string[],
  methods: Set<string>,
  beforeInvoke: BeforeInvoke,
  afterInvoke: AfterInvoke
): TClient {
  return new Proxy(target, {
    get(
      currentTarget,
      property,
      receiver
    ) {
      const value = Reflect.get(
        currentTarget,
        property,
        receiver
      );

      if (
        typeof property !== "string"
      ) {
        return value;
      }

      const nextPath = [
        ...path,
        property,
      ];

      if (
        typeof value === "function" &&
        methods.has(
          nextPath.join(".")
        )
      ) {
        return async (
          ...args: unknown[]
        ) => {
          const nextArgs =
            await beforeInvoke(args);
          const response =
            await value.apply(
              currentTarget,
              nextArgs
            );
          await afterInvoke(response);
          return response;
        };
      }

      if (
        value &&
        typeof value === "object"
      ) {
        return createClientProxy(
          value as object,
          nextPath,
          methods,
          beforeInvoke,
          afterInvoke
        );
      }

      return value;
    },
  }) as TClient;
}

function extractAssistantText(
  response: unknown
): string {
  if (
    !response ||
    typeof response !== "object"
  ) {
    return "";
  }

  const record = response as Record<
    string,
    unknown
  >;

  if (
    typeof record.text === "string"
  ) {
    return record.text.trim();
  }

  if (
    typeof record.text === "function"
  ) {
    try {
      const text = (
        record.text as () => unknown
      )();
      if (typeof text === "string") {
        return text.trim();
      }
    } catch {
      return "";
    }
  }

  if (
    Array.isArray(record.choices)
  ) {
    return record.choices
      .map((choice) => {
        if (
          !choice ||
          typeof choice !== "object"
        ) {
          return "";
        }

        const message = (
          choice as {
            message?: {
              content?: unknown;
            };
          }
        ).message;

        return extractTextFromContent(
          message?.content
        );
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  if (Array.isArray(record.content)) {
    return extractTextFromContent(
      record.content
    );
  }

  if (
    Array.isArray(record.candidates)
  ) {
    return record.candidates
      .map((candidate) => {
        if (
          !candidate ||
          typeof candidate !== "object"
        ) {
          return "";
        }

        const content = (
          candidate as {
            content?: {
              parts?: GeminiPart[];
            };
          }
        ).content;

        return extractTextFromGeminiParts(
          content?.parts
        );
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return "";
}
