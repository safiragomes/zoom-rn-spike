/**
 * ⚠️ EXAMPLE — delete the whole `src/features/example/` folder when starting a
 * real project.
 *
 * The feature's component: it only renders. All state comes from the hook, and
 * every color comes from utility classes fed by the tokens (rule R6).
 */
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/shared/components";
import { truncate } from "@/shared/utils";

import { usePost } from "../hooks/use-post";

export function ExampleScreen() {
  const insets = useSafeAreaInsets();
  const { post, loading, error, reload } = usePost(1);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="grow justify-center gap-4 p-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Text className="font-semibold text-2xl text-ink">
        Boilerplate Mobile
      </Text>
      <Text className="font-sans text-base text-ink-muted">
        This screen demonstrates the architecture: the route holds no logic, the
        component only draws, the hook owns the state, and the service talks to
        the API.
      </Text>

      <View className="rounded-lg bg-surface p-4" testID="example-card">
        {loading ? (
          <ActivityIndicator testID="example-loading" />
        ) : error ? (
          <View className="gap-3">
            <Text className="font-sans text-base text-danger">{error}</Text>
            <Button
              label="Try again"
              variant="secondary"
              onPress={reload}
              testID="example-retry"
            />
          </View>
        ) : (
          <View className="gap-2">
            <Text className="font-medium text-lg text-ink">
              {truncate(post?.title ?? "", 40)}
            </Text>
            <Text className="font-sans text-sm text-ink-muted">
              {post?.body}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
