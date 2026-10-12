# Contributing

Thank you for improving the CITi mobile boilerplate. Keep changes reusable,
focused, and independent of product-specific assumptions: every derived project
inherits what lands here.

## Requirements

- Node.js 24 (`nvm use` reads `.nvmrc`)
- pnpm 10.24.0, through Corepack (`corepack enable`)
- Git
- An Android emulator or device, or a browser, to check user-visible changes
- A path outside OneDrive-synced folders, without spaces or accents

## Package manager

This repository uses pnpm, pinned in the `packageManager` field. Run
`corepack enable` once; Corepack then resolves the exact pinned version, so
there is no global pnpm to keep in sync. The `preinstall` script refuses any
other package manager, `engine-strict=true` refuses another Node major, and
`pnpm-lock.yaml` is the only lockfile.

pnpm stays on 10 and installs a flat `node_modules` (`node-linker=hoisted` in
`.npmrc`), because React Native, Metro, and the Jest preset resolve packages by
hoisting. See D7 and D14 in `docs/architecture/decisions.md`.

Dependencies are pinned exactly — no `^`, no `~` (D8). Add or upgrade anything
native with `pnpm exec expo install <package>`, which resolves the version the
installed Expo SDK expects, and then make sure the written version is exact.
Upgrade the SDK as a whole with `pnpm exec expo install --fix`, never one
package at a time.

## Local setup

```bash
git clone <repository-url>
cd nativewind-boilerplate
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm start        # then `a` for Android or `w` for web
```

`pnpm install` also installs the Git hooks and regenerates the Claude Code
skills mirror through `prepare`.

## Agent skills

The development flow is available as agent skills, which run the same steps and
read this repository's own rules instead of restating them: `citi-playbook`
routes, `citi-task-spec` bounds the demand, `openspec-propose` creates the
planning artifacts, `citi-tdd-cycle` implements, `citi-verify-scope` runs the
right gates, `citi-close-change` writes the change summary and evaluates the
ADR, `citi-review-change` reviews, `citi-prepare-pr` writes the pull request,
and `openspec-archive-change` archives. They work in Claude Code (`/name`) and
in Codex (`$name`).

The skills live in `.agents/skills/`; `.claude/skills/` mirrors them for Claude
Code. After editing one, run `pnpm skills:sync`. When regenerating the
OpenSpec skills, always pass both targets — the selection is stored in a global
profile, so omitting one produces a different tree for the next person:

```bash
pnpm exec openspec init --tools claude,codex
```

`pnpm skills:check` verifies that both agents can discover every skill; it is
part of `pnpm verify`.

The `citi-*` skills are shared, byte for byte, with the CITi web and backend
boilerplates. Change them in a way that holds for every repository, and
propagate the change to all of them.

## Branches and commits

The integration branch is `develop`. Create a focused branch from `develop` and
open the pull request against `develop`. Keep commits small enough to review
and use Conventional Commits with a subject that explains the outcome.

Do not mix formatting-only changes, dependency upgrades, and unrelated product
behavior in the same pull request.

## Architecture

Dependencies flow in one direction:

```text
src/app → src/features → src/shared → src/services → src/config
```

- Keep routes and layouts in `src/app`, with no logic (R1).
- Keep business capabilities isolated under `src/features` (R2), each imported
  only through its `index.ts` (R3). Barrel files are required here, unlike in
  the web boilerplates (D18).
- Call `fetch` only from `src/services/http` (R5).
- Take visual values from `src/styles/tokens.json` (R6).

Read `docs/architecture/overview.md` before changing a shared convention.

## Tests

Place tests in a `__tests__` folder next to the code they cover, and render
through `@test/render`. Mock the network with `@test/mocks/http`. Tests for
repository tooling live in `tests/tooling/` and run with `node --test`. See
`docs/conventions/testing.md`.

Run the narrowest relevant test while developing:

```bash
pnpm test -- src/features/example/__tests__/use-post.test.tsx -t "refetches"
```

Before opening a pull request, run:

```bash
pnpm format:check
pnpm verify
pnpm test:coverage
```

Also run `pnpm build` when Metro or Babel config, assets, routes, `app.json`,
or dependencies change, and `pnpm run doctor` when dependencies or `app.json`
change. Use `pnpm run doctor`, not `pnpm doctor`: the latter is a built-in pnpm
command and never reaches expo-doctor.

## Documentation and environment changes

Update `.env.example` whenever a variable is added, renamed, or removed, and
declare it in `src/config/env.ts`. Never commit real credentials or a local
`.env`.

Update the README and the focused guides when behavior or contributor workflows
change. Repository documentation is written in English.

Record consequential, durable technical decisions in `docs/adr/` using the
provided template, and keep `docs/architecture/decisions.md` in sync when a
boilerplate-level decision changes.

## Pull requests

Complete the pull request template with:

- A concise problem and solution summary
- OpenSpec, TDD, and documentation evidence
- Impact, including platforms and whether a new native build is required
- Screenshots for visual changes
- The verification commands that actually ran

Keep the lockfile and documentation synchronized with the implementation. CI
must pass before merge.
