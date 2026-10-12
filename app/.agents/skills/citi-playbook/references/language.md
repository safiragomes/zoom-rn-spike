# Language contract

Every `citi-*` workflow follows this. It restates the language rule that
`AGENTS.md` owns; that file is the source.

## Brazilian Portuguese — talking to people

- Questions, clarifications, and requests for confirmation.
- Explanations of what a phase will do and why.
- Progress reports, findings, review output, and summaries.
- Refusals and blocking messages.

## English — artifacts that live in the repository

- OpenSpec proposal, delta specs, design, and tasks.
- Task documents, change documents, and ADRs.
- Test names, code, comments, and commit messages.
- The pull request body.

## Why the split

The person reading the terminal is a Brazilian developer and should not have to
translate a question in order to answer it. The artifact is read later, possibly
by someone outside the team and by tooling that expects English. Mixing the two
makes both worse.

## Naming

- Files and folders: kebab-case.
- Change IDs and capability names: kebab-case, named after a business capability
  — never after a route, component, table, or function.
- The change document file name is the change ID itself, never a separate slug.
