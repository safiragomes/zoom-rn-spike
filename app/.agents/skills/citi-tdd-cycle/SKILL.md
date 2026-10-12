---
name: citi-tdd-cycle
description: Run one strict Red-Green-Refactor cycle with an explicit human checkpoint between phases, deriving tests from the OpenSpec scenarios of the active change. Use when implementing any behavior change in this repository, when asked to write tests first, or when resuming an interrupted TDD cycle.
disallowed-tools: Bash(git commit:*), Bash(git push:*), Bash(gh pr:*), Bash(git merge:*)
argument-hint: "[change-id | requisito]"
---

# TDD cycle

Red → Green → Refactor, in that order, from the specification's scenarios. The
cycle's value is entirely in not skipping steps, so the mechanics below are
non-negotiable.

`AGENTS.md` §"TDD flow" owns the rules; this runs them. Speak Brazilian
Portuguese — see `../citi-playbook/references/language.md`.

## The checkpoint rule — read this first

Before each phase transition, you explain what the next phase will do and **stop**.

A confirmation is a **new message from the person**, arriving after your
explanation. Nothing else counts:

- You cannot confirm on your own behalf, in any form — not "vou prosseguir", not
  a checklist you tick yourself, not "assumindo que está ok".
- An approval given for a previous phase does not carry into this one. Three
  transitions require three separate confirmations.
- "pode seguir" said _before_ you explained the phase approves nothing, because
  the person had not yet seen what they were approving.
- An approval of the overall plan or the task is not an approval of a phase
  transition.

If you find yourself continuing without a fresh reply, you have broken the cycle.
Stop and say so.

## Before starting

1. Find the active change under `openspec/changes/` (ignore `archive/`). Ask if
   more than one is active.
2. **No active change means no cycle.** Stop and route to `/openspec-propose`.
   Specification comes before tests, which come before code — that ordering is
   the whole method, not a formality.
3. Read the change's delta spec at `openspec/changes/<id>/specs/**/spec.md` and
   its `tasks.md`. The scenarios are your test cases.
4. Read `AGENTS.md` and the existing tests near the code you will touch, to match
   the conventions actually in use — file location, naming, how external
   dependencies are faked.

Resuming an interrupted cycle: read `tasks.md` to find the last completed phase
and restart from the next transition, with its own confirmation.

## Red

1. Choose the scenario to cover and the test level. Say which scenario, in
   Brazilian Portuguese, and where the test will live.
2. Explain what the test will assert and why it must fail right now.
   **Ask for confirmation. Stop.**
3. Write the test. Production code stays untouched in this phase.
4. Run the narrowest command that exercises it — a single file, and a test-name
   filter when the file is large.
5. **Paste the command and its real output.** A failing run is the proof that the
   test tests the right thing instead of passing by accident.
6. If it failed for the wrong reason — an import error, a typo, a missing fixture
   — fix the test and run again. You are still in Red. Only a failure on the
   assertion itself ends this phase.

## Green

7. Explain the minimum production code that makes the test pass — no optimization,
   no abstraction for a future case that does not exist yet.
   **Ask for confirmation. Stop.**
8. Write exactly that. Run the same narrow command. Paste command and output.

## Refactor

9. Explain the structural improvements you intend and state plainly that observable
   behavior does not change. **Ask for confirmation. Stop.**
10. Refactor. Run the relevant tests again — they stay green from start to finish
    of this phase. Paste command and output.

## Rules that hold across all three phases

- No production code without a test that requires it.
- Never mock the system under test. Fake only external dependencies — HTTP, time,
  database, browser, device and OS APIs, native modules — and only where
  necessary.
- An ambiguity, missing edge case, or technical constraint discovered mid-cycle
  **stops the cycle**. The specification is updated first, through
  `/openspec-update-change`, and only then does the cycle resume — from Red,
  because the scenario changed.
- Keep every command and its output for Red, Green, and Refactor. These are the
  _Red evidence_, _Green evidence_, and _Refactor evidence_ fields of the pull
  request template, and `/citi-prepare-pr` will ask for them.

## Test quality

When choosing between test designs, or when asked whether a test is a good one,
read `references/test-properties.md`.

## Consolidation

The cycle ends with the behavior implemented, not with the change finished.

Run the full suite through `/citi-verify-scope` **before** any documentation is
written — the change document has to describe how the implementation actually
turned out, not how it was meant to. Then hand off to `/citi-close-change`.

Do not commit, push, or open a pull request from inside this workflow.
