import {
  Barlow_300Light,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  useFonts,
} from "@expo-google-fonts/barlow";
import { ZoomVideoSdkProvider } from "@zoom/react-native-videosdk";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { type ReactNode, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  type Metrics,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { colors } from "@/styles/tokens";

/**
 * Composition of every application-wide provider.
 *
 * It lives here rather than in `src/app/_layout.tsx` so the routing layer stays
 * free of logic (rule R1), and so tests can mount the exact same tree through
 * `test/render.tsx`.
 */

SplashScreen.preventAutoHideAsync();

export type AppProvidersProps = {
  children: ReactNode;
  /**
   * Tests only. In production the default is the real window metrics, which
   * avoid an extra layout frame on startup.
   */
  initialMetrics?: Metrics | null;
};

export function AppProviders({
  children,
  initialMetrics = initialWindowMetrics,
}: AppProvidersProps) {
  const [fontsLoaded] = useFonts({
    Barlow_300Light,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
  });

  useEffect(() => {
    // Paints the native window background. Without it, Android flashes white
    // between the splash screen and the first frame.
    SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      {/*
        Edge-to-edge is on: content draws behind the system bars. To respect the
        edges, call `useSafeAreaInsets()` in the screen. To opt out globally,
        wrap the children in
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>.
      */}
      <SafeAreaProvider initialMetrics={initialMetrics}>
        {/* Spike only: remove alongside src/features/zoom-spike/. */}
        <ZoomVideoSdkProvider config={{ domain: "zoom.us", enableLog: true }}>
          {children}
        </ZoomVideoSdkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
