---
name: tickets
description: Break a spec into tracer-bullet tickets with explicit dependency edges, written as local files under .org/artifacts/tickets/. User-invoked.
---

# Tickets

Turn a spec into an ordered set of small, independently completable units of
work. The point of dependency edges is that they let you (or a future
session) know exactly what's unblocked right now.

## Invocation

User-invoked, after `.org/artifacts/spec-*.md` exists.

## Step 1 — Read the spec

Read the target spec fully, including out-of-scope and acceptance criteria —
tickets must map back to acceptance criteria, not invent new scope.

## Step 2 — Decompose

Prefer **tracer bullets** over horizontal slices: each ticket should, where
possible, cut through the full stack for one thin piece of behavior rather
than "build the whole backend" then "build the whole frontend." This
surfaces integration problems early instead of at the end.

Each ticket must satisfy `.org/contracts/ticket-contract.md`. For each
ticket, write:
- **ID** — short, stable (`t1`, `t2`, ... or a slug)
- **Title** — one line, imperative ("Add file-size validation on upload")
- **Depends on** — ticket IDs that must land first, or "none"
- **Owner** — which `.org/engineers/*.md` this belongs to
- **Acceptance criteria** — pulled directly from the spec, or a subset of it
- **Out of scope** — anything adjacent that's tempting to include but isn't
  this ticket's job

## Step 3 — Order by dependency, not by preference

Compute what's actually unblocked first (no unresolved dependencies) and
present tickets in that order. Flag if any ticket has no clear owner — that's
a sign either the org needs another engineer (re-run `/bootstrap-org`) or the
ticket is scoped wrong.

## Step 4 — Write

Write to `.org/artifacts/tickets/<ticket-id>.md`, one file per ticket, plus
an index at `.org/artifacts/tickets/index.md` listing all tickets with their
dependency graph as a simple ASCII list.

## Completion criteria

Every ticket has explicit dependencies (even if "none"), an owner, and
acceptance criteria traceable to the spec. No ticket is vague enough that
two different engineers would interpret its scope differently.
