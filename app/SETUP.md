# Day-one setup

> ⚠️ **Delete this file when you finish.** Its presence in a repository means the
> setup was never completed — that is the point.

This project came from the CITi mobile boilerplate. Everything below carries the
template's identity, not yours. Work top to bottom; it takes about 20 minutes.

## 1. Identity

| Where                               | Change to                 | If you skip it                     |
| ----------------------------------- | ------------------------- | ---------------------------------- |
| `package.json` → `name`             | your project's slug       | tooling that reads the name breaks |
| `app.json` → `expo.name`            | the app's display name    | the app ships with the wrong name  |
| `app.json` → `expo.slug`            | your project's slug       | wrong project on Expo's servers    |
| `app.json` → `expo.scheme`          | something globally unique | **deep links open the wrong app**  |
| `app.json` → `ios.bundleIdentifier` | `com.yourorg.yourapp`     | EAS Build fails                    |
| `app.json` → `android.package`      | `com.yourorg.yourapp`     | EAS Build fails                    |

The `scheme` is the one that hurts most and shows up last. Two apps derived from
this template and installed on the same phone fight over the same URL scheme, and
the link opens whichever the OS feels like. Change it now.

## 2. Brand

- [ ] Replace `assets/images/`: `icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`
- [ ] Update `app.json` → the splash plugin's `backgroundColor` and `android.adaptiveIcon.backgroundColor`
- [ ] Replace the colors and fonts in `src/styles/tokens.json`

Tokens are the single source (rule R6): change them there and the whole app
follows. If you change the font family, update the imports in
`src/providers/app-providers.tsx` too — they name the Barlow weights explicitly.

## 3. Remove the template's leftovers

- [ ] `rm -rf src/features/example` — the reference feature
- [ ] Point `src/app/index.tsx` at your own first screen
- [ ] Keep `openspec/`, `docs/adr/`, `docs/changes/` and `docs/templates/` — they
      are the project's own specification and decision history from day one

Deleting `src/features/example/` must not break the build or the tests. If it
does, something imported it that should not have — that is a bug in your code,
not in the deletion.

## 4. Documentation

- [ ] Fill in `README.md` and delete the warning banner at the top
- [ ] Update `docs/architecture/decisions.md`: keep the decisions you inherit, add your own
- [ ] Review `AGENTS.md` so AI agents get _your_ project's context, not the template's
- [ ] Rewrite the `context` block in `openspec/config.yaml` with your product's
      domain, stack changes, and platforms
- [ ] Leave `.agents/skills/` untouched: the `citi-*` skills are shared across
      CITi boilerplates and read your `AGENTS.md` instead of restating it

## 5. Infrastructure

- [ ] Confirm `.github/workflows/ci.yml` triggers on the branch your team actually uses
- [ ] Enable branch protection on `develop`, marking the `quality` job
      (`Format, lint, types, specs, skills, coverage, and export`) and
      `expo-doctor` as required
- [ ] `cp .env.example .env` and point `EXPO_PUBLIC_API_URL` at your own API
- [ ] Add any new variable to `.env.example` too — it is the only list of them
      anyone cloning the repo will ever see

CI that does not block a merge is decoration. Prove it works: open a throwaway PR
with a deliberate lint error and confirm it goes red.

## 6. Verify

```bash
corepack enable
pnpm install
pnpm format:check && pnpm verify && pnpm test:coverage
pnpm build
pnpm run doctor   # not `pnpm doctor`, which is pnpm's own built-in command
pnpm start        # press `a` for Android, `w` for web
```

All green, app boots with your name, your icon and your colors, and nothing on
screen mentions CITi.

## 7. Delete this file

```bash
rm SETUP.md && git commit -am "chore: complete project setup"
```
