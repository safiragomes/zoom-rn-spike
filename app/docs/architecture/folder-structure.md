# Folder structure

The full tree. Anything marked ⚠️ belongs to the template, not to your project:
[SETUP.md](../../SETUP.md) tells you to delete or replace it on day one.

```
nativewind-boilerplate/
├─ src/
│  ├─ app/                      # expo-router — ROUTES AND LAYOUTS ONLY (R1)
│  │  ├─ _layout.tsx            #   mounts the providers, renders <Slot/>
│  │  └─ index.tsx              #   the "/" route — just calls the screen
│  │
│  ├─ features/                 # domain modules, isolated from each other (R2)
│  │  └─ example/               # ⚠️ DELETE when starting your project
│  │     ├─ components/         #   what draws
│  │     ├─ hooks/              #   the screen's state
│  │     ├─ services/           #   the domain's API calls
│  │     ├─ types.ts            #   the domain's types
│  │     ├─ __tests__/          #   R7: every feature is born with tests
│  │     └─ index.ts            #   public API — the only allowed import (R3)
│  │
│  ├─ shared/                   # reusable across features
│  │  ├─ components/            #   UI primitives (Button, …)
│  │  └─ utils/                 #   pure functions
│  │
│  ├─ services/                 # the boundary with the outside world
│  │  └─ http/                  #   client, timeout, error mapping (R5)
│  │
│  ├─ providers/                # composition of the provider tree
│  ├─ config/                   # typed env, feature flags
│  └─ styles/
│     ├─ tokens.json            # ⚠️ REPLACE with your project's identity (R6)
│     ├─ tokens.ts              #   typed access to the tokens
│     └─ global.css             #   Tailwind/NativeWind directives
│
├─ assets/images/               # ⚠️ REPLACE icon, splash, adaptive-icon, favicon
│
├─ openspec/                    # specifications — the SDD flow starts here (D16)
│  ├─ config.yaml               #   project context and per-artifact rules
│  ├─ specs/                    #   current truth, one folder per capability
│  └─ changes/                  #   changes in flight; archive/ once shipped
│
├─ .agents/skills/              # CITi and OpenSpec agent skills — the source (D17)
├─ .claude/skills/              # openspec-* versioned; citi-* generated, git-ignored
├─ .github/                     # CI, pull request template, Dependabot
├─ .husky/pre-commit            # runs lint-staged on staged files
├─ scripts/                     # repository tooling (Node ESM)
│  └─ check-agent-skills.mjs    #   skills mirror sync and checks
├─ tests/tooling/               # node --test suites for scripts/ (D20)
│
├─ test/
│  ├─ setup.ts                  # global mocks for native modules
│  ├─ render.tsx                # render already wrapped in the providers
│  └─ mocks/                    # mocks shared between suites
│     └─ http.ts                #   fetch mock + response builders
│
├─ docs/
│  ├─ architecture/             # stays in the derived project
│  │  ├─ overview.md            #   layers and the seven rules
│  │  ├─ folder-structure.md    #   this file
│  │  └─ decisions.md           #   why each choice was made
│  ├─ conventions/testing.md    # where tests live, what they cover, the TDD cycle
│  ├─ adr/                      # architecture decision records and their index
│  ├─ changes/                  # one summary per OpenSpec change
│  ├─ templates/                # task, change and ADR templates
│  └─ future-improvements.md    # deliberately deferred work
│
├─ .env.example                 # the variables — copy to .env, which is ignored
├─ AGENTS.md                    # rules and flow for AI agents
├─ CLAUDE.md                    # imports AGENTS.md (`@AGENTS.md`)
├─ CONTRIBUTING.md              # setup, branches, gates for contributors
├─ README.md                    # ⚠️ skeleton for YOUR project's README
└─ SETUP.md                     # ⚠️ day-one checklist — delete when done
```

## Configuration at the root

| File                     | What it does                                                                   |
| ------------------------ | ------------------------------------------------------------------------------ |
| `app.json`               | Expo config: name, scheme, icons, plugins                                      |
| `babel.config.js`        | Expo preset with NativeWind's `jsxImportSource`                                |
| `metro.config.js`        | NativeWind + the transformer that turns SVG into a component                   |
| `tailwind.config.js`     | reads `src/styles/tokens.json` — never duplicate values here                   |
| `eslint.config.js`       | flat config; where rules R2–R5 are encoded                                     |
| `lint-staged.config.mjs` | what the pre-commit hook runs on staged files                                  |
| `jest.config.js`         | `jest-expo` preset, aliases and the coverage threshold                         |
| `tsconfig.json`          | `strict: true` and the `@/*`, `@/assets/*`, `@test/*` aliases                  |
| `.nvmrc`                 | Node version — read by CI and by `nvm use`                                     |
| `.npmrc`                 | `node-linker=hoisted`; see [D7](decisions.md#d7--pnpm-with-node-linkerhoisted) |
| `openspec/config.yaml`   | OpenSpec context and rules for proposals, specs, design and tasks              |

## The three aliases

They must agree in **three** places — `tsconfig.json`, `jest.config.js`, and
Metro (through `babel-preset-expo`, which reads the tsconfig). Divergence between
them is a classic silent failure: the app compiles and the test cannot resolve
the module, or the other way around.

| Alias        | Points to  |
| ------------ | ---------- |
| `@/*`        | `src/*`    |
| `@/assets/*` | `assets/*` |
| `@test/*`    | `test/*`   |
