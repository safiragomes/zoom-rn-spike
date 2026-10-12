/**
 * Global test setup, loaded before every suite.
 *
 * The mocks below cover native modules that do not exist in the Jest
 * environment. Without them, any test that mounts the provider tree would fail
 * for reasons unrelated to what it is testing.
 */

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
  setOptions: jest.fn(),
}));

jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo-google-fonts/barlow", () => ({
  useFonts: () => [true, null],
  Barlow_300Light: "Barlow_300Light",
  Barlow_400Regular: "Barlow_400Regular",
  Barlow_500Medium: "Barlow_500Medium",
  Barlow_600SemiBold: "Barlow_600SemiBold",
}));

// Spike only (src/features/zoom-spike/): the real package evaluates native
// module fields at import time and throws outside a device/dev-client. Remove
// alongside the feature.
jest.mock("@zoom/react-native-videosdk", () => ({
  ZoomVideoSdkProvider: ({
    children,
  }: {
    children: import("react").ReactNode;
  }) => children,
  useZoom: () => null,
  EventType: {},
  VideoAspect: {
    Original: "ZoomVideoSDKVideoAspect_Original",
    FullFilled: "ZoomVideoSDKVideoAspect_Full_Filled",
    LetterBox: "ZoomVideoSDKVideoAspect_LetterBox",
    PanAndScan: "ZoomVideoSDKVideoAspect_PanAndScan",
  },
}));

// Every test starts with clean mocks.
afterEach(() => {
  jest.clearAllMocks();
});
