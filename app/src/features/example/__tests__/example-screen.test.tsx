/**
 * ⚠️ EXAMPLE — delete along with the feature.
 *
 * Screen test template: only the service is mocked, so the component and the
 * hook are exercised for real. This is the level that buys the most confidence
 * per line written.
 */
import { renderWithProviders, screen, userEvent, waitFor } from "@test/render";

import { ExampleScreen } from "../components/example-screen";
import { exampleService } from "../services/example-service";

jest.mock("../services/example-service", () => ({
  exampleService: { fetchPost: jest.fn() },
}));

const fetchPost = exampleService.fetchPost as jest.MockedFunction<
  typeof exampleService.fetchPost
>;

const POST = {
  id: 1,
  userId: 1,
  title: "A fairly long title so the truncate helper has something to do",
  body: "Post body",
};

describe("ExampleScreen", () => {
  it("shows the spinner while loading", async () => {
    fetchPost.mockReturnValueOnce(new Promise(() => {}));

    await renderWithProviders(<ExampleScreen />);

    expect(screen.getByTestId("example-loading")).toBeOnTheScreen();
  });

  it("shows the content once the fetch succeeds", async () => {
    fetchPost.mockResolvedValueOnce(POST);

    await renderWithProviders(<ExampleScreen />);

    await waitFor(() =>
      expect(screen.getByText("Post body")).toBeOnTheScreen(),
    );
    expect(screen.queryByTestId("example-loading")).not.toBeOnTheScreen();
  });

  it("offers a retry when the fetch fails", async () => {
    fetchPost.mockRejectedValueOnce(new Error("boom"));

    await renderWithProviders(<ExampleScreen />);

    await waitFor(() =>
      expect(screen.getByTestId("example-retry")).toBeOnTheScreen(),
    );

    fetchPost.mockResolvedValueOnce(POST);
    await userEvent.press(screen.getByTestId("example-retry"));

    await waitFor(() =>
      expect(screen.getByText("Post body")).toBeOnTheScreen(),
    );
  });
});
