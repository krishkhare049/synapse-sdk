import { SynapseError } from "../errors";

interface RequestOptions {
  apiUrl: string;
  apiKey?: string;
  timeout?: number;
  fetchImpl: typeof fetch;
}

export async function postRequest<T>(
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
        method: "POST",
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

    const data = await response.json();

    if (!response.ok) {
      throw new SynapseError(
        data?.detail ||
          data?.error ||
          "Synapse request failed",
        response.status,
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