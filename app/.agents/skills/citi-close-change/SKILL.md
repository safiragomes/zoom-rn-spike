---
name: citi-close-change
description: Close an OpenSpec change during Consolidation — write docs/changes/<change-id>.md from the template with real validation output, run the ADR decision and create docs/adr/NNNN-*.md when it is warranted, and update both indexes. Use after the full suite is green and before archiving a change.
disallowed-tools: Bash(git commit:*), Bash(git push:*), Bash(gh pr:*)
argument-hint: "<change-id>"
---

# Close a change

Consolidation: the code is done and green, and now the change earns its
documentation. Two artifacts come out of here — the change document, always, and
an ADR, only when the decision warrants one.

Speak Brazilian Portuguese; write the artifacts in English. See
`../citi-playbook/references/language.md`.

## Precondition — do not skip

The change document is written **after** the full suite passes, never before and
never afterwards by reconstructing it from the Git history. Written early, it
documents behavior that Green and Refactor may still change; written late, the
exact result of each validation is already lost.

So: if this session has no recent full-suite output, run `/citi-verify-scope`
first and wait for it. **Write nothing until you hold real validation output.**

## Steps

1. Resolve the change ID from `openspec/changes/` (ignoring `archive/`). Ask if
   ambiguous. The change document's file name is that same ID — never a separate
   slug, so that nobody has to remember two identifiers for one change.

2. Read `docs/templates/change.md` and `docs/changes/README.md`. The template owns
   the structure; the README owns the process.

3. Create `docs/changes/<change-id>.md`. Fill in the front matter — `change_id`,
   `date`, `status`, `owners`, `tags`, `openspec_change`, `related_adrs` — and
   every mandatory section, in English, from the change's own artifacts and the
   real diff:
   - **Objective** — the problem and the goal, from `proposal.md`.
   - **Change made** — what was implemented. Include an implementation detail only
     when it complements the specification rather than repeating it.
   - **Resulting behavior** — observable behavior after the change, one bullet per
     distinct scenario.
   - **Impact** — the effects the change template's Impact guidance asks for
     (for example routes or navigation, components, flows, APIs, environment,
     native build or release, compatibility, risk). When there is no external
     impact, **say that explicitly**. Never omit the section.
   - **Validations executed** — the command and the real result for each gate that
     ran. Not "passou": the command and what it printed. This is the section that
     makes the document evidence instead of a claim.
   - **Related artifacts** — proposal, specs, design, tasks, related ADRs. Mark
     what does not exist as `Not applicable`.

   `Usage` and `Implementation notes` are optional; write `Not applicable` with a
   reason rather than deleting them.

   Never remove a mandatory section. A section that does not apply gets
   `Not applicable` and the reason why.

4. Run the ADR decision following `../citi-playbook/references/adr-decision.md`.
   It carries the procedure, the numbering, and the immutability rule; the
   criteria themselves live in `docs/adr/README.md`.

   The evaluation is mandatory even when the answer is no — a bare `Not applicable`
   is not an evaluation, so the rationale names what the change did and why that
   scope did not reach any trigger.

   When an ADR is warranted, ask for confirmation before creating it, showing
   which trigger fired and the title you propose. An ADR is a durable record and
   deserves a deliberate moment.

5. Update the indexes — the table in `docs/changes/README.md`, and
   `docs/adr/README.md` when an ADR was created or superseded. Newest first, using
   the columns each table already declares. These tables start empty in a fresh
   repository, so the first row you write sets the precedent: match the declared
   columns exactly and keep the formatting Prettier-stable.

## What this workflow does not do

**It never archives.** Archiving is `/openspec-archive-change`, which asks for
explicit confirmation immediately before moving the change — and that confirmation
must be its own, given at that moment. Nothing you confirm here counts for it.

It does not commit or push either.

Close by reporting, in Brazilian Portuguese, what was written, what the ADR
decision was and why, and that archiving is the next step and will ask for its own
confirmation.
