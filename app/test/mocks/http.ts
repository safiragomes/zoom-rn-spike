/**
 * Shared `fetch` mock for service-layer tests.
 *
 * Every test that exercises a service needs the same three things: a fake
 * `fetch`, a way to build a response, and a reset between cases. Hand-rolling
 * them per suite is how two tests end up disagreeing about what a 204 looks
 * like. Build responses here instead.
 *
 * These are deliberately *partial* `Response` objects — only the members
 * `src/services/http/client.ts` actually touches (`ok`, `status`, `text`).
 * Faking the whole interface would be busywork, and a real `Response` is not
 * constructible in this environment anyway.
 */

export type ResponseInit = { status?: number };

/** The subset of `Response` the HTTP client reads. */
export type FakeResponse = Pick<Response, "ok" | "status" | "text">;

function build(text: string, { status = 200 }: ResponseInit): FakeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  };
}

/**
 * A JSON response. Pass `null` for a body-less one (a 204, typically) — the
 * client reads an empty string there, not the text `"null"`.
 */
export function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
): FakeResponse {
  return build(body === null ? "" : JSON.stringify(body), init);
}

/**
 * A non-JSON response. The client falls back to returning the raw text when
 * the payload does not parse — this is how you cover that path.
 */
export function textResponse(
  text: string,
  init: ResponseInit = {},
): FakeResponse {
  return build(text, init);
}

/**
 * Installs a mocked `fetch` on the global object and hands it back so the test
 * can queue responses onto it.
 *
 * Call it once at module scope; the returned mock is reset before each test, so
 * queued values never leak from one case into the next:
 *
 * ```ts
 * const fetchMock = mockFetch();
 *
 * it("fetches the post", async () => {
 *   fetchMock.mockResolvedValueOnce(jsonResponse({ id: 1 }));
 *   await expect(exampleService.fetchPost(1)).resolves.toEqual({ id: 1 });
 * });
 * ```
 */
export function mockFetch(): jest.Mock {
  const fetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  beforeEach(() => fetchMock.mockReset());

  return fetchMock;
}
