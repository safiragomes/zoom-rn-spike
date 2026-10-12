# Testing conventions

Referenced by `jest.config.js`. Stack: `jest-expo` + `@testing-library/react-native`.

## Where a test lives

Next to the code it covers, in a `__tests__/` folder — never in a mirrored tree
far away. Moving a feature must move its tests with it.

```
src/features/example/
├─ hooks/use-post.ts
└─ __tests__/use-post.test.tsx
```

Name the file after the subject: `use-post.test.tsx`, `button.test.tsx`,
`client.test.ts`. Use `.tsx` whenever the file renders JSX.

## Always render through `@test/render`

```tsx
import { renderWithProviders, screen, waitFor } from "@test/render";
```

`test/render.tsx` mounts the app's providers and re-exports everything from
Testing Library, so a test never repeats provider setup and a new global
provider only has to be added in one place.

Two things that bite otherwise:

- **`render` is async from Testing Library 14 on.** Always `await` it.
- **safe-area-context cannot measure the screen under Jest.** Without initial
  metrics it renders no children at all — `renderWithProviders` supplies them.

## What to test, and what not to

| Test                                                     | Skip                                         |
| -------------------------------------------------------- | -------------------------------------------- |
| What the user sees and does — visible text, press, retry | implementation details, internal state names |
| State logic in hooks: loading → success / failure        | that React re-renders                        |
| Error translation in services (status → message)         | that `fetch` works                           |
| That the provider tree mounts                            | third-party library behaviour                |

Query by what the user perceives (`getByText`, `getByRole`) and fall back to
`testID` only when there is nothing perceivable to grab. Mock at the boundary —
the service or `fetch` — not the component under test.

The four templates to copy from:

- component + hook together: `src/features/example/__tests__/example-screen.test.tsx`
- hook in isolation: `src/features/example/__tests__/use-post.test.tsx`
- service against a mocked network: `src/features/example/__tests__/example-service.test.ts`
- pure function: `src/shared/utils/__tests__/strings.test.ts`

## Mocking the network

Never rebuild the `fetch` mock per suite — import it from `@test/mocks/http`:

```ts
import { jsonResponse, mockFetch } from "@test/mocks/http";

const fetchMock = mockFetch(); // installs the mock and resets it before each test

it("returns the post", async () => {
  fetchMock.mockResolvedValueOnce(jsonResponse({ id: 1 }));
  await expect(exampleService.fetchPost(1)).resolves.toEqual({ id: 1 });
});
```

`jsonResponse(body, { status })` covers the normal cases — pass `null` for a
body-less 204 — and `textResponse` covers a payload that is not JSON.

Mock `fetch`, not `httpClient`. Stubbing the client proves only that a stub
returns what it was told to; stubbing `fetch` leaves the URL the service builds
and the error mapping under test. Anything shared by more than one suite belongs
in `test/mocks/` for the same reason.

## From scenario to test (TDD)

Behavior changes follow the flow in [AGENTS.md](../../AGENTS.md): the OpenSpec
change comes first, and each of its scenarios becomes at least one test before
any production code exists.

1. **Scenario → test.** Take a `WHEN`/`THEN` scenario from
   `openspec/changes/<change-id>/specs/` and name the test after the behavior
   it describes, in English. A test with no scenario behind it means the work
   grew past the agreed scope; a scenario with no test means it is unverified.
2. **Red.** Write the test, then run only it and watch it fail on the assertion
   — not on an import error or a typo:

   ```bash
   pnpm test -- src/features/<domain>/__tests__/<subject>.test.tsx -t "<test name>"
   ```

3. **Green.** Write the minimum production code that makes it pass, and rerun
   the same command.
4. **Refactor.** Improve the structure without changing behavior; the same
   tests stay green from start to finish.

Each transition waits for an explicit confirmation from the person reviewing
the work. Keep the command and its real output for each phase: the pull request
template asks for them as Red, Green, and Refactor evidence.

Run the full suite (`pnpm verify` and `pnpm test:coverage`) once the cycle
ends, before the change document is written.

## Repository tooling tests

`scripts/*.mjs` are tested in `tests/tooling/*.test.mjs` with `node:test` and
`node:assert/strict`, run by `pnpm test:tooling` (part of `pnpm verify`). Jest
does not collect them. See
[D20](../architecture/decisions.md#d20--repository-tooling-tested-with-node---test).

## Coverage

`jest.config.js` sets a floor: 70% statements/functions/lines, 60% branches. It
is a floor, not a target — it exists to catch a module shipped with no test at
all, not to be gamed.

Routes (`src/app/**`), styles, barrels (`index.ts`) and type-only files are
excluded: they emit little or no code, so 0% on them is noise rather than risk.

**Raising the floor:** bump it when the real number has stayed comfortably above
it for a full sprint, and only up to what was already achieved. Raising the
threshold to a number the codebase has not reached yet turns CI red on work
unrelated to the change that tripped it.

```bash
pnpm test              # run everything
pnpm test:watch        # watch mode while developing
pnpm test:coverage     # report + threshold check, same as CI
pnpm test:tooling      # node --test suites for scripts/
```
