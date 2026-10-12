const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

/**
 * The boundary rules below implement R2–R6 from docs/architecture/overview.md.
 *
 * They use the core `no-restricted-imports` rule instead of a boundaries
 * plugin: fewer dependencies to maintain, and the same expressive power thanks
 * to flat config's per-`files` scoping.
 */

const DEEP_IMPORT = {
  group: ["@/features/*/*"],
  message:
    "R3: import a feature through its index (@/features/x), never an internal file.",
};

const CROSS_FEATURE = {
  group: ["@/features/*"],
  message:
    "R2: a feature must not import another feature. If the code is shared, move it to @/shared.",
};

const SHARED_TO_FEATURE = {
  group: ["@/features/*", "@/features/*/*"],
  message:
    "R4: the dependency is one-way — @/shared and @/services never import from @/features.",
};

module.exports = [
  ...expoConfig,
  prettierConfig,

  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "dist/**",
      "coverage/**",
      "example/**",
      "expo-env.d.ts",
      "nativewind-env.d.ts",
    ],
  },

  // R3 — applies to the whole project.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [DEEP_IMPORT] }],
    },
  },

  // R2 — inside features, cross-imports are forbidden.
  // DEEP_IMPORT has to be repeated: in flat config a later block replaces the
  // rule's entire configuration instead of merging into it. Without repeating,
  // `@/features/other/hooks/x` would slip through — `*` does not cross a slash.
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [CROSS_FEATURE, DEEP_IMPORT] },
      ],
    },
  },

  // R4 — cross-cutting layers know nothing about features.
  {
    files: ["src/shared/**/*.{ts,tsx}", "src/services/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [SHARED_TO_FEATURE] }],
    },
  },

  // R5 — raw `fetch` only in the HTTP client. Feature services go through the
  // client, which is the single place holding interceptors and error mapping.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/services/http/**"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "R5: use the client from @/services/http instead of raw fetch — it owns base URL, timeout and errors.",
        },
      ],
    },
  },

  // The routing folder declares navigation, not business logic (R1).
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "max-lines": [
        "warn",
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
    },
  },

  // Repository tooling runs on Node as ES modules, outside the app bundle.
  // `nodeBuiltin`, not `node`: ESM has no `require` or `__dirname`. Scoped to
  // these paths so the app code under src/ never sees Node globals.
  {
    files: ["scripts/**/*.mjs", "tests/tooling/**/*.mjs", "*.config.mjs"],
    languageOptions: {
      sourceType: "module",
      globals: globals.nodeBuiltin,
    },
  },

  // Tests may cross the boundaries in order to build scenarios.
  {
    files: ["**/__tests__/**", "test/**", "**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
      "no-restricted-globals": "off",
    },
  },
];
