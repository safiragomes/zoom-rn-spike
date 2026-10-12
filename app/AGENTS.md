# Repository instructions

Context for AI agents working in this repository. Read it before writing code.

## Language and collaboration

- Communicate with users, developers, and stakeholders in Brazilian Portuguese: questions, phase explanations, progress reports, and reviews.
- Keep repository code, comments, documentation, specifications, errors, test names, and commit messages in English.

## Repository conventions

- This is an Expo / React Native **template consumed by other projects**, not an app. A defect here ships once per derived project, so prefer the conservative option.
- Stack: Expo SDK 57, React Native 0.86, React 19, expo-router, NativeWind 4 on Tailwind 3, Jest (jest-expo) with React Native Testing Library, TypeScript strict.
- Use Node.js 24 (`.nvmrc`) and pnpm 10.24.0 through Corepack. Do not replace the package manager or `pnpm-lock.yaml`.
- Pin every dependency exactly — never `^` or `~` (D8). Add or upgrade a native dependency with `pnpm exec expo install`, never `pnpm add pkg@latest`; the newest version on npm is often outside the SDK matrix.
- Three holds look like oversights and are not: Tailwind stays on 3 (D1), TypeScript stays below 6.1 (D4), ESLint stays on 9 (D5). Read `docs/architecture/decisions.md` before proposing to lift one.
- Layout: `src/app` routes, `src/features` domain modules, `src/shared` reusable code, `src/services` the boundary with the outside world, `src/providers` the provider tree, `src/config` typed env, `src/styles` design tokens, `test/` Jest setup and shared mocks.
- Aliases `@/*`, `@/assets/*`, and `@test/*` must agree in `tsconfig.json` and `jest.config.js`.
- **Barrel files are required here.** Every feature exposes its public API through `index.ts` (R3). This is this repository's decision (D18); the CITi web boilerplates forbid barrels. Do not "fix" one convention into the other.
- `src/features/example/` is a disposable reference. Deleting it and pointing `src/app/index.tsx` at another screen must not break lint, typecheck, or tests; do not add real code to it.
- Keep the checkout outside OneDrive-synced folders and away from paths with spaces or accents: `pnpm install` and Metro's file watching fail there.
- iOS cannot be verified on Windows; the local matrix is Android and web.

## Architecture rules (R1–R7)

ESLint enforces most of these; do not work around them.

- **R1** — `src/app/` declares routes and layouts only; screens live in `src/features/`.
- **R2** — a feature never imports another feature; shared code moves to `src/shared/`.
- **R3** — a feature is imported only through its `index.ts`, never through an internal path.
- **R4** — `src/shared/` and `src/services/` never import from `src/features/`.
- **R5** — only `src/services/http/` calls `fetch`.
- **R6** — colors, fonts, and radii come from `src/styles/tokens.json`; no literal hex values.
- **R7** — every module under `src/features/` ships with a `__tests__/` folder.

Full text, enforcement, and rationale: `docs/architecture/overview.md`.

## Mobile and security boundaries

- Every `EXPO_PUBLIC_*` value is public: it is inlined into the bundle and readable from the installed app. Never put a secret, token, or private key in `.env`, `src/config/env.ts`, or the source.
- Read environment values only through `src/config/env.ts`, and list every variable in `.env.example`.
- A change to `app.json`, a config plugin, a permission, or a native dependency requires a new native build; it cannot ship as a JavaScript-only update. Say so in the proposal and the pull request.
- Every new permission carries the user-facing text that explains why the app needs it.

## OpenSpec and documentation

- `openspec/` holds the executable business specifications; `docs/` holds change summaries and architectural decisions.
- Every feature, behavior change, or relevant technical decision starts with an OpenSpec change in `openspec/changes/<change-id>/`.
- Group `openspec/specs/` and `openspec/changes/` by business capability, reusing the feature name under `src/features/<feature>` when one exists — never by route, screen, component, or hook.
- Run `pnpm exec openspec instructions` before creating or updating each OpenSpec artifact.
- Before archiving a change, create or update `docs/changes/<change-id>.md` from `docs/templates/change.md`.
- Create an ADR in `docs/adr/`, from `docs/templates/adr.md` and following `docs/adr/README.md`, for a cross-cutting, hard-to-reverse, or trade-off-heavy decision. Local, reversible work without a real trade-off gets `Not applicable` and the rationale in the change summary instead.
- Archive only after tests, typecheck, lint, and `pnpm spec:validate` pass.
- Ask for explicit confirmation immediately before moving a change to the archive. Earlier confirmations about validation warnings or spec synchronization do not count.
- Keep every mandatory template section; write `Not applicable` with a reason when one does not apply.

## SDD (Specification-Driven Development) Flow

- Read the current OpenSpec artifacts for the affected capability before proposing or writing code.
- Production code and automated tests map directly to the requirements, invariants, and scenarios in the specification.
- When development reveals an ambiguity, a missing edge case, or a technical constraint, stop coding and update the specification first.
- The specification is the source of truth; the code implements it.

## TDD (Test-Driven Development) Flow

- Work in a strict Red → Green → Refactor cycle.
- Never move from Red to Green, or from Green to Refactor, without explicit confirmation from the user.
- Before asking for that confirmation, explain in Brazilian Portuguese everything the next phase will change.
- **Red:** write the tests first with Jest and React Native Testing Library, rendering through `@test/render`. Simulate the network with `@test/mocks/http` — never stub `httpClient` and never mock the unit under test. Run the narrowest command, `pnpm test -- <path> -t "<name>"`, and confirm it fails on the assertion.
- **Green:** write the minimum production code that makes the failing test pass.
- **Refactor:** improve structure without changing behavior; the same tests stay green throughout.
- No production code exists without a test that requires it.
- Fake only external boundaries (`fetch`, timers, native modules, device APIs) and only when strictly necessary. Shared fakes live in `test/`.

## Architecture & Testability

- A screen component renders and forwards user intent; it holds no data-fetching logic.
- A feature hook orchestrates state: loading, success, error, and retry.
- A feature service calls `httpClient` from `@/services/http` and translates the response; it never calls `fetch` directly (R5).
- Tests fake at the boundary — `fetch` through `@test/mocks/http`, native modules through `test/setup.ts` — so the service's URL building and the client's error mapping stay under test.

## Verification

- While developing, run the narrowest relevant test first.
- Before handing off, run `pnpm format:check`, `pnpm verify`, and `pnpm test:coverage`.
- Run `pnpm build` (`expo export` for Android, iOS, and web) when Metro or Babel config, assets, routes, `app.json`, or dependencies change.
- Run `pnpm run doctor` when dependencies or `app.json` change. Always `pnpm run doctor`: a bare `pnpm doctor` runs pnpm's own built-in command instead of expo-doctor.
- Check user-visible changes by hand on Android and web, on at least two screen sizes.
- Keep the pre-commit hook fast; the full gates belong in CI.

## Agent skills

- `.agents/skills/citi-*` holds the CITi workflow skills and is their single source. Codex reads it directly; Claude Code only discovers skills under `.claude/skills/`.
- `.claude/skills/citi-*` is a generated, git-ignored mirror. `pnpm install` regenerates it through `prepare`. Edit the source, then run `pnpm skills:sync` — never edit the mirror.
- `openspec-*` skills in both trees are generated by the OpenSpec CLI. Regenerate with `pnpm exec openspec init --tools claude,codex`; never edit them by hand.
- Use `citi-playbook` to route, `citi-task-spec` to bound a demand, `citi-tdd-cycle` to implement, `citi-verify-scope` to pick and run gates, `citi-close-change` to write the change summary and evaluate an ADR, `citi-review-change` to review, and `citi-prepare-pr` to write the pull request.
- Skills cite the rules in this file and in `openspec/config.yaml`; they do not restate them. `pnpm skills:check` fails when a rule is copied instead of cited.

## Code Review Rules

- Flag secrets, tokens, credentials, or personal data in `EXPO_PUBLIC_*` values, `.env.example`, source code, or logs.
- Flag `fetch` called outside `src/services/http/` (R5).
- Flag a feature importing another feature, a deep import into a feature's internals, or `src/shared`/`src/services` importing from `src/features` (R2–R4).
- Flag logic in `src/app/` beyond layout and navigation (R1).
- Flag literal colors, font families, or radii instead of tokens from `src/styles/tokens.json` (R6).
- Flag a feature module without tests under `__tests__/` (R7).
- Flag a native dependency added without `pnpm exec expo install`, or with a `^`/`~` range.
- Flag a change to `app.json`, a config plugin, or a permission that does not declare the new native build, or a permission without its usage text.
- Flag a screen without loading, error, and empty states where data is fetched, or interactive elements without `accessibilityRole` and `accessibilityLabel`.
- Flag a screen that ignores safe-area insets under the edge-to-edge layout (D10).
- Flag repository scripts that delete or overwrite paths before validating every expected marker and target.
- Flag ADRs created for local, reversible changes, and cross-cutting or hard-to-reverse decisions shipped without one.
