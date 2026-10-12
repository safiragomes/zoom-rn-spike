/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",

  // gesture-handler installs native bindings on mount; without this setup any
  // test that renders GestureHandlerRootView breaks.
  setupFiles: [
    "<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js",
  ],

  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],

  // These aliases must agree with tsconfig.json. Order matters:
  // "@/assets/*" is more specific and has to be evaluated before "@/*".
  moduleNameMapper: {
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/test/$1",
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**",
    "!src/styles/**",
    "!**/__tests__/**",
    "!**/index.ts",
    // Type-only files emit no code: 0% on them is noise, not risk.
    "!src/**/types.ts",
  ],

  // A floor, not a target. The policy for raising it lives in
  // docs/conventions/testing.md.
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};
