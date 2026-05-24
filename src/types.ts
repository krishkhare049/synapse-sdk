export interface SynapseClientOptions {
  apiUrl: string;
  apiKey?: string;
  timeout?: number;
  fetchImpl?: typeof fetch;
}

export interface IngestRequest {
  namespace: string;
  userId: string;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
  store_full_context?: boolean;
}

export interface RetrieveRequest {
  namespace: string;
  userId: string;
  query: string;
  topK?: number;
  category?: string;
  tags?: string[];
  includeArchived?: boolean;
  includeWorkingMemory?: boolean;
}

export interface SynapseMemory {
  id: string;
  namespace: string;
  text: string;
  category: string;
  importance: number;
  relevance?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  pinned?: boolean;
  archived?: boolean;
}

export interface IngestResponse {
  success: boolean;
  namespace: string;
  userId: string;
  source: string;
  saved: SynapseMemory[];
  saved_count: number;
  skipped: Array<{
    content: string;
    reason: string;
  }>;
  skipped_count: number;
  extracted: Array<Record<string, unknown>>;
}

export interface RetrieveResponse {
  success: boolean;
  namespace: string;
  userId: string;
  query: string;
  summary: string;
  context: {
    text?: string;
    sections?: Array<{
      section: string;
      count: number;
      summary: string;
      highlights: string[];
    }>;
  };
  memories: SynapseMemory[];
  result_count: number;
  filters: Record<string, unknown>;
}