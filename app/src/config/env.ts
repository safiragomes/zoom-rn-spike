/**
 * Typed, centralized environment configuration.
 *
 * Variables prefixed with `EXPO_PUBLIC_` are inlined at build time and readable
 * inside the bundle: they are public by definition. Never put a secret here —
 * API keys, tokens and credentials belong on the backend.
 *
 * Declare the values in `.env` (not versioned) or in the EAS Build variables.
 */

export type Environment = "development" | "staging" | "production";

export type Env = {
  apiBaseUrl: string;
  environment: Environment;
  isProduction: boolean;
  /** Spike only: local Node server that issues Zoom session tokens and
   * receives transcription messages. Delete alongside `src/features/zoom-spike/`. */
  spikeServerUrl: string;
};

/**
 * Use this when a variable is genuinely required. The boilerplate does not use
 * it by default so the app can boot with no `.env` at all — swap the fallbacks
 * below for `required()` as soon as the project has a real API.
 */
export function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Define it in .env or in the EAS Build variables.`,
    );
  }
  return value;
}

const environment = (process.env.EXPO_PUBLIC_ENV ??
  "development") as Environment;

export const env: Env = {
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_URL ?? "https://jsonplaceholder.typicode.com",
  environment,
  isProduction: environment === "production",
  spikeServerUrl:
    process.env.EXPO_PUBLIC_SPIKE_SERVER_URL ?? "http://localhost:3002",
};
