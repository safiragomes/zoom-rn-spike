# Gate vocabulary

A translation table between an abstract gate and the pnpm script that implements
it, so one workflow serves repositories with different stacks.

**This table is not a source of truth about what exists.** It only says which
script name to look for. The repository's `package.json` decides whether that
gate exists at all; `AGENTS.md` §Verification and the pull request template
decide when it applies; `.github/workflows/ci.yml` decides the order.

| Gate         | Script to look for        | What it proves                                             |
| ------------ | ------------------------- | ---------------------------------------------------------- |
| format       | `format:check`            | formatting matches Prettier                                |
| lint         | `lint`                    | lint rules, including architecture boundaries              |
| types        | `typecheck`               | the type checker is clean                                  |
| unit         | `test`                    | unit and component tests                                   |
| coverage     | `test:coverage`           | unit tests plus configured coverage thresholds             |
| spec         | `spec:validate`           | strict OpenSpec validation of every change                 |
| tooling      | `test:tooling`            | repository scripts and agent tooling                       |
| aggregate    | `verify`                  | the repository's own bundle of the above                   |
| architecture | `test:architecture`       | layer boundaries, when it is a separate script             |
| integration  | `test:integration`        | real database or cross-process flow                        |
| contract     | `openapi:check`           | the HTTP contract matches the implementation               |
| e2e          | `test:e2e`                | end-to-end user flow and accessibility (browser or device) |
| timezone     | `test:datetime-timezones` | date handling under more than one timezone                 |
| container    | `test:container`          | the production image builds and answers                    |
| build        | `build`                   | the production build succeeds                              |
| doctor       | `doctor`                  | native dependencies match the SDK matrix                   |

## Rules for using this table

- A script missing from `package.json` means the gate **does not exist here**.
  Report `Não aplicável neste repositório`. Never substitute a direct binary call
  (`pnpm exec <test-runner>`) for a missing script.
- `verify` usually already contains several gates. Read its actual definition in
  `package.json` before running its parts separately — running `typecheck` and
  then `verify` wastes a minute for nothing.
- A gate name that appears in this repository but not in this table still counts.
  Read `package.json` and the CI workflow; this table is a starting point, not a
  closed list.
- Prefer the narrowest possible command during development. `unit` accepts a file
  path and a test-name filter; use them.
