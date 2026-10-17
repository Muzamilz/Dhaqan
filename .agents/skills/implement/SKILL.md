---
name: implement
description: Build the work described by a ticket, driving the tdd skill at pre-agreed seams, and closing out with review before considering the ticket done. User-invoked per ticket.
---

# Implement

This is the skill that actually writes code, in service of one ticket.
Everything before this (grill, spec, tickets, architect) exists to make this
step boring and low-risk.

## Invocation

User-invoked, one ticket at a time: `/implement t3`.

## Step 1 — Load context

Read the target ticket from `.org/artifacts/tickets/<id>.md`, its
architecture doc if one exists, the owning engineer's contract from
`.org/engineers/`, `.org/engineering-standards.md`, and `.org/policies.md`.

## Step 1.5 — Validate the handoff

Check the ticket against `.org/contracts/ticket-contract.md` and the owning
engineer's **Handoff rules** and **Inputs** fields. If the ticket is
missing something either requires (e.g. no acceptance criteria, no
architecture doc when the engineer's contract requires one for non-trivial
work), stop here and say exactly what's missing rather than proceeding on
an incomplete handoff. This is the mechanical check that makes
"artifact-driven handoffs" real instead of aspirational — don't skip it
because the ticket "looks fine."

## Step 2 — Confirm the seam

If an architecture doc defined test seams, use them. If not, state the seam
you're going to test at before writing anything, and give the user one
chance to object if this is a ticket where that matters (skip this check for
trivial tickets).

## Step 3 — Drive the loop

Invoke the `/tdd` method for each vertical slice needed to satisfy the
ticket's acceptance criteria — its Iron Law applies here without exception:
no implementation before a failing test proven to fail for the right
reason. Don't move to the next slice until the current one is green and
refactored.

## Step 4 — Self-check against acceptance criteria

Before calling this done, go back to the ticket's acceptance criteria one by
one and verify each is actually satisfied — not "probably fine." If any
criterion can't be verified without running the app, say so explicitly and
hand it to `/qa`.

## Step 5 — Close with review

Invoke `/review` on the diff before considering the ticket complete. Fix
what it flags, or explicitly note in the ticket file why a flagged item is
being deferred (never silently ignore review findings).

## Step 6 — Update the ticket and memory

Mark the ticket file as complete with an implementation report matching the
owning engineer's **Outputs** field exactly — don't produce a vaguer summary
than the contract calls for. If anything non-obvious was learned (a gotcha,
a decision that future tickets should respect), append it to
`.org/memory/project-memory.md` via the `/memory` skill's method — don't let
it live only in this session's context.

## Completion criteria

All acceptance criteria on the ticket are verified true, `/review` has run
and its findings are either fixed or explicitly deferred with a reason, the
ticket file reflects the final state, and the output matches the owning
engineer's contract well enough that the next step in the workflow (per
`.org/workflows/*.md`) could consume it without asking clarifying questions.
