# Running the ADR decision

`docs/adr/README.md` is the normative source for when an ADR is required, how it
is numbered, and how its status evolves. This file only describes how to run the
decision — it does not restate the criteria.

## Procedure

1. Read `docs/adr/README.md` §"When to create an ADR".
2. Ask each trigger it lists against the decision actually taken in this change,
   one at a time. Answer from the diff and the design document, not from
   impression.
3. **No trigger fires** — write `Not applicable` in the change document, followed
   by the reason. The reason names what the change did and why that scope did not
   reach the trigger. A bare `Not applicable` is not an evaluation.
4. **Any trigger fires** — create the ADR now, during Consolidation, using
   `docs/templates/adr.md`.

This evaluation is mandatory before archiving, including when the answer is no.
That is the point: the decision is recorded, not skipped.

## What the decision is about

The decision, not the implementation. The code already shows what was built; the
ADR exists to record why that option and not another. If nothing was chosen
between real alternatives, there is probably no ADR to write.

Design documents often contain decisions that are genuinely local — those get
recorded in the change document's own sections, with their trade-offs stated
just as honestly, and no ADR.

## Numbering and file name

1. List `docs/adr/` and find the highest existing `NNNN`.
2. The new number is that plus one, zero-padded to four digits.
3. File name: `NNNN-kebab-case-title.md`, the title short and specific
   (`0001-authentication-strategy.md`).
4. Fill in every mandatory section of the template. A section that does not apply
   gets `Not applicable` with a reason — never delete a section.

## Superseding an accepted ADR

An accepted ADR is immutable. When the decision changes:

1. Write a **new** ADR from scratch — current context, current alternatives,
   current decision. Do not copy the old body as a starting point; the old
   context was true then and the new one has to stand on its own.
2. Set `supersedes` in the new ADR's front matter to the old identifier.
3. In the old ADR, change **only** `status: superseded` and `superseded_by`. The
   body stays exactly as it was when accepted.
4. Update the index table in `docs/adr/README.md` for both records.

Any other edit to an accepted ADR is refused. Explain why in Brazilian
Portuguese and offer to write the superseding ADR instead.

## Index maintenance

Every created or superseded ADR updates the index table in `docs/adr/README.md`,
newest first, with the columns that table already declares. When the change
document references an ADR, it also lists it in `related_adrs` in its front
matter.
