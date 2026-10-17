---
name: spec
description: Turn the current conversation, or a fresh grilling session, into a written spec artifact with explicit acceptance criteria. User-invoked.
---

# Spec

A spec is the contract between "what was discussed" and "what gets built."
If the conversation already resolved the ambiguity, synthesize — don't
re-interview. If it didn't, invoke `/grill` first.

## Invocation

User-invoked. Typically the second step after `/grill`, but callable
standalone if the user already knows exactly what they want.

## Step 1 — Check for existing resolution

Scan the conversation so far. If the core questions (what, who, why, scope,
non-goals, acceptance criteria) are already answered, proceed to Step 2
directly. If not, run the `/grill` method on whatever's missing — don't
re-ask what's already been answered.

## Step 2 — Write the spec

Produce `.org/artifacts/spec-<short-name>.md` satisfying
`.org/contracts/spec-contract.md`. Required sections:

- **Objective** — one sentence
- **Context** — why this is being built now, one short paragraph
- **In scope** — concrete, bulleted
- **Out of scope** — equally concrete; this is as important as in-scope
- **Acceptance criteria** — checkable outcomes, not procedures. Write these
  as things `/qa` can literally verify later ("uploading a file over 10MB
  shows an error toast within 2s"), not vague goals ("handles large files
  well").
- **Open questions** — anything genuinely undecided, flagged for the human,
  not silently resolved by assumption

## Step 3 — Confirm before publishing

Show the spec. Ask for confirmation or edits. Do not treat silence as
approval — get an explicit yes.

## Completion criteria

`.org/artifacts/spec-*.md` exists, every acceptance criterion is phrased as
something checkable (not a procedure or a vibe), and the user has explicitly
confirmed it before you consider this done.
