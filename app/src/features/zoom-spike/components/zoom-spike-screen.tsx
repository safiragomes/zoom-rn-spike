/** ⚠️ SPIKE — see ../types.ts. */
import { VideoAspect, ZoomView } from "@zoom/react-native-videosdk";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/shared/components";

import { useZoomSpike } from "../hooks/use-zoom-spike";

function tileBasis(participantCount: number) {
  if (participantCount <= 1) return "100%";
  if (participantCount === 2) return "100%";
  if (participantCount <= 4) return "49%";
  return "32%";
}

export function ZoomSpikeScreen() {
  const insets = useSafeAreaInsets();
  const spike = useZoomSpike();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const participants = spike.mySelfId
    ? [spike.mySelfId, ...spike.remoteUserIds]
    : [];
  const basis = tileBasis(participants.length);

  if (!spike.connected) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="w-full max-w-sm gap-4 rounded-2xl bg-surface p-6 shadow-sm">
          <View className="items-center gap-1 pb-2">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-brand">
              <Text className="font-semibold text-xl text-ink-inverse">Z</Text>
            </View>
            <Text className="font-semibold text-xl text-ink">Zoom RN spike</Text>
            <Text className="text-center font-sans text-sm text-ink-muted">
              @zoom/react-native-videosdk validation screen
            </Text>
          </View>

          <View className="gap-1.5">
            <Text className="font-sans text-xs text-ink-muted">Session name</Text>
            <TextInput
              className="rounded-lg border border-ink-muted/25 px-3 py-3 font-sans text-ink"
              value={spike.sessionName}
              onChangeText={spike.setSessionName}
              editable={!spike.connecting}
              autoCapitalize="none"
            />
          </View>

          <View className="gap-1.5">
            <Text className="font-sans text-xs text-ink-muted">Your name</Text>
            <TextInput
              className="rounded-lg border border-ink-muted/25 px-3 py-3 font-sans text-ink"
              value={spike.userName}
              onChangeText={spike.setUserName}
              editable={!spike.connecting}
            />
          </View>

          <View className="flex-row items-center justify-between py-1">
            <Text className="font-sans text-sm text-ink">Join as host</Text>
            <Switch
              value={spike.isHost}
              onValueChange={spike.setIsHost}
              disabled={spike.connecting}
            />
          </View>

          <View className="flex-row items-center justify-between py-1">
            <Text className="font-sans text-sm text-ink">Local video</Text>
            <Switch
              value={spike.videoOn}
              onValueChange={spike.setVideoOn}
              disabled={spike.connecting}
            />
          </View>

          <Button
            label={spike.connecting ? "Connecting..." : "Join"}
            onPress={spike.join}
            disabled={spike.connecting}
            loading={spike.connecting}
            testID="zoom-spike-join"
          />

          {spike.status ? (
            <Text className="text-center font-sans text-xs text-danger">
              {spike.status}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ink">
      <View
        className="flex-1 flex-row flex-wrap content-center justify-center gap-2 p-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        {participants.map((userId) => (
          <View
            key={userId}
            style={{ width: basis, aspectRatio: 3 / 4 }}
            className="overflow-hidden rounded-xl bg-black/40"
          >
            <ZoomView
              style={styles.fill}
              userId={userId}
              fullScreen={false}
              videoAspect={VideoAspect.LetterBox}
            />
            <View className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-1">
              <Text className="font-sans text-xs text-ink-inverse">
                {userId === spike.mySelfId ? "You" : "Participant"}
              </Text>
            </View>
          </View>
        ))}

        {participants.length === 1 && (
          <View className="absolute inset-x-0 bottom-24 items-center px-6">
            <Text className="font-sans text-sm text-ink-inverse/70">
              Waiting for other participants...
            </Text>
          </View>
        )}
      </View>

      {spike.status ? (
        <View
          className="absolute inset-x-4 rounded-lg bg-black/70 px-3 py-2"
          style={{ top: insets.top + 8 }}
        >
          <Text className="font-sans text-xs text-ink-inverse" numberOfLines={2}>
            {spike.status}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => setDetailsOpen((open) => !open)}
        className="absolute right-4 h-9 w-9 items-center justify-center rounded-full bg-black/50"
        style={{ top: insets.top + 8 }}
        accessibilityRole="button"
        accessibilityLabel="Toggle diagnostics panel"
      >
        <Text className="font-semibold text-ink-inverse">i</Text>
      </Pressable>

      {detailsOpen && (
        <ScrollView
          className="absolute inset-x-4 top-20 max-h-80 rounded-xl bg-black/85 p-4"
          contentContainerClassName="gap-3"
        >
          <View className="gap-1.5">
            <Text className="font-medium text-sm text-ink-inverse">Cameras</Text>
            {spike.cameraList.map((camera) => (
              <Text key={camera.deviceId} className="font-sans text-xs text-ink-inverse/70">
                {camera.isSelectedDevice ? "-> " : "   "}
                {camera.deviceName}
                {camera.isSelectedDevice ? " [active]" : ""}
              </Text>
            ))}
          </View>

          {/*
            Live transcription removed from the UI: canStartLiveTranscription()
            reliably returns false on this account — it is a paid Zoom add-on
            that is not enabled, not a bug. See teste_zoom_rn.md, finding #6
            under "Tabela de testes" / T5. The hook still implements the full
            flow (useZoomSpike: canTranscribe, languages, messages,
            startTranscription) as a reference once the add-on is enabled.
          */}
        </ScrollView>
      )}

      <View
        className="flex-row items-center justify-center gap-4 px-6 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={spike.switchCamera}
          disabled={spike.cameraBusy}
          className="h-14 w-14 items-center justify-center rounded-full bg-white/15"
          accessibilityRole="button"
          accessibilityLabel="Switch camera"
          testID="zoom-spike-switch-camera"
        >
          <Text className="font-semibold text-base text-ink-inverse">
            {spike.cameraBusy ? "..." : "⟲"}
          </Text>
        </Pressable>

        <Pressable
          onPress={spike.leave}
          className="h-14 w-14 items-center justify-center rounded-full bg-danger"
          accessibilityRole="button"
          accessibilityLabel="Leave call"
          testID="zoom-spike-leave"
        >
          <Text className="font-semibold text-base text-ink-inverse">End</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
