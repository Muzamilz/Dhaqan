---
name: architect
description: Propose an architecture for a spec or ticket, get explicit human approval before implementation starts. Model-invoked from workflows, or run directly by the user.
---

# Architect

Architecture decisions are collaborative, not autonomous. You propose, the
human approves or revises — never skip straight to implementation on a
non-trivial change.

## Invocation

Model-invoked as a workflow step (see `.org/workflows/*.md`) or user-invoked
directly. Skip this skill entirely for trivial tickets — check
`.org/workflows/*.md` for the project's own threshold, and if none is
defined, use this default: skip for single-file changes with no new
dependencies or data model changes; run it for anything else.

## Step 1 — Read context

Read the relevant `.org/artifacts/spec-*.md` or ticket, the engineer
definition in `.org/engineers/` that owns this area (their "owns" boundary
matters — don't propose changes outside it without flagging that explicitly),
and `.org/policies.md` for any architecture constraints already agreed.

## Step 2 — Propose

Produce a concrete architecture proposal satisfying
`.org/contracts/architecture-contract.md`, not a menu of options unless the
tradeoffs are genuinely close. Include:

- **Data flow** — as an ASCII diagram or ordered steps, not prose alone
- **State changes** — what's created, mutated, deleted, and where
- **Failure modes** — what breaks, how it's detected, how it recovers
- **Test seams** — where tests will attach; this becomes a *contract* that
  `/tdd` and `/implement` must honor later, not a suggestion
- **What this explicitly does not solve** — scope boundary, matching the
  ticket's own scope

## Step 3 — Get approval

Present the proposal and stop. Do not proceed to implementation in the same
turn. Accept: approve as-is, approve with edits, or reject with reasons (in
which case, revise and re-propose — don't argue).

## Step 4 — Publish

Write the approved proposal to `.org/artifacts/architecture-<ticket-id>.md`.
Once published, treat it as immutable — a later change is a new version
(`architecture-<ticket-id>-v2.md`), not an edit, so the trail stays
inspectable.

## Completion criteria

An `.org/artifacts/architecture-*.md` file exists, was shown to the user
before being written, and was explicitly approved (not just "looks fine, go
ahead" without the user having actually read the diagram/seams).
