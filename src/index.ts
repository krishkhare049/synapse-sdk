export * from "./types";
export * from "./errors";
export * from "./client";

import { SynapseClient } from "./client";
import { SynapseClientOptions } from "./types";

export function createSynapseClient(
  options: SynapseClientOptions
) {
  return new SynapseClient(options);
}