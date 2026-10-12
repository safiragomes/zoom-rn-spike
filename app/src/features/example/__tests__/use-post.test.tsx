/**
 * ⚠️ EXAMPLE — delete along with the feature.
 *
 * Hook test template: the service is mocked, so the test covers the state logic
 * (loading → success / failure) without touching the network.
 */
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { HttpError } from "@/services/http";

import { usePost } from "../hooks/use-post";
import { exampleService } from "../services/example-service";

jest.mock("../services/example-service", () => ({
  exampleService: { fetchPost: jest.fn() },
}));

const fetchPost = exampleService.fetchPost as jest.MockedFunction<
  typeof exampleService.fetchPost
>;

const POST = { id: 1, userId: 1, title: "Title", body: "Body" };

describe("usePost", () => {
  it("delivers the post once it resolves", async () => {
    fetchPost.mockResolvedValueOnce(POST);

    const { result } = await renderHook(() => usePost(1));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.post).toEqual(POST);
    expect(result.current.error).toBeNull();
  });

  it("turns a network failure into an actionable message", async () => {
    fetchPost.mockRejectedValueOnce(new HttpError(0, "offline"));

    const { result } = await renderHook(() => usePost(1));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      "No connection. Check your internet and try again.",
    );
    expect(result.current.post).toBeNull();
  });

  it("falls back to a generic message for server errors", async () => {
    fetchPost.mockRejectedValueOnce(new HttpError(500, "boom"));

    const { result } = await renderHook(() => usePost(1));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Could not load the content.");
  });

  it("refetches when reload is called", async () => {
    fetchPost.mockResolvedValue(POST);

    const { result } = await renderHook(() => usePost(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.reload();
    });

    await waitFor(() => expect(fetchPost).toHaveBeenCalledTimes(2));
  });
});
