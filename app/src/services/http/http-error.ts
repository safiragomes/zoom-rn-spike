/**
 * Normalized transport error.
 *
 * It exists so the layers above never have to inspect a `Response` nor tell a
 * network failure apart from an HTTP error in the middle of a component.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }

  /** `true` when the request never reached the server (offline, DNS, timeout). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /** `true` for 4xx — the client is wrong, retrying will not help. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** `true` for 5xx — the server is wrong, retrying might help. */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}
