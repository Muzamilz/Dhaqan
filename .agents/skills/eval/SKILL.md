---
name: eval
description: Capture a real failure as a golden case, or run existing golden cases as a regression check after changing a SKILL.md. User-invoked.
---

# Eval

This kit doesn't have a test suite for the skills themselves — this is the
closest equivalent. When something goes wrong, capture it so it doesn't
silently happen again after the next edit.

## Invocation

User-invoked, in two modes: `/eval capture` and `/eval run`.

## Mode: capture

Use this right after noticing a skill produced a bad outcome — missed an
edge case, made a wrong assumption, handed off something incomplete.

1. Write a new entry to `.org/artifacts/golden-cases.md`:
   - **Skill involved**
   - **Input/context** — what the skill was given (ticket, spec excerpt,
     conversation state) — enough to reproduce the situation
   - **What happened** — the actual bad outcome
   - **What should have happened** — the correct behavior, stated concretely
2. If the root cause is fixable in the SKILL.md itself (missing instruction,
   ambiguous step), fix it now and note in the case entry which line changed.

## Mode: run

Use this after editing any SKILL.md, before trusting the edit.

1. Read `.org/artifacts/golden-cases.md`.
2. For each case involving the skill(s) you changed, re-create the
   input/context described and check whether the correct behavior now
   happens.
3. Report pass/fail per case. Treat this as a first-pass signal, not ground
   truth — if a case is genuinely ambiguous, say so rather than forcing a
   pass/fail verdict.
4. If a case regresses (was passing, now fails), that's a stop-and-fix
   signal before the edited skill gets used for real work again.

## Completion criteria

For capture: the case has enough concrete detail that someone else (or a
future session) could reproduce the situation without additional context.
For run: every relevant case has a recorded verdict, and any regression is
flagged before moving on, not buried in a summary.
