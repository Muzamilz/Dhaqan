---
name: qa
description: Verify a shipped ticket or feature against its spec's acceptance criteria by actually exercising the running code, not just reading it. User-invoked, or model-invoked from implement when a criterion can't be verified statically.
---

# QA

Reading code and running code find different bugs. This skill exists to
actually run things.

## Invocation

User-invoked (`/qa <spec-or-ticket-id>`), or model-invoked from
`/implement` when an acceptance criterion needs runtime verification that
static reading can't confirm.

## Step 1 — Load acceptance criteria

Read the target spec or ticket's acceptance criteria. These are the only
things being tested here — don't invent new checks, and don't skip stated
ones because they seem obviously fine.

## Step 2 — Execute

Run the relevant tests, start the app if needed, and exercise the actual
behavior described in each criterion. Prefer real execution (run the test
suite, hit the actual code path) over inference from reading the diff.

## Step 3 — Record outcome per criterion

For each acceptance criterion: pass, fail, or blocked (couldn't verify —
say why, e.g. missing test data, environment issue). Don't average this into
a vague "looks good" — report per-criterion.

## Step 4 — On failure

If something fails, don't silently fix it and re-report success — flag it,
propose the fix, and if it's non-trivial, treat the fix itself as needing
its own `/tdd` red-green cycle rather than a blind patch.

## Step 5 — Write the report

Write `.org/artifacts/qa-<ticket-id>.md` satisfying
`.org/contracts/qa-contract.md`, with the per-criterion results and any
regression tests added as a result of failures found here.

## Completion criteria

Every acceptance criterion on the target has a recorded pass/fail/blocked
outcome from actual execution, not inference. Any failure found has either
been fixed and re-verified, or is explicitly flagged as open.
