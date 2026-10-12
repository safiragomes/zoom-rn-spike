# <Project name>

> ⚠️ **This README is a skeleton.** It came from the CITi mobile boilerplate.
> Fill it in with your project's information and delete this note — see
> [SETUP.md](SETUP.md) for the full day-one checklist.

<One sentence: what this app does and for whom.>

## Stack

| Layer   | Choice                                            |
| ------- | ------------------------------------------------- |
| Runtime | Expo SDK 57 · React Native 0.86 · React 19        |
| Routing | expo-router (file-based, `src/app/`)              |
| Styling | NativeWind 4 (Tailwind 3) with tokens             |
| Tests   | Jest (jest-expo) + Testing Library                |
| Quality | ESLint flat config + Prettier + TypeScript strict |
| Package | pnpm (pinned) · Node 24 LTS (pinned via `.nvmrc`) |

## Getting started

Requires Node 24 LTS (`nvm use`) and pnpm through Corepack. Do **not** swap the
package manager: `pnpm-lock.yaml` is the versioned lockfile and CI installs with
`--frozen-lockfile`.

```bash
corepack enable
pnpm install
pnpm start        # then press `a` for Android or `w` for web
```

| Command              | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm start`         | Expo dev server                                                     |
| `pnpm android`       | opens on a connected device or emulator                             |
| `pnpm web`           | opens in the browser                                                |
| `pnpm lint`          | ESLint, zero warnings tolerated                                     |
| `pnpm typecheck`     | `tsc --noEmit`                                                      |
| `pnpm test`          | Jest                                                                |
| `pnpm test:coverage` | Jest with the coverage gate                                         |
| `pnpm test:tooling`  | `node --test` suites for the repository scripts                     |
| `pnpm spec:validate` | strict OpenSpec validation                                          |
| `pnpm skills:check`  | checks that Claude Code and Codex can discover every agent skill    |
| `pnpm skills:sync`   | regenerates the Claude Code skills mirror                           |
| `pnpm verify`        | typecheck, lint, test, tooling tests, OpenSpec, and skills together |
| `pnpm build`         | `expo export` — bundles for Android, iOS, and web into `dist/`      |
| `pnpm run doctor`    | `expo-doctor` — checks the SDK dependency set                       |
| `pnpm format`        | Prettier, writing in place                                          |
| `pnpm format:check`  | Prettier, checking only                                             |

Before opening a PR, run `pnpm format:check`, `pnpm verify`, and
`pnpm test:coverage` — plus `pnpm build` and `pnpm run doctor` when dependencies
or `app.json` change. Use `pnpm run doctor`: a bare `pnpm doctor` runs pnpm's
built-in command instead.

### iOS

iOS is not verifiable on Windows. The local matrix is Android + web; iOS needs an
EAS Build or a pairing session on a macOS machine.

## Environment

Copy the example and fill it in:

```bash
cp .env.example .env
```

`.env` is not versioned; [`.env.example`](.env.example) is, and it lists every
variable the app reads. They are read through
[`src/config/env.ts`](src/config/env.ts) — the only place allowed to touch
`process.env`, so declare a new variable there too or the rest of the codebase
never sees it.

Only `EXPO_PUBLIC_*` variables reach the bundle, and they are inlined into it at
build time: they are **public by definition**. Never put a secret there.

## AI-assisted workflow

Work starts as an OpenSpec change in `openspec/changes/`, its scenarios become
tests in a Red → Green → Refactor cycle, and the change closes with a summary in
`docs/changes/` and, when warranted, an ADR in `docs/adr/`. The CITi agent
skills in `.agents/skills/` run each step in Claude Code (`/citi-playbook`) and
Codex (`$citi-playbook`). The rules live in [AGENTS.md](AGENTS.md); the setup is
in [CONTRIBUTING.md](CONTRIBUTING.md).

## Architecture

Code is organized by feature, and the boundaries are enforced by the linter, not
by convention alone.

```
src/app/        routes and layouts — no logic
src/features/   domain modules, isolated from each other
src/shared/     reusable components, hooks and utils
src/services/   http and storage — the boundary with the outside world
```

- [Architecture overview](docs/architecture/overview.md) — the layers and the seven rules
- [Folder structure](docs/architecture/folder-structure.md)
- [Decisions](docs/architecture/decisions.md) — why the stack looks like this
- [Testing conventions](docs/conventions/testing.md)
- [OpenSpec config](openspec/config.yaml) — context and rules for specifications
- [ADRs](docs/adr/README.md) and [change summaries](docs/changes/README.md)
- [Future improvements](docs/future-improvements.md) — deliberately deferred work
- [AGENTS.md](AGENTS.md) — the rules AI agents follow
- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, branches, and gates

## Contributing

Branch off `develop`, open a PR against it, and keep the checks green — CI runs
formatting, lint, typecheck, OpenSpec, skills, tests with coverage, the bundle
export, the audit, and `expo-doctor` on every push and pull request. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

See [LICENSE](LICENSE).
