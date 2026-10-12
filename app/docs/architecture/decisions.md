# Decisions

This records the **why** — the what is already visible in the code. The value
shows up months later, when someone (or an AI agent) considers undoing a choice
without knowing the constraint behind it.

Every entry carries the trigger that makes it worth revisiting. A decision with
no trigger freezes.

## D1 — Tailwind 3, not 4

Stable NativeWind is `4.2.6`; the line that tracks Tailwind 4 exists only as
`5.0.0-preview.*`. You do not pour a foundation on a pre-release, and here the
foundation is literal — every derived project inherits the choice.

**Trigger:** NativeWind 5 goes stable.

## D2 — One styling system: NativeWind

`styled-components` was removed. Tokens live in `src/styles/tokens.json`,
consumed by `tailwind.config.js` (build time) and by `src/styles/tokens.ts`
(runtime).

A boilerplate teaches by example. Offering two systems means every derived
project picks one — or worse, mixes both.

## D3 — Feature-based architecture with a thin `app/`

Domain code in `src/features/`, cross-cutting code in `src/shared/`, routing in
`src/app/`. This is the shape that survives growth under expo-router; purely
horizontal layers turn into junk drawers. See [overview.md](overview.md).

## D4 — TypeScript held below 6.1

`typescript-eslint@8.67.0` declares `peerDependencies.typescript: ">=4.8.4
<6.1.0"`. TypeScript 7 is already published, but moving now trades a marginal
gain for **broken linting in every derived project**. Current pin: `6.0.3`.

**Trigger:** typescript-eslint widens its peer range to TS 7.

## D5 — ESLint flat config, on major 9

Flat config is mandatory from ESLint 10 on, and it is already the format here:
`eslint.config.js` on top of `eslint-config-expo/flat` + `eslint-config-prettier`.

The major was **not** raised to 10, and this was verified rather than assumed.
Both `eslint-plugin-import` and `eslint-plugin-react` — dependencies of
`eslint-config-expo` — cap `peerDependencies.eslint` at `^9`. Installing ESLint
10 does not merely warn: `pnpm lint` crashes before linting a single file.

```
TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function
```

**Trigger:** `eslint-config-expo` ships plugins that accept ESLint 10.

## D6 — pnpm and Node pinned

`packageManager: "pnpm@10.24.0"` plus a `.nvmrc` on Node 24 LTS. This makes CI
and every developer machine run the same thing instead of depending on whatever
each environment happens to have.

## D7 — pnpm with `node-linker=hoisted`

React Native assumes a flat `node_modules`. pnpm's default isolated layout breaks
the resolution of Babel plugins used by React Native's Jest preset
(`@babel/plugin-transform-react-jsx` is declared by nobody — it is resolved by
hoisting), and the same applies to native autolinking and to Metro.

We keep pnpm for the lockfile and the speed, with a flat layout. It is set in
`.npmrc`.

## D8 — Exact version pins

No dependency uses `^` or `~`. With ranges, two projects created months apart are
born with different dependency trees — and only one of them was ever tested by a
human.

The trade-off is a real cost: **without a review at every SDK release the
boilerplate freezes**. The `expo-doctor` job in CI makes that aging visible
instead of silent. If nobody owns the maintenance, the honest move is to revert
this decision and go back to ranges, not to pretend the ritual happens.

**Trigger:** every Expo SDK release.

## D9 — Documentation split by audience

The root `README.md` is the skeleton for the **derived project's** README, not
for the template. Meta-documentation about the boilerplate lives in `docs/`, and
`SETUP.md` says what to delete.

Without that split, every derived project is born carrying the template's
documentation, nobody cleans it up, and six months later the README describes a
project that does not exist.

## D10 — Edge-to-edge on Android

Content draws behind the system bars; screens respect the edges through
`useSafeAreaInsets()`. To opt out globally, wrap the children in `<SafeAreaView>`
— the comment in `src/providers/app-providers.tsx` marks the spot.

`SystemUI.setBackgroundColorAsync` paints the native window background: without
it, Android flashes white between the splash screen and the first frame.

## D11 — SVG as a React component

`react-native-svg-transformer` in `metro.config.js`, with `svg` leaving
`assetExts` and entering `sourceExts`. Without swapping both lists, Metro treats
the file as a binary asset and the import fails at runtime rather than at build
time.

## D12 — Splash and icons through the plugin

`expo-splash-screen` is configured as a plugin in `app.json`, not through the
legacy top-level `splash` key. `SplashScreen.preventAutoHideAsync()` sits in
`src/providers/app-providers.tsx`, next to the font loading that decides when to
hide it.

## D13 — OpenSpec reserved, not adopted

**Status: superseded by [D16](#d16--openspec-and-the-citi-sddtdd-flow-adopted).**

A `specs/` folder under `docs/` reserved the format and entry point for specifications,
but the SDD flow had not been rolled out. Reserving the slot cost nothing and
kept the first spec from being written in some random corner; adopting the
tooling before there was anything to specify would have been empty ceremony.

## D14 — Jest held on 29, pnpm on 10

Neither is an oversight, and both look like one to a version bump.

`jest-expo@57` depends internally on the Jest 29 line — `@jest/globals`,
`babel-jest`, `jest-snapshot` and `jest-environment-jsdom` are all `^29.2.1`.
Installing `jest@30` mixes two majors of the same test runner in one tree, which
fails in ways that look like flaky tests rather than a version conflict.

`packageManager` pins `pnpm@10.24.0`. pnpm 11 is a major and CI resolves the
version from this field (D6), so bumping it changes every machine at once.

**Trigger:** `jest-expo` moves its internal deps to the Jest 30 line; for pnpm,
a deliberate upgrade window, not a drive-by.

## D15 — Ignore patterns for `example` are anchored

`.gitignore` and `.prettierignore` carry `/example`, with the leading slash. A
bare `example` is a gitignore _pattern_, not a path: it matches at any depth and
silently swallowed `src/features/example/` — the reference feature the whole
architecture documentation teaches from.

It was invisible locally, because the files exist on disk. It surfaced only when
a clean clone was simulated: 58 files instead of 66, `pnpm lint` and
`pnpm typecheck` failing on an unresolvable `@/features/example`, and 26 tests
instead of 36.

**Trigger:** none — do not un-anchor these. If you add an ignore rule meant for
the repository root, anchor it the same way.

## D16 — OpenSpec and the CITi SDD/TDD flow adopted

Supersedes D13. The boilerplate now follows the same flow as the CITi web and
backend boilerplates: every behavior change starts as an OpenSpec change in
`openspec/changes/`, its scenarios become tests in a Red → Green → Refactor
cycle, and the change closes with `docs/changes/<change-id>.md` and, when a
trigger fires, an ADR in `docs/adr/`. D13's reserved folder was removed: two
homes for specifications means neither is trusted.

`@fission-ai/openspec` is pinned to `1.9.0`, the version the other boilerplates
use. A newer CLI regenerates the `openspec-*` skills in a different format, so
the upgrade has to happen in all four repositories at once. `openspec/config.yaml`
carries the mobile context and rules; `AGENTS.md` carries the flow.

**Trigger:** a deliberate OpenSpec CLI upgrade across the CITi boilerplates.

## D17 — Agent skills in `.agents/skills`, with a generated Claude Code mirror

`.agents/skills/citi-*` is the single source of the CITi workflow skills, and
the files are identical, byte for byte, in the four CITi boilerplates. Codex
reads that folder; Claude Code only discovers `.claude/skills/`, so
`scripts/check-agent-skills.mjs --sync` mirrors each skill there — by symlink,
or by copy where the filesystem refuses symlinks — and `prepare` reruns it on
every install. The mirror is git-ignored; versioning it broke on Windows
checkouts without symlink support.

The skills read each repository's own files (`AGENTS.md`, `CONTRIBUTING.md`,
`package.json`, the CI workflow) instead of hardcoding a stack, which is what
lets a mobile, a web, and a backend repository share them. `pnpm skills:check`
fails when a skill copies a rule from `AGENTS.md` instead of citing it.

**Trigger:** a skill that cannot be written without stack-specific instructions,
which would justify a per-repository fork.

## D18 — Barrel files kept, unlike the web boilerplates

The CITi web boilerplates forbid barrel files and enforce boundaries with
`eslint-plugin-boundaries`. This repository keeps rule R3 — a feature is
imported only through its `index.ts` — and enforces it with the core
`no-restricted-imports` rule.

The barrel is the feature's public API: it is what makes R2 and R3 checkable
with a path pattern, and what lets `src/features/example/` be deleted as a unit.
The cost the web boilerplates avoid — bundle size and circular imports through
re-exports — is smaller here, where Metro bundles per platform and features stay
small. Aligning would mean rewriting every import and the ESLint config, with no
defect pushing for it.

**Trigger:** a measured cost from barrels (circular-import crashes, Metro bundle
size, or test start-up time), or a decision to unify the architecture across
all CITi boilerplates.

## D19 — CI shape for a mobile app

CI runs two jobs. `quality` follows the web boilerplates' order — format, lint,
types, OpenSpec, skills, tooling tests, coverage — then exports the bundles with
`pnpm build` (`expo export` for Android, iOS, and web; about 40 seconds
locally) and audits dependencies. `doctor` runs `pnpm run doctor`
(expo-doctor) as the aging alarm for exact pins (D8). Actions are pinned by
commit SHA, permissions are read-only, and a weekly run catches drift with no
commits.

There is no end-to-end job and no container job. Mobile end-to-end needs an
emulator in CI, which costs far more than a browser run; and an app is not
shipped as a container. Both are in `docs/future-improvements.md`.

Two traps shaped the details. `pnpm doctor` is a built-in pnpm command that
shadows the script — the earlier CI job ran it and checked nothing — so the
workflow and the documentation always say `pnpm run doctor`. And
`pnpm audit` runs at `--audit-level critical`: at the time of writing, the
high-severity advisories are all transitive dependencies locked by the Expo SDK,
React Native, ESLint, and Jest (`@xmldom/xmldom`, `node-forge`, `image-size`,
`svgo`, `js-yaml`, `brace-expansion`), one without any fixed release. No
overrides were added: forcing versions under the SDK is exactly what D8 avoids.

**Trigger:** an SDK release that clears the high advisories (raise the audit
back to `high`); a mobile end-to-end runner adopted (add the job).

## D20 — Repository tooling tested with `node --test`

`scripts/*.mjs` are ES modules run by Node, and their tests live in
`tests/tooling/*.test.mjs`, run by `pnpm test:tooling` with `node:test` and
`node:assert/strict`. Jest stays dedicated to the app: making it transform
`.mjs` under `jest-expo` needs extra Babel configuration for code that never
reaches the bundle. Jest does not collect these files, because its test pattern
does not match `.mjs`.

The suite for `check-agent-skills.mjs` is a port of the web boilerplates'
Vitest suite — same names, same scenarios — so the two can be compared.

**Trigger:** tooling tests that need mocking or snapshot features `node:test`
lacks.
