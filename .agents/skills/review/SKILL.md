---
name: review
description: Review a diff on two axes that must not be blended — does it follow the project's coding standards, and does it faithfully implement the originating spec/ticket. Model-invoked, usually from implement.
---

# Review

Two different questions get asked here, and answering them together produces
worse answers than answering them separately: "is this well-written code"
and "is this the right code." Keep them apart.

## Invocation

Model-invoked from `/implement`, or user-invoked directly on any diff.

## Axis 1 — Standards

Check the diff against `.org/policies.md` and general code-smell judgment
(duplication, unclear naming, dead code, missing error handling, untested
edge cases). This axis doesn't care what the ticket said — it only cares
whether the code itself is good.

**Fix-first, but only for the unambiguous cases.** Mechanical, obviously-
correct fixes (dead code, stale comments, an unhandled null case with one
sane handling) — apply them directly rather than just listing them, and
tag each one `[AUTO-FIXED] file:line — what changed`. Anything genuinely
ambiguous (a security tradeoff, a race condition, a design choice with more
than one reasonable answer) gets surfaced as a finding for the human to
decide, never auto-fixed. If you're not sure which bucket something falls
in, treat it as ambiguous — auto-fixing the wrong thing is worse than
asking.

**Completeness gaps are a Standards finding, not a pass.** If the diff
implements a shortcut version and the complete version would cost roughly
30 minutes or less of additional work, flag it explicitly as a
completeness gap — don't let "it technically works" read as "it's done."

## Axis 2 — Spec fidelity

Independently, compare the diff against the originating
`.org/artifacts/spec-*.md` or ticket's acceptance criteria. Does the
implementation actually do what was asked — no more, no less? Flag scope
creep (unrequested features) as seriously as you'd flag missing scope.

## Keep the axes separate in your output

Report findings under two clear headings, Standards and Spec Fidelity. Don't
let a Standards nitpick bury a Spec Fidelity miss, or vice versa — a
beautifully written implementation of the wrong thing is still wrong, and a
correct implementation with messy code is still messy.

## Severity

For each finding, mark it:
- **Blocking** — must fix before this can be considered done
- **Suggested** — worth fixing, not required
- **Note** — informational, no action needed

Output must satisfy `.org/contracts/review-contract.md`.

## Worked example

```
Diff: adds OTP verification endpoint.

STANDARDS
[AUTO-FIXED] auth.ts:42 — removed unused `import bcrypt`, dead since OTP
  replaced password hashing.
[Blocking] auth.ts:58 — OTP attempts aren't rate-limited. A script could
  brute-force a 6-digit code in minutes. This is a security tradeoff, not
  a mechanical fix — needs a decision on limit/lockout policy.
[Note] Completeness gap — error responses return a raw exception message.
  Sanitizing this is ~10 minutes and prevents leaking stack traces to
  clients. Flagging, not blocking.

SPEC FIDELITY
[Blocking] Spec says "OTP expires after 5 minutes" — code hardcodes 15.
```

Note the shape: one fix applied silently and tagged, one ambiguous finding
surfaced instead of guessed at, one completeness gap named even though
nothing is technically broken, one spec mismatch caught independently of
the standards findings.

## Completion criteria

Both axes were checked independently (don't skip Spec Fidelity because the
code "looks fine"), every Blocking finding is either fixed or the calling
skill has explicitly acknowledged deferring it with a reason on record.
