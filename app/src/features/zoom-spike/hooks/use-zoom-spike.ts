/** ⚠️ SPIKE — see types.ts. */
import {
  EventType,
  useZoom,
  type ZoomVideoSdkUser,
} from "@zoom/react-native-videosdk";
import { useCallback, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

import { zoomSpikeService } from "../services/zoom-spike-service";
import type {
  CameraDevice,
  SpokenLanguage,
  TranscriptionMessage,
} from "../types";

export function useZoomSpike() {
  const zoom = useZoom();

  const [sessionName, setSessionName] = useState("spike-zoom-rn");
  const [userName, setUserName] = useState("Participante RN");
  const [isHost, setIsHost] = useState(true);
  // Diagnostic toggle: join audio-only to check whether a freeze a few
  // seconds after join is specific to video rendering.
  const [videoOn, setVideoOn] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("");

  const [mySelfId, setMySelfId] = useState<string | null>(null);
  const [remoteUserIds, setRemoteUserIds] = useState<string[]>([]);

  const [cameraList, setCameraList] = useState<CameraDevice[]>([]);
  const [cameraBusy, setCameraBusy] = useState(false);

  const [canTranscribe, setCanTranscribe] = useState<boolean | null>(null);
  const [languages, setLanguages] = useState<SpokenLanguage[]>([]);
  const [transcriptionOn, setTranscriptionOn] = useState(false);
  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);

  const listenersRef = useRef<{ remove: () => void }[]>([]);

  const log = useCallback((text: string) => {
    console.log("[zoom-spike]", text);
    setStatus(text);
  }, []);

  const sendTranscriptToServer = useCallback(
    (message: Omit<TranscriptionMessage, "origin">) => {
      zoomSpikeService.postTranscript(message).catch((cause) => {
        console.error("[zoom-spike] failed to POST /transcript", cause);
      });
    },
    [],
  );

  const registerListeners = useCallback(() => {
    if (!zoom) return;
    const subscriptions = [
      zoom.addListener(EventType.onUserJoin, (payload) => {
        const list = payload?.remoteUsers ?? [];
        setRemoteUserIds(list.map((user: ZoomVideoSdkUser) => user.userId));
      }),
      zoom.addListener(EventType.onUserLeave, (payload) => {
        const list = payload?.remoteUsers ?? [];
        setRemoteUserIds(list.map((user: ZoomVideoSdkUser) => user.userId));
      }),
      zoom.addListener(EventType.onLiveTranscriptionStatus, (payload) => {
        log(`Live transcription status: ${JSON.stringify(payload)}`);
      }),
      zoom.addListener(EventType.onOriginalLanguageMsgReceived, (payload) => {
        setMessages((current) => [
          ...current,
          { ...payload, origin: "original" },
        ]);
        sendTranscriptToServer(payload);
      }),
      zoom.addListener(
        EventType.onLiveTranscriptionMsgInfoReceived,
        (payload) => {
          setMessages((current) => [
            ...current,
            { ...payload, origin: "transcription" },
          ]);
          sendTranscriptToServer(payload);
        },
      ),
    ];
    listenersRef.current = subscriptions;
  }, [zoom, log, sendTranscriptToServer]);

  const removeListeners = useCallback(() => {
    listenersRef.current.forEach((subscription) => subscription.remove());
    listenersRef.current = [];
  }, []);

  const requestMediaPermissions = useCallback(async () => {
    if (Platform.OS !== "android") return;

    // The SDK declares the permissions in app.json/AndroidManifest.xml, but
    // Android still requires the runtime grant (API 23+) — the SDK itself
    // never calls PermissionsAndroid, it just fails silently (black video
    // view, no thrown error) when CAMERA is missing.
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    const denied = Object.entries(granted).filter(
      ([, result]) => result !== PermissionsAndroid.RESULTS.GRANTED,
    );
    if (denied.length > 0) {
      throw new Error(
        `Permission denied: ${denied.map(([permission]) => permission).join(", ")}`,
      );
    }
  }, []);

  const join = useCallback(async () => {
    if (!zoom || connecting || connected) return;

    try {
      setConnecting(true);
      log("Requesting camera/microphone permissions...");
      await requestMediaPermissions();

      log("Fetching token from the spike server...");

      const { token } = await zoomSpikeService.fetchToken(
        sessionName.trim(),
        isHost ? 1 : 0,
      );

      log("Joining the Zoom session...");
      registerListeners();

      await zoom.joinSession({
        sessionName: sessionName.trim(),
        token,
        userName: userName.trim(),
        // autoAdjustSpeakerVolume is typed optional, but the native Android
        // bridge NPEs (RNZoomVideoSdkModule.java) when it is omitted — pass
        // it explicitly.
        audioOptions: { connect: true, mute: false, autoAdjustSpeakerVolume: true },
        videoOptions: { localVideoOn: videoOn },
        sessionIdleTimeoutMins: 40,
      });

      const self = await zoom.session.getMySelf();
      setMySelfId(self.userId);

      if (videoOn) {
        // rotateMyVideo takes Android's Surface.ROTATION_0..3 (0/1/2/3), not
        // degrees — confirmed by reading RNZoomViewManager.java, which calls
        // rotateMyVideo(display.getRotation()). The wrapper only calls this
        // itself on a display-rotation-change event, never on initial join,
        // so a phone that stays upright the whole call never gets corrected
        // automatically. 0 = Surface.ROTATION_0 (device's natural, portrait,
        // orientation) fixes it when held upright.
        try {
          await zoom.videoHelper.rotateMyVideo(0);
        } catch (cause) {
          console.warn("[zoom-spike] rotateMyVideo failed", cause);
        }
      }

      const remoteUsers = await zoom.session.getRemoteUsers();
      setRemoteUserIds(remoteUsers.map((user: ZoomVideoSdkUser) => user.userId));

      const cameras = await zoom.videoHelper.getCameraList();
      setCameraList(cameras);

      const canStart =
        await zoom.liveTranscriptionHelper.canStartLiveTranscription();
      setCanTranscribe(canStart);

      setConnected(true);
      log("Connected.");
    } catch (cause) {
      console.error(cause);
      log(`Failed to join: ${cause instanceof Error ? cause.message : cause}`);
      removeListeners();
    } finally {
      setConnecting(false);
    }
  }, [
    zoom,
    connecting,
    connected,
    sessionName,
    userName,
    isHost,
    videoOn,
    requestMediaPermissions,
    registerListeners,
    removeListeners,
    log,
  ]);

  const leave = useCallback(async () => {
    try {
      await zoom?.leaveSession(false);
    } catch (cause) {
      console.error(cause);
    } finally {
      removeListeners();
      setConnected(false);
      setMySelfId(null);
      setRemoteUserIds([]);
      setCameraList([]);
      setCanTranscribe(null);
      setLanguages([]);
      setTranscriptionOn(false);
      setMessages([]);
      setStatus("");
    }
  }, [zoom, removeListeners]);

  const switchCamera = useCallback(async () => {
    if (!zoom || !connected || cameraBusy) return;
    try {
      setCameraBusy(true);
      log("Switching camera...");
      const ok = await zoom.videoHelper.switchCamera();
      const cameras = await zoom.videoHelper.getCameraList();
      setCameraList(cameras);

      // Tried calling rotateMyVideo(0) here (switchCamera() resets the
      // rotation correction applied at join time, so the video goes back to
      // landscape after switching). Reverted: calling it immediately after
      // switchCamera() breaks video rendering entirely (black, no image) —
      // likely a timing issue with the capture session mid-restart. Not
      // re-attempted with a delay yet; see teste_zoom_rn.md bug #6.

      log(ok ? "Camera switched." : "switchCamera returned false.");
    } catch (cause) {
      console.error(cause);
      log(
        `Failed to switch camera: ${cause instanceof Error ? cause.message : cause}`,
      );
    } finally {
      setCameraBusy(false);
    }
  }, [zoom, connected, cameraBusy, log]);

  const startTranscription = useCallback(async () => {
    if (!zoom || !connected) return;
    try {
      log("Checking transcription permission...");
      const canStart =
        await zoom.liveTranscriptionHelper.canStartLiveTranscription();
      setCanTranscribe(canStart);

      if (!canStart) {
        log("canStartLiveTranscription returned false.");
        return;
      }

      const availableLanguages =
        await zoom.liveTranscriptionHelper.getAvailableSpokenLanguages();
      setLanguages(availableLanguages);

      const portuguese = availableLanguages.find((language: SpokenLanguage) =>
        /portug/i.test(language.languageName),
      );
      if (portuguese) {
        zoom.liveTranscriptionHelper.setSpokenLanguage(portuguese.languageId);
        log(`Spoken language set to ${portuguese.languageName}.`);
      } else {
        log("Portuguese not found in the available languages.");
      }

      const result =
        await zoom.liveTranscriptionHelper.startLiveTranscription();
      log(`startLiveTranscription: ${JSON.stringify(result)}`);

      await zoom.liveTranscriptionHelper.enableReceiveSpokenLanguageContent(
        true,
      );
      setTranscriptionOn(true);
    } catch (cause) {
      console.error(cause);
      log(
        `Failed to start transcription: ${cause instanceof Error ? cause.message : cause}`,
      );
    }
  }, [zoom, connected, log]);

  return {
    sessionName,
    setSessionName,
    userName,
    setUserName,
    isHost,
    setIsHost,
    videoOn,
    setVideoOn,
    connecting,
    connected,
    status,
    mySelfId,
    remoteUserIds,
    cameraList,
    cameraBusy,
    canTranscribe,
    languages,
    transcriptionOn,
    messages,
    join,
    leave,
    switchCamera,
    startTranscription,
  };
}
