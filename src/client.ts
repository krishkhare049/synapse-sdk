import {
  SynapseClientOptions,
  IngestRequest,
  IngestResponse,
  RetrieveRequest,
  RetrieveResponse,
} from "./types";

import { postRequest } from "./utils/request";

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
}