import { jsonResponse, mockFetch, textResponse } from "@test/mocks/http";

import { httpClient } from "../client";
import { HttpError } from "../http-error";

/**
 * Service-layer test template: the global `fetch` is mocked, so the test covers
 * URL building, serialization and error translation without touching the
 * network.
 *
 * The mock and the response builders come from `@test/mocks/http`. Copy this
 * setup when testing a feature's own service — do not rebuild it per suite.
 */

const fetchMock = mockFetch();

describe("httpClient", () => {
  it("prefixes the base URL on relative paths", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 1 }));

    await httpClient.get("/posts/1");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/posts/1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("leaves absolute URLs untouched", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await httpClient.get("https://other.api/route");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://other.api/route",
      expect.anything(),
    );
  });

  it("returns the parsed JSON", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 7, title: "Hello" }));

    await expect(httpClient.get("/posts/7")).resolves.toEqual({
      id: 7,
      title: "Hello",
    });
  });

  it("serializes the body and declares the content type on POST", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await httpClient.post("/posts", { title: "New" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ title: "New" }));
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("omits the content type when there is no body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await httpClient.get("/posts");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("returns null for a 204 with no body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }));

    await expect(httpClient.delete("/posts/1")).resolves.toBeNull();
  });

  it("turns an error response into an HttpError carrying the status", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "not found" }, { status: 404 }),
    );

    const error = await httpClient.get("/posts/999").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(404);
    expect((error as HttpError).isClientError).toBe(true);
    expect((error as HttpError).body).toEqual({ message: "not found" });
  });

  it("classifies 5xx as a server error", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 503 }));

    const error = (await httpClient
      .get("/posts")
      .catch((e: unknown) => e)) as HttpError;

    expect(error.isServerError).toBe(true);
    expect(error.isClientError).toBe(false);
  });

  it("turns a network failure into an HttpError with status 0", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network request failed"));

    const error = (await httpClient
      .get("/posts")
      .catch((e: unknown) => e)) as HttpError;

    expect(error).toBeInstanceOf(HttpError);
    expect(error.isNetworkError).toBe(true);
  });

  it("reports a timeout as a network error", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    fetchMock.mockRejectedValueOnce(abortError);

    const error = (await httpClient
      .get("/posts", { timeoutMs: 10 })
      .catch((e: unknown) => e)) as HttpError;

    expect(error.isNetworkError).toBe(true);
    expect(error.message).toContain("exceeded 10ms");
  });

  it("returns raw text when the response is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(textResponse("pong"));

    await expect(httpClient.get("/ping")).resolves.toBe("pong");
  });
});
