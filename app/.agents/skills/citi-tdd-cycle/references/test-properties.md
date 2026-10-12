# Test properties and their trade-offs

Kent Beck's twelve desirable properties of a test suite, and the trade-offs that
make it impossible to maximize all of them at once. Use this when choosing a test
level, when a test feels awkward to write, or when judging whether an existing
test earns its keep.

## The twelve properties

1. **Behavior-focused** — validates what the system does, not how it does it.
2. **Structure-insensitive** — does not break when internals are refactored.
3. **Readable** — the business rule is clear to any engineer reading the test.
4. **Easy to write** — no complex, repetitive setup.
5. **Fast** — runs in milliseconds, so feedback stays continuous.
6. **Deterministic** — same result every run; no flakes, no false positives.
7. **Automated** — runs without human intervention in CI.
8. **Isolated** — one test does not affect another's state or result.
9. **Composable** — can be grouped and run in different subsets.
10. **Specific** — when it breaks, it points at where the error is.
11. **Predictive of production** — passing means high confidence it works for real.
12. **Inspiring** — gives the team confidence to make bold changes.

## The three trade-offs that actually bite

**Speed and isolation versus production fidelity.** Unit tests with faked external
dependencies are fast and isolated, and that is why they belong in the Red/Green
loop. But isolating the database and the network sacrifices prediction: the suite
can be green while a foreign-key constraint fails in production. Integration tests
buy that prediction back and pay for it in runtime. Both exist for this reason;
neither replaces the other.

**Structure insensitivity versus ease of writing.** Coupling a test to private
methods or to an exact table schema is easier today and costs the refactor
tomorrow — any internal improvement breaks the test, so the safety net becomes a
straitjacket. Testing through public interfaces and ports demands more design up
front and is what makes the Refactor phase meaningful.

**Specificity versus broad behavior.** An end-to-end test documents behavior
beautifully and, when it fails, tells you almost nothing about where. That is the
justification for the split: unit tests highly specific, integration tests focused
on the whole flow.

## Using this in practice

- Start at the narrowest level that can prove the scenario.
- A test that is hard to write is usually reporting a design problem — the
  dependency is not injectable, or the unit is doing more than one thing. Fix the
  design rather than the test setup.
- A test that breaks on every refactor without a behavior change is testing
  structure. Rewrite it against observable behavior or delete it.
- A test that never fails proves nothing. That is why Red requires a real failure.
