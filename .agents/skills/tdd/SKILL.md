---
name: tdd
description: Test-driven development loop — red, green, refactor — for one vertical slice at a time. Refuses to write implementation code before a failing test exists at an agreed seam. Model-invoked, usually from implement.
---

# TDD

Feedback loops are what stop an agent from flying blind. A red-green-refactor
loop, honestly followed, is the cheapest reliable feedback loop available.

**Iron Law: no implementation before a failing test proven to fail for the
right reason.** This is the one rule in this skill that doesn't bend for
convenience, time pressure, or a change that "obviously" works. If you
notice yourself about to write implementation and test together to save a
step, that's the signal to stop and follow the loop instead.

## Invocation

Model-invoked, typically from `/implement`. Callable directly for a single
slice of work.

## Precondition

If `.org/artifacts/architecture-*.md` exists for this work and defines test
seams, honor them exactly — don't invent different seams because they seem
more convenient. If no architecture doc exists (trivial change), pick the
narrowest reasonable seam yourself and say so before writing the test.

## The loop, per vertical slice

1. **Red** — write a test that fails for the right reason. Run it. Confirm
   it fails with the expected error, not an unrelated one (e.g. a typo
   causing an import error isn't "red," it's broken).
2. **Green** — write the minimum implementation that makes the test pass.
   Resist adding anything the test doesn't require yet — that's scope creep
   into a future slice.
3. **Refactor** — with the test passing, clean up naming, remove
   duplication, tighten the interface. Re-run the test after every change to
   confirm it still passes.
4. Repeat for the next slice. Never batch multiple slices' red steps
   together — one failing test at a time.

## What counts as a good test here

- Tests behavior at the seam, not implementation detail — should survive a
  refactor that doesn't change behavior.
- One assertion concept per test; multiple asserts are fine if they're all
  verifying the same behavioral claim.
- No test that passes trivially (the "no-op test" trap) — if you comment out
  the implementation and the test still passes, the test is worthless.

## Worked example

```
Slice: OTP code expires after 5 minutes.

RED
  Write: test('rejects OTP after 5 minutes', ...)
  Run it → fails with "ReferenceError: verifyOtp is not defined"
  That's the wrong failure — the function doesn't exist yet, this isn't a
  real red. Stub verifyOtp() to return true unconditionally.
  Run again → fails with "expected rejection, got success"
  That's a real red — failing for the right reason.

GREEN
  Add expiry check: if (Date.now() - otp.createdAt > 5 * 60_000) reject().
  Run it → passes.

REFACTOR
  Extract the 5-minute constant to OTP_EXPIRY_MS. Re-run → still passes.
```

If this hits the iteration budget in `.org/agent-operating-policy.md`
without reaching green, that's the Iron Law's stop condition, not a reason
to skip straight to implementation-without-a-test to unblock yourself.

## Completion criteria

Every slice has a test that was observed failing for the right reason before
any implementation was written, and passes after. Don't report "tests
written" if you wrote implementation and tests together without watching the
test fail first — that's not TDD, say so plainly if that happened.
