---
title: [Task title]
date: YYYY-MM-DD
owners: []
tags: []
related_specs: [] # Example: [openspec/specs/user-registration/spec.md]
related_adrs: [] # Example: [ADR-0007]
---

# [Task title]

<!-- This template is the structured entry point for the development flow. It is
filled in BEFORE the OpenSpec change exists, and it is what the change proposal
is derived from. Write it in English; discuss it in Brazilian Portuguese. -->

## Objective

<!-- Briefly describe the problem to solve and the expected outcome. Explain what
must change and why, without anticipating implementation details that belong in
design.md. -->

## Scope

### Included

<!-- Behavior or endpoint to create or change. Data to create, change, or read.
Filters, ordering, or rules that must exist. Observable behavior that is part of
this delivery. -->

### Out of scope / Non-goals

<!-- Behavior that must NOT be implemented. Related changes that must stay
untouched. Recording non-goals is as important as defining what will be built:
it prevents scope creep and stops an agent from solving adjacent problems that
do not belong to this change. -->

## Rules and contract

<!-- Record the behavior that must not be inferred during implementation. Fill in
only the rows relevant to this task; write "Not applicable" for the others so
that a missing row is never read as an open decision. -->

| Item                        | Definition                                                                      |
| --------------------------- | ------------------------------------------------------------------------------- |
| Fields                      | <!-- Name, type, required, default value, and limits. -->                       |
| Uniqueness                  | <!-- Field involved and comparison rule. -->                                    |
| Listing                     | <!-- Allowed filters, search, and expected ordering. -->                        |
| Update                      | <!-- Fields that may change and behavior for omitted fields. -->                |
| Deletion                    | <!-- Hard or soft deletion, and required conditions. -->                        |
| Errors                      | <!-- Expected status and behavior for validation, conflict, auth, not found.--> |
| Navigation                  | <!-- Entry points, deep links, back behavior, and where each outcome leads. --> |
| Offline and network failure | <!-- Behavior without connectivity, on timeout, and on retry. -->               |
| Permissions                 | <!-- Device permissions requested, when, and behavior when denied. -->          |
| Platform differences        | <!-- Behavior that differs between Android, iOS, and web. -->                   |
| Persistence                 | <!-- What is stored on the device, where, and for how long. -->                 |

## Acceptance criteria

<!-- Turn the scope into observable, verifiable behavior. These become the
scenarios of the OpenSpec specification and the tests written during the TDD
cycle. Keep them focused on observable behavior, never on how the code should be
implemented. -->

- [ ] Given [initial state], when [action], then [expected result].
- [ ] Given [initial state], when [invalid action], then [expected error result].
- [ ] <!-- Add at least one scenario for every relevant behavior. -->
- [ ] <!-- Add failure scenarios and edge cases when they are part of the contract. -->

## Technical constraints

<!-- Record only constraints that are already known or defined by the project.
These are known limits, not decisions the agent may invent. If a new
architectural decision turns out to be necessary during design, it follows the
OpenSpec flow and, when applicable, the ADR criteria in docs/adr/README.md. -->

- <!-- Use the validation mechanism defined by the project. -->
- <!-- Preserve compatibility with existing contracts. -->
- <!-- Preserve module isolation and the existing dependency-injection strategy. -->
- <!-- Create the levels of test the project requires for the defined scenarios. -->
- <!-- Do not introduce new dependencies without need or approval. -->

## Context and references

<!-- Point the analysis at existing sources instead of letting behavior be
inferred from the code alone. -->

- <!-- Related endpoint, module, or capability. -->
- <!-- Existing specification that must be preserved. -->
- <!-- Related ADR. -->
- <!-- Relevant documentation or business rule. -->
- <!-- Related task, issue, or previous change. -->

## Pending decisions

<!-- Record any open question that changes behavior, contract, or scope.
IF THIS SECTION HAS ANY OPEN ITEM, IMPLEMENTATION MUST NOT START. The task owner
resolves it with the manager, tech lead, or requirement owner. An AI agent may
identify and record the ambiguity, but must not pick an alternative or invent
behavior to fill the gap. -->

- [ ] <!-- Pending decision. -->
      <!-- Alternatives identified, when any. -->
      <!-- Decision owner, when known. -->

<!-- Write "None" when every decision is resolved and implementation may start. -->
