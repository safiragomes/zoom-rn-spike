---
name: citi-review-change
description: Review a branch or diff against this repository's own agent rules, architecture boundaries, specification traceability, and pull request checklist, reporting findings in Brazilian Portuguese ranked by severity with file and line. Use before opening a pull request or when reviewing a teammate's branch in this repository.
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git merge-base:*), Bash(git symbolic-ref:*), Bash(git rev-parse:*), Bash(ls:*)
context: fork
argument-hint: "[base-ref]"
---

# Review a change

Review against the rules **this repository declared**, not against generic good
practice. A finding that does not trace back to a rule written down here is an
opinion, and opinions belong in a conversation rather than a review.

Report in Brazilian Portuguese — see `../citi-playbook/references/language.md`.

## Scope

`git diff <base>...HEAD` plus uncommitted changes. Default base: an explicit
argument wins; otherwise the integration branch `CONTRIBUTING.md` declares;
otherwise the remote default branch
(`git symbolic-ref --short refs/remotes/origin/HEAD`); otherwise `main`. Say in
the report which base was used and why.

Read the full content of changed files, not only the hunks — a boundary
violation is often invisible in the diff and obvious in the file.

## Criteria, in order of authority

1. **`AGENTS.md` §Code Review Rules**, when the repository has that section. These
   are the institutional rules and they come first. Read them at review time; do
   not work from a copy.

2. **`.github/pull_request_template.md` §Checklist.** Every item is a claim the
   author will be asked to make. Check each one against the diff.

3. **The architecture enforcement this repository declares** — its ESLint
   config (`eslint.config.*`), any architecture config it imports (such as
   `architecture.config.mjs`), and the architecture document `AGENTS.md` points
   to. Layer boundaries, import conventions (whether barrel files are required
   or forbidden is this repository's decision — follow it, never the other
   one), file naming, restricted imports and globals. Lint catches most of these
   mechanically, so spend attention on what it cannot see — a dependency that is
   technically legal but puts knowledge in the wrong layer.

4. **Specification traceability.** For an active change, read
   `openspec/changes/<id>/specs/**/spec.md`: does every scenario have a test, and
   does every new test map to a scenario? A test with no scenario behind it usually
   means the implementation grew past the agreed scope.

5. **The rest of `AGENTS.md`** — conventions, SDD flow, TDD flow, architecture and
   testability.

When the repository has no §Code Review Rules, say so in the report and rely on
the checklist and the configs. Do not import rules from another repository.

## Reporting

Order by severity: what breaks in production, then what breaks the contract, then
what will hurt maintenance.

Each finding carries:

- `arquivo:linha`
- the violated rule, **cited by origin** — `AGENTS.md §Code Review Rules, regra 2`,
  `PR checklist, item 4`, `the lint or architecture config, feature → feature`
- what happens if it ships
- the minimal correction

Something that is merely a preference of yours is not a finding. If it is worth
saying at all, put it in a short separate "Observações" section, clearly outside
the findings, and keep it brief.

Close with the pull request checklist gone through item by item — met, not met, or
not applicable with a reason.

## Do not

- Do not edit code. This workflow reports; fixing is a separate, deliberate act.
- Do not report what the linter already catches as if it were a review finding,
  unless it is actually present in the diff and unfixed.
- Do not claim a test passes or fails without having run it. Verification is
  `/citi-verify-scope`.
