## Summary

Describe the problem, the chosen behavior, and the solution.

## OpenSpec, TDD, and documentation

- For documentation-only or maintenance work, mark non-applicable OpenSpec and
  TDD fields with a brief rationale.
- OpenSpec change: <!-- link, or Not applicable with rationale -->
- Affected business capability:
- Acceptance scenarios mapped to tests:
- Red evidence: <!-- failing test command and result -->
- Green evidence: <!-- passing narrow test command and result -->
- Refactor evidence: <!-- tests rerun after refactoring -->
- Change summary: <!-- docs/changes/<change-id>.md, or Pending archive with rationale -->
- ADR: <!-- link, or Not applicable with rationale -->
- Archive status: <!-- active | archived -->

## Impact

- Navigation, deep links, or UI compatibility:
- Platforms affected (Android, iOS, web):
- Native build required, or JavaScript-only:
- Environment variables and rollback:
- Security and privacy:
- Accessibility and user experience:
- Documentation:

## How to test

1. In the terminal:

   ```bash
   git fetch origin
   git checkout <branch name>
   pnpm install
   pnpm start
   ```

1. Press `a` for Android or `w` for web in the Expo CLI prompt

1. Check the screen against the mockup on at least two screen sizes

1. Read the changed files section on GitHub

1. Test whatever else you think is worth testing, even if it is not listed here

## Verification

- [ ] `pnpm format:check`
- [ ] `pnpm verify`
- [ ] `pnpm test:coverage`
- [ ] `pnpm build`, when Metro or Babel config, assets, routes, `app.json`, or dependencies change
- [ ] `pnpm run doctor`, when dependencies or `app.json` change
- [ ] Manual check on Android and web, when the change is user-visible

## Checklist

- [ ] OpenSpec artifacts were reviewed before implementation.
- [ ] Every applicable specification scenario has automated test coverage.
- [ ] Rules R1–R7 hold: routes carry no logic, features stay isolated and are imported through their `index.ts`, nothing calls `fetch` outside `src/services/http`, and no literal hex color is used.
- [ ] No secret or private value is exposed through `EXPO_PUBLIC_*` variables.
- [ ] User-facing changes cover relevant loading, error, empty, and accessibility states.
- [ ] Native dependencies were added with `pnpm exec expo install` and pinned exactly.
- [ ] Documentation and `.env.example` are updated when required.
- [ ] The change summary follows `docs/templates/change.md`, when archiving.
- [ ] The ADR follows `docs/templates/adr.md`, when applicable.
- [ ] Archive prerequisites passed: applicable tests, typecheck, lint, and strict OpenSpec validation.
