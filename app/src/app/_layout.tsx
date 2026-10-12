import { Slot } from "expo-router";

import { AppProviders } from "@/providers";

import "@/styles/global.css";

// The routing layer declares navigation and nothing else (rule R1).
// Providers, fonts and the splash screen live in @/providers/app-providers.
export default function RootLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
