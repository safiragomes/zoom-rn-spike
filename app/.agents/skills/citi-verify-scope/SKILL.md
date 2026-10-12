---
name: citi-verify-scope
description: Decide which validation gates apply to the current diff and run them in CI order, reading this repository's package.json scripts, AGENTS.md verification rules, pull request template, and CI workflow. Use before handing off work, before asking for review, before writing a change document, or when unsure whether e2e, integration, contract, or container checks apply.
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git merge-base:*), Bash(git symbolic-ref:*), Bash(git rev-parse:*), Bash(pnpm run:*), Bash(pnpm exec:*), Bash(ls:*), Bash(cat:*)
argument-hint: "[base-ref]"
---

# Verification scope

Run the gates this change actually needs, in the order CI runs them, and keep the
real output. Running too few breaks CI; running all of them every time wastes
minutes that people stop paying after the third round.

Speak Brazilian Portuguese — see `../citi-playbook/references/language.md`.

## Resolve before running anything

Four questions, four sources. Never hardcode a command.

1. **What changed?**
   `git diff --name-only <base>...HEAD` plus `git status --porcelain` for
   uncommitted work. Default base: an explicit argument wins; otherwise the
   integration branch `CONTRIBUTING.md` declares; otherwise the remote default
   branch (`git symbolic-ref --short refs/remotes/origin/HEAD`); otherwise
   `main`. Say in the report which base was used and why.

2. **Which gates exist here?**
   Read `scripts` in `package.json` against `references/gates.md`. A script that
   is not there does not exist — report `Não aplicável neste repositório` instead
   of improvising a command.

3. **When does each gate apply?**
   `AGENTS.md` §Verification is the durable source and carries the conditionals
   ("run e2e for user-visible or routing changes"). Complement it with the
   `## Verification` section of `.github/pull_request_template.md`, which lists
   the same gates as checkboxes with their own conditions. If a repository has
   neither, fall back to the CI workflow and say in your report that the
   conditionals were inferred from CI rather than declared.

4. **In which order?**
   The `run:` steps of the quality job in `.github/workflows/ci.yml`. Matching
   that order means a local failure and a CI failure look the same.

## Matching conditions to paths

The conditions are written in prose. Read them and match against the changed
paths — do not invent rules that the repository did not declare. Typical shapes:

| Condition roughly says                   | Paths that usually trigger it                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| UI, routing or navigation, accessibility | route, page and screen files, components, styles, `e2e/`                                         |
| native runtime or SDK dependency set     | `app.json`, `app.config.*`, `eas.json`, Metro or Babel config, native packages in `package.json` |
| database behavior                        | `prisma/`, migrations, repositories, database modules                                            |
| delivery or production                   | `Dockerfile`, `docker-compose.yml`, nginx config, health, build or export config                 |
| the HTTP contract                        | route handlers, controllers, request/response schemas, HTTP clients                              |
| date handling                            | modules that parse or format dates                                                               |

When a condition is genuinely ambiguous for a given path, ask — do not silently
skip a gate. Skipping is the failure mode that reaches CI.

## Announce, then run

Report in Brazilian Portuguese before executing:

- which gates will run, in order;
- which will be skipped, and the condition that excluded each one;
- which do not exist in this repository.

Cheap gates (format, lint, types, unit, spec) run straight away. **Expensive gates
— e2e, integration, container, and full build — require confirmation first**,
because they cost minutes and often need Docker, a database, a device or
emulator, or the network.

## Running

- Run in CI order. Stop at the first failure: later gates rarely add information
  and the person wants to fix this one.
- Read the definition of `verify` in `package.json` before running its parts
  separately. It usually already bundles typecheck, lint, unit, and spec.
- **Keep the exact command and its real output for every gate.** `citi-close-change`
  writes them into `Validations executed` and `citi-prepare-pr` into the pull
  request. Never summarize a result as "passou" — the output is the evidence.
- On failure, report what broke and where, and stop. Fixing it is the TDD cycle's
  job, not this one's.

## Known trap

If `spec:validate` fails with a missing `openspec` binary, `@fission-ai/openspec`
is declared in `package.json` but absent from `node_modules`. Say so in
Brazilian Portuguese and instruct `pnpm install` — do not report it as a
specification failure, because it is not one.

## Closing

End with a compact table — gate, command, result — and say what comes next:
`/citi-close-change` when everything is green and the change still needs its
document, `/citi-tdd-cycle` when something failed.
