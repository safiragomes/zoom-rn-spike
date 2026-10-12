/**
 * ⚠️ EXAMPLE — delete along with the feature.
 *
 * Feature-service test template. The boundary being mocked is `fetch`, not
 * `httpClient`: mocking the client would prove only that a mock returns what it
 * was told to, while this way the route the service builds is actually
 * exercised. Mock at the edge of your code, not at the edge of the file.
 */
import { jsonResponse, mockFetch } from "@test/mocks/http";

import { exampleService } from "../services/example-service";

const fetchMock = mockFetch();

const POST = { id: 1, userId: 1, title: "Title", body: "Body" };

describe("exampleService", () => {
  it("requests the post by id and returns it typed", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(POST));

    await expect(exampleService.fetchPost(1)).resolves.toEqual(POST);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/posts/1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("forwards the abort signal so the caller can cancel", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(POST));
    const controller = new AbortController();

    await exampleService.fetchPost(1, controller.signal);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("lets an HttpError from the client through untouched", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 404 }));

    await expect(exampleService.fetchPost(999)).rejects.toMatchObject({
      name: "HttpError",
      status: 404,
    });
  });
});
