---
name: citi-prepare-pr
description: Fill this repository's pull request template with real evidence — run the applicable gates, collect the Red, Green, and Refactor commands and their output, and link the OpenSpec change, change document, and ADR. Use when preparing to open a pull request or when asked for a pull request description for this repository.
allowed-tools: Read, Grep, Glob, Write, Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git branch:*), Bash(git merge-base:*), Bash(git symbolic-ref:*), Bash(git rev-parse:*), Bash(pnpm run:*), Bash(pnpm exec:*), Bash(ls:*)
argument-hint: "[base-ref]"
---

# Prepare the pull request

Fill in the template this repository actually has, with evidence that actually
exists.

Speak Brazilian Portuguese; write the pull request body in English. See
`../citi-playbook/references/language.md`.

## Never fabricate evidence

This is the rule that matters most here, because the failure is invisible: a
plausible test output that nobody ran reads exactly like a real one, and the
reviewer trusts it.

**Every command and result you write must have actually run — in this session, or
read back from a real log.** When you do not have it:

> Pendente — evidência não capturada nesta sessão.

That line is a correct answer. An invented one is not, no matter how confident it
looks. The same holds for checkboxes: a box is ticked only for something you saw
succeed.

## Steps

1. Read `.github/pull_request_template.md` **from this repository**. Its sections
   differ between repositories — never assume a shape you have seen elsewhere.
   Produce exactly the sections it declares, in its order.

2. Gather the material:
   - `git diff <base>...HEAD` and `git log` for the branch. Default base: an
     explicit argument wins; otherwise the integration branch `CONTRIBUTING.md`
     declares; otherwise the remote default branch
     (`git symbolic-ref --short refs/remotes/origin/HEAD`); otherwise `main`.
     Say in the report which base was used and why;
   - `openspec/changes/<id>/proposal.md` for the why and the scope;
   - the delta spec for the scenarios;
   - `docs/changes/<change-id>.md` for the validations already recorded;
   - the Red / Green / Refactor commands and output from `/citi-tdd-cycle`.

3. Fill in the sections. Common ones and what they need:

   **Summary** — the problem, the chosen behavior, how it was solved. From the
   proposal and the diff, not from the commit subjects.

   **OpenSpec, TDD, and documentation** — link to the change; the business
   capability affected; a table mapping each specification scenario to the test
   file that covers it; the _Red evidence_, _Green evidence_, and _Refactor
   evidence_ fields with real commands and output; the change document; the ADR or
   its `Not applicable` rationale; archive status.

   **Impact** — the fields this repository declares. Answer each one; when there is
   no impact, say so rather than leaving it blank.

   **Verification** — tick only what `/citi-verify-scope` actually ran and saw
   pass. Leave the rest unticked with a one-line reason: not applicable to this
   change, or not yet run.

   **Checklist** — item by item. An item that does not apply gets a short
   rationale instead of a tick.

4. Where a gate in the Verification section applies and has not run, offer to run
   it through `/citi-verify-scope` before finishing. Do not tick it on the promise
   that it would pass.

## Output

Present the body in the conversation. Write a draft file only if asked.

**Never run `gh pr create` or push.** Opening a pull request is the person's act —
they are the one whose name goes on it.

Close by listing, in Brazilian Portuguese, what is still pending: unticked boxes,
missing evidence, and gates worth running first.
