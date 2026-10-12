import { ActivityIndicator, Pressable, Text } from "react-native";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
};

// Colors come from the tokens through utility classes (R6) — no hex here.
const container: Record<ButtonVariant, string> = {
  primary: "bg-brand active:bg-brand-dark",
  secondary: "bg-surface border border-brand active:bg-background",
  ghost: "bg-transparent",
};

const label: Record<ButtonVariant, string> = {
  primary: "text-ink-inverse",
  secondary: "text-brand",
  ghost: "text-brand",
};

export function Button({
  label: text,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  testID,
}: ButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      className={`min-h-12 flex-row items-center justify-center rounded-md px-5 py-3 ${
        container[variant]
      } ${isInactive ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator testID={testID ? `${testID}-loading` : undefined} />
      ) : (
        <Text className={`font-medium text-base ${label[variant]}`}>
          {text}
        </Text>
      )}
    </Pressable>
  );
}
