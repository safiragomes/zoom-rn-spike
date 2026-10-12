---
name: citi-task-spec
description: Draft or audit a work task using the CITi task template — objective, scope, rules and contract, acceptance criteria, technical constraints, references, and pending decisions. Use before any OpenSpec proposal or code, when a demand arrives as a loose description, an issue, a meeting note, or a chat message.
allowed-tools: Read, Grep, Glob, Write, Bash(git log:*), Bash(ls:*)
argument-hint: "<descrição da demanda | caminho do arquivo>"
---

# Task specification

A task that starts vague produces a change that quietly grows. This turns a loose
demand into a bounded one — and, more importantly, makes what is still unknown
visible before anyone writes code.

Speak Brazilian Portuguese; write the task in English. See
`../citi-playbook/references/language.md`.

## Steps

1. Read `docs/templates/task.md`. It owns the structure — follow it rather than
   an outline kept here.

2. Gather the input: the argument, a file path, an issue, or the conversation
   itself. With nothing to work from, ask openly in Brazilian Portuguese what the
   demand is. Do not offer a menu of guesses.

3. Read the surrounding repository before filling anything in — `AGENTS.md`,
   `openspec/config.yaml` §context, existing specs under `openspec/specs/`, and
   the code that the demand touches. A task written without reading the existing
   contract invents requirements that already have an answer.

4. Fill in every section of the template in English. Two deserve care:

   **Scope.** Non-goals matter as much as goals. Write down the adjacent problems
   this change will _not_ solve — pagination, authentication, an external
   integration, a refactor someone will be tempted to bundle in. This is what
   stops scope creep later.

   **Acceptance criteria.** Observable behavior only, in the form
   _Given [initial state], when [action], then [expected result and status]_.
   These become the specification scenarios and then the tests, so a criterion
   phrased as implementation ("the use case calls the repository") is dead weight
   — it cannot become a test that survives refactoring.

5. Run the ambiguity pass, which is the point of this workflow.

## Pending decisions — the hard rule

Every material ambiguity becomes an entry under `Pending decisions`. Material
means it changes behavior, contract, or scope.

**Name the ambiguity, list the alternatives you identified, and stop there. Do not
pick one.** Choosing on the requester's behalf is exactly how an agent produces
confident, plausible, unrequested behavior. Where you can tell who should decide
— tech lead, manager, requirement owner — say so.

When the section ends with open items, close in Brazilian Portuguese with:

> Há N decisões pendentes. A implementação não deve começar até que sejam
> resolvidas por uma pessoa responsável.

Then list them. Do not offer to proceed anyway.

When nothing is open, write `None` in the section and point to
`/openspec-propose` as the next step.

## Output

Present the task in the conversation by default. Write a file only when the
person gives a path. This is a thinking artifact — it does not need to live in
the repository to have done its job.

## Auditing an existing task

Given a task someone else wrote, check it against the same template: are non-goals
stated, is every acceptance criterion observable and testable, does the contract
table leave a row silently empty rather than marked `Not applicable`, and does any
sentence hide an unmade decision? Report gaps in Brazilian Portuguese, ordered by
how much damage each would cause if it reached implementation.
