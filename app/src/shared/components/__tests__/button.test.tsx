import { fireEvent, renderWithProviders, screen } from "@test/render";

import { Button } from "../button";

describe("Button", () => {
  it("shows the label and fires onPress", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Button label="Save" onPress={onPress} testID="btn" />,
    );

    expect(screen.getByText("Save")).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId("btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress while disabled", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Button label="Save" onPress={onPress} disabled testID="btn" />,
    );

    fireEvent.press(screen.getByTestId("btn"));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId("btn")).toBeDisabled();
  });

  it("swaps the label for a spinner while loading", async () => {
    await renderWithProviders(<Button label="Save" loading testID="btn" />);

    expect(screen.queryByText("Save")).not.toBeOnTheScreen();
    expect(screen.getByTestId("btn-loading")).toBeOnTheScreen();
  });

  it("marks the button as busy while loading", async () => {
    await renderWithProviders(<Button label="Save" loading testID="btn" />);

    expect(screen.getByTestId("btn")).toBeBusy();
    expect(screen.getByTestId("btn")).toBeDisabled();
  });
});
