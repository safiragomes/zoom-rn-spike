---
name: citi-playbook
description: Map the CITi engineering playbook for this repository and route to the right step — OpenSpec specification, the TDD cycle, change documents, ADRs, verification gates, and pull requests. Use when someone asks how work flows here, where a feature starts, what the next step is, or which workflow applies.
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git log:*), Bash(ls:*)
argument-hint: "[etapa ou dúvida]"
---

# CITi playbook — flow map and router

You are the entry point to the CITi development flow in this repository. Explain
where the work stands, what comes next, and which workflow handles it.

Read `references/language.md` before answering. It defines the language contract
that every `citi-*` workflow follows.

## The flow

```
  task                spec                 code                  close
  ────                ────                 ────                  ─────
  /citi-task-spec  →  /openspec-propose  →  /citi-tdd-cycle  →  /citi-verify-scope
       │                    │                   │ Red                  │
       │                    │                   │ ↓ (confirm)          ↓
  objective,          proposal,                 │ Green           /citi-close-change
  scope,              delta spec,               │ ↓ (confirm)          │ change doc
  contract,           design,                   │ Refactor             │ ADR decision
  acceptance          tasks                     │                      ↓
  criteria,                                     └──────────→   /citi-review-change
  PENDING                                                             ↓
  DECISIONS                                                     /citi-prepare-pr
                                                                      ↓
                                                            /openspec-archive-change
```

Nothing is optional. What varies per change is how much each step demands.

## Which workflow applies

| Situation                                                         | Workflow                   |
| ----------------------------------------------------------------- | -------------------------- |
| A demand arrived loose — chat message, issue, meeting note        | `/citi-task-spec`          |
| The task is clear and has no pending decision                     | `/openspec-propose`        |
| Thinking out loud before committing to a change                   | `/openspec-explore`        |
| Planning artifacts exist and it is time to write code             | `/citi-tdd-cycle`          |
| A planning artifact needs revision, without touching code         | `/openspec-update-change`  |
| Unsure which tests and gates this change requires                 | `/citi-verify-scope`       |
| The full suite is green and the change needs its documentation    | `/citi-close-change`       |
| Reviewing a branch against this repository's rules                | `/citi-review-change`      |
| Writing the pull request body                                     | `/citi-prepare-pr`         |
| The change doc is written and the change is ready to archive      | `/openspec-archive-change` |
| Merging a delta spec into the consolidated spec without archiving | `/openspec-sync-specs`     |

## Where the rules live

Never restate these rules here or in any other workflow — cite the file and let
it stay the single source.

| Source                             | What it owns                                                                |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `AGENTS.md`                        | repository conventions, SDD flow, TDD flow, verification, code review rules |
| `openspec/config.yaml`             | rules for proposal, specs, design, tasks, and archiving                     |
| `docs/templates/task.md`           | task structure                                                              |
| `docs/templates/change.md`         | change document structure                                                   |
| `docs/templates/adr.md`            | ADR structure                                                               |
| `docs/adr/README.md`               | when an ADR is required, numbering, status lifecycle                        |
| `docs/changes/README.md`           | change document process and index                                           |
| `CONTRIBUTING.md`                  | branches, commits, pull requests                                            |
| `.github/pull_request_template.md` | what a pull request must prove                                              |
| `.github/workflows/ci.yml`         | canonical gate order                                                        |
| `references/adr-decision.md`       | how to run the ADR decision, procedure only                                 |

## Reading the current state

Before answering "what now?", look at the repository instead of guessing:

1. `ls openspec/changes/` — active changes (ignore `archive/`).
2. For an active change, read its `tasks.md` to see which phase it reached.
3. `git status --porcelain` and `git log --oneline -5` — what is in flight.
4. `ls docs/changes/` — whether the active change already has its document.

Then say, in Brazilian Portuguese, where the work stands and which workflow is next.

## Never do this

Straight from the playbook. These are the failure modes this flow exists to prevent.

- Editing the body of an accepted ADR. Create a new one and link the two.
- Creating an ADR for a local, quickly reversible decision with no real trade-off.
- Writing the change document before Consolidation, or afterwards by
  reconstructing it from the Git history.
- Treating documentation as an optional task "if there is time left". It is part
  of the definition of done.
- Moving from one TDD phase to the next without an explicit checkpoint with the
  person reviewing the work.
- Archiving a change without tests, typecheck, lint, and strict specification
  validation passing.
- Starting implementation while the task still has an open pending decision.
- Writing production code that no test requires.
- Copying a rule from `AGENTS.md` into a workflow file. Cite it instead.
