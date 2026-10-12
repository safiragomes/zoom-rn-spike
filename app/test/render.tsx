import { render, type RenderOptions } from "@testing-library/react-native";
import type { ReactElement, ReactNode } from "react";
import { type Metrics, SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Render with the application providers already mounted.
 *
 * Always use this helper instead of Testing Library's `render`: no test should
 * repeat the provider setup, and when a new provider enters the app it only has
 * to be added here.
 *
 * From Testing Library 14 on, `render` is async — always `await` it.
 */

/**
 * safe-area-context cannot measure the screen under Jest, and without initial
 * metrics it renders no children. These are iPhone 14 values.
 */
export const TEST_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      {children}
    </SafeAreaProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: Providers, ...options });
}

export * from "@testing-library/react-native";
