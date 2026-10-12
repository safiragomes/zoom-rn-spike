# Change Documentation

This directory holds the living documentation for each shipped feature or
change in this project.

Each file describes the current state of a change — not a changelog of what
happened over time, but a snapshot of what exists and how it works, kept up
to date as the change evolves.

## How to create a new change doc

1. Copy `docs/templates/change.md` into this directory.
2. Rename it to match the OpenSpec `change-id` for this change (same
   identifier used in `openspec/changes/`).
3. Fill in the front matter and all required sections (`Objective`,
   `Change made`, `Resulting behavior`, `Impact`, `Validations executed`,
   `Related artifacts`). `Usage` and `Implementation notes` are optional.
4. The doc is created or updated within the same branch/PR as the change
   itself, finalized during Consolidation — after tests pass and
   `openspec validate --strict` succeeds — not written after the fact in a
   separate PR.
5. If this change also produced an architectural decision that meets the ADR
   trigger criteria (see `docs/adr/README.md`), open a corresponding
   `docs/adr/NNNN-*.md` and reference it via `related_adrs` in this doc's
   front matter. Most changes won't need one — that's expected, not a gap.
6. Open a Pull Request for team review.
7. After merge, update the table below.

## Index

| Change ID | Title | Status | Related ADRs |
| --------- | ----- | ------ | ------------ |

<!--
Add one row per change doc.
Possible status values: in-progress · shipped · deprecated
Leave "Related ADRs" as — when the change didn't meet the ADR trigger criteria.
-->
