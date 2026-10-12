/**
 * ⚠️ SPIKE — validates @zoom/react-native-videosdk against Expo/EAS before the
 * real integration. Delete this folder, the provider wiring in
 * `src/providers/app-providers.tsx`, the test mock in `test/setup.ts`, and
 * `EXPO_PUBLIC_SPIKE_SERVER_URL` once the spike's questions are answered.
 */

export type CameraDevice = {
  deviceId: string;
  deviceName: string;
  isSelectedDevice: boolean;
};

export type TranscriptionMessage = {
  messageID: string;
  messageContent: string;
  speakerName: string;
  speakerID: string;
  timeStamp: string;
  messageType: number;
  origin: "original" | "transcription";
};

export type SpokenLanguage = {
  languageId: number;
  languageName: string;
};
