export class SynapseError extends Error {
  status?: number;
  detail?: unknown;

  constructor(
    message: string,
    status?: number,
    detail?: unknown
  ) {
    super(message);

    this.name = "SynapseError";
    this.status = status;
    this.detail = detail;
  }
}