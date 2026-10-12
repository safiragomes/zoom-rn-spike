# Architecture Decision Records

Architecture Decision Records capture consequential technical choices that future contributors need to understand.

## When to create an ADR

Create an ADR when a decision changes a durable system boundary or data contract, introduces a significant dependency or infrastructure provider, establishes a security/privacy/compatibility invariant, or resolves a recurring disagreement whose context would otherwise be lost.

Skip it for routine implementation details, formatting choices, or a local and reversible change without a real trade-off — record that instead in `docs/changes/<change-id>.md`, with `Not applicable` and the rationale. Always make this evaluation explicit in the change summary before archiving an OpenSpec change.

## Creating an ADR

1. Copy `docs/templates/adr.md`.
2. Assign the next sequential four-digit number with a kebab-case title (e.g. `0001-authentication-strategy.md`).
3. Link the ADR to its OpenSpec change and change summary when applicable.
4. Complete every mandatory section; use `Not applicable` instead of removing one.

## Status and lifecycle

`Proposed` → `Accepted` (or `Rejected`). An accepted ADR can later become `Deprecated` or `Superseded`. Never rewrite an accepted ADR to erase history — create a new one and link both records instead.

## Index

| Number | Title | Status | Superseded by |
| ------ | ----- | ------ | ------------- |

<!--
Add one row per ADR, newest first.
Status values: Proposed · Accepted · Rejected · Deprecated · Superseded
Leave "Superseded by" as — unless the ADR was replaced.
-->
