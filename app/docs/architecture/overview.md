# Architecture overview

This is the document referenced by `eslint.config.js`. It describes the layers
and the seven rules the linter enforces.

## The principle

A standard that no tool verifies is a suggestion, not a standard. Every rule
below ships with the mechanism that makes it hold — that is what the
"enforcement" column is for, and it is not optional.

## The layers

Dependencies always flow downward. Nothing looks back up.

```
src/app/          expo-router routes and layouts — no logic
   ↓
src/features/     domain modules, isolated from each other
   ↓
src/shared/       reusable components, hooks, utils and types
   ↓
src/services/     http, storage — the boundary with the outside world
   ↓
src/config/       typed env, feature flags
```

Outside the flow, cutting across it:

| Folder           | Role                                                    |
| ---------------- | ------------------------------------------------------- |
| `src/providers/` | contexts and the composition of the app's provider tree |
| `src/styles/`    | design tokens and the NativeWind global stylesheet      |
| `test/`          | Jest setup, a provider-aware `render`, and shared mocks |

### Why features instead of horizontal layers

A purely horizontal layout (`components/`, `hooks/`, `services/`) turns every
folder into a junk drawer: at 40 screens nobody knows which of the 120
components belong to checkout. Grouped by feature, deleting a domain is deleting
a folder — which is exactly why `src/features/example/` can be removed without
breaking anything.

## The seven rules

| #   | Rule                                                                                                                                                                    | Enforcement                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| R1  | `src/app/` holds no logic. A route declares layout and navigation and renders a screen from `features/`.                                                                | `max-lines` (80) on `src/app/**` + PR review                       |
| R2  | A feature never imports another feature. Anything shared moves up to `shared/`.                                                                                         | `no-restricted-imports` on `src/features/**`                       |
| R3  | A feature is imported only through its `index.ts`. No deep imports. Barrels are required here ([D18](decisions.md#d18--barrel-files-kept-unlike-the-web-boilerplates)). | `no-restricted-imports` on `src/**`                                |
| R4  | `shared/` and `services/` never import from `features/`. The dependency is one-way.                                                                                     | `no-restricted-imports` on `src/shared/**`, `src/services/**`      |
| R5  | Network access lives in `services/`. A component never calls `fetch`.                                                                                                   | `no-restricted-globals` on `src/**`, except `src/services/http/**` |
| R6  | Color, font and radius come from the tokens. No literal hex in a component.                                                                                             | `src/styles/tokens.json` as the single source + PR review          |
| R7  | Every module under `features/` is born with a `__tests__/` folder.                                                                                                      | `coverageThreshold` in `jest.config.js`, run in CI                 |

### Proving the rules actually hold

The boundaries are not decorative — you can check them in ten seconds:

```bash
# Write a forbidden import on purpose and run the linter:
echo 'import { usePost } from "@/features/example/hooks/use-post";' >> src/shared/utils/strings.ts
pnpm lint      # must fail with the R3/R4 message
git checkout src/shared/utils/strings.ts
```

If that command passes, enforcement is broken and the standard has quietly
turned back into a suggestion.

## Where things go

| I am creating…                        | It goes in…                         |
| ------------------------------------- | ----------------------------------- |
| a new screen                          | `src/features/<domain>/components/` |
| the route pointing at it              | `src/app/`                          |
| a button used by three features       | `src/shared/components/`            |
| the domain's API call                 | `src/features/<domain>/services/`   |
| the HTTP client, interceptors, errors | `src/services/http/`                |
| a new color                           | `src/styles/tokens.json`            |
| a global provider                     | `src/providers/app-providers.tsx`   |
| an environment variable               | `src/config/env.ts`                 |

## Next

- [Folder structure](folder-structure.md) — the annotated tree
- [Decisions](decisions.md) — why each choice was made
- [Testing conventions](../conventions/testing.md)
- [OpenSpec](../../openspec/config.yaml) — specifications and the SDD/TDD flow ([D16](decisions.md#d16--openspec-and-the-citi-sddtdd-flow-adopted))
