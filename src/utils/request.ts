import { SynapseError } from "../errors";

interface RequestOptions {
  apiUrl: string;
  apiKey?: string;
  timeout?: number;
  fetchImpl: typeof fetch;
}

async function readResponsePayload(
  response: Response
): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function buildRequestError(
  response: Response,
  payload: unknown
): SynapseError {
  if (
    payload &&
    typeof payload === "object"
  ) {
    const record = payload as Record<
      string,
      unknown
    >;

    return new SynapseError(
      typeof record.detail === "string"
        ? record.detail
        : typeof record.error === "string"
          ? record.error
          : "Synapse request failed",
      response.status,
      payload
    );
  }

  return new SynapseError(
    typeof payload === "string" && payload.trim()
      ? payload
      : "Synapse request failed",
    response.status,
    payload
  );
}

async function sendRequest<T>(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  payload: unknown,
  options: RequestOptions
): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, options.timeout ?? 30000);

  try {
    const response = await options.fetchImpl(
      `${options.apiUrl}${path}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(options.apiKey && {
            Authorization: `Bearer ${options.apiKey}`,
          }),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );

    const data = await readResponsePayload(
      response
    );

    if (!response.ok) {
      throw buildRequestError(
        response,
        data
      );
    }

    return data as T;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new SynapseError(
        "Request timeout"
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function postRequest<T>(
  path: string,
  payload: unknown,
  options: RequestOptions
): Promise<T> {
  return sendRequest(
    "POST",
    path,
    payload,
    options
  );
}

export async function putRequest<T>(
  path: string,
  payload: unknown,
  options: RequestOptions
): Promise<T> {
  return sendRequest(
    "PUT",
    path,
    payload,
    options
  );
}

export async function deleteRequest<T>(
  path: string,
  payload: unknown,
  options: RequestOptions
): Promise<T> {
  return sendRequest(
    "DELETE",
    path,
    payload,
    options
  );
}
