# Future Improvements

These improvements are intentionally deferred. They need repository ownership,
service credentials, CI budget, a team workflow, or a decision the boilerplate
cannot make safely in advance. Each entry says what would justify picking it up.

## Testing and delivery

### Mobile end-to-end tests

Add a Maestro (or Detox) suite covering the critical flows on an Android
emulator, with accessibility checks, and a CI job that runs it. It is the mobile
counterpart of the web boilerplates' Playwright + axe job. Deferred because an
emulator in CI costs far more than a browser run, and the reference feature is
too small to justify it (D19).

**Pick it up when:** a derived project has a flow whose breakage would reach
users before unit tests notice.

### EAS Build and EAS Update in CI

Build signed binaries with EAS Build and publish JavaScript-only changes with
EAS Update from CI. Both need an Expo account, project credentials, and a
release policy that belong to the derived project, not to the template.

**Pick it up when:** the project has an Expo organization and a release owner.

### Audit back at `high`

CI runs `pnpm audit --audit-level critical` because the high-severity advisories
are transitive dependencies locked by the Expo SDK, React Native, ESLint, and
Jest (D19).

**Pick it up when:** an SDK release clears them; raise the level in
`.github/workflows/ci.yml` and update D19.

## Toolchain

### pnpm 12

The web and backend boilerplates run pnpm 12 with `pnpm-workspace.yaml`. This
repository stays on pnpm 10.24.0 with `.npmrc` (D14). Moving means checking that
the hoisted layout (D7) still satisfies React Native, Metro, and jest-expo,
moving the settings to `pnpm-workspace.yaml`, and changing every machine at
once through `packageManager`.

**Pick it up when:** there is a deliberate upgrade window, ideally together
with an SDK upgrade.

### `eslint-plugin-boundaries`, keeping barrels

The web boilerplates enforce layers with `eslint-plugin-boundaries`. It could
express R2–R4 here more directly than path patterns — while still requiring
imports through each feature's `index.ts` (D18).

**Pick it up when:** a boundary violation slips past `no-restricted-imports`.

## Application

### Runtime validation of API responses

The web boilerplates validate every external response with Zod at the feature
boundary. Here, feature services trust the shape the API returns. Adding Zod
would turn a malformed payload into a typed error instead of a crash deep in a
component.

**Pick it up when:** the app consumes an API it does not control.

## GitHub repository settings

### Branch protection or rulesets

Protect `develop` (and `main`, when used) with required pull requests and the
required checks `Format, lint, types, specs, skills, coverage, and export` and
`expo-doctor`, blocked force pushes, and at least one approval.

### CodeQL default setup

Enable GitHub CodeQL default setup for JavaScript and TypeScript when the
repository visibility and GitHub plan support it. Prefer the default setup
before adding a custom workflow.
