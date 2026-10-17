# TODOS

Deferred scope collected by `/plan-eng-review` (Eng runs last in autoplan). Each item
lists what, why, the trade-offs, where to start, and dependencies.

## T1 — Test framework + real-Postgres harness
- **What:** Add Vitest + an ephemeral Postgres harness (`tests/`, `vitest.config.ts`, `package.json` test script).
- **Why:** AD-17 requires real-Postgres integration tests (AS-06/07/08/10/11); the repo has no test runner at all (`package.json:5-10`).
- **Pros:** Unblocks every critical/race/rollback test. **Cons:** Adds a dev dependency and a CI database.
- **Context:** Start in `package.json`; mirror the Podman Postgres already used in dev (`README.md:56-58`).
- **Depends on / blocked by:** none.

## T2 — Request validation (zod)
- **What:** Add zod and validate every `/api/v1` boundary.
- **Why:** Section 4.4 requires server-side validation; `package.json:11-31` has no validation library.
- **Pros:** Uniform 400s, no silent bad input. **Cons:** Small dependency.
- **Context:** One `lib/validation.ts`; wire into route handlers.
- **Depends on / blocked by:** none.

## T3 — Money + timezone helpers
- **What:** One rounding helper (decimal strings, Prisma Decimal) and one UTC↔business-local range helper.
- **Why:** BR-01/BR-05 (money as decimal strings) and BR-25/AS-13 (UTC storage, business-local "today").
- **Pros:** Stops calculation drift across sale/void/reports. **Cons:** Must be adopted everywhere or it fragments.
- **Context:** `lib/money.ts`, `lib/time.ts`.
- **Depends on / blocked by:** T2.

## T4 — Deployment, CI, migrations and rollback policy
- **What:** Pick a deploy target, add CI, a staging environment, a migration policy and a documented rollback.
- **Why:** AD-20 is open; §14 names no platform, CI or backup schedule.
- **Pros:** Safe releases. **Cons:** Setup time before first pilot.
- **Context:** Start with the deploy target and a `migrate deploy` step in CI.
- **Depends on / blocked by:** T1 (CI needs tests).

## T5 — Operational runbooks, alerts, day-1 ops dashboard
- **What:** Day-1 operations dashboard, three alerts, runbooks, operator deletion procedure.
- **Why:** AD-19; the PRD has no operational story for the pilot.
- **Pros:** Tired-at-3am operability. **Cons:** Extra scope before launch.
- **Context:** Begin with the alert thresholds and the deletion procedure.
- **Depends on / blocked by:** T4.

## T6 — DESIGN.md
- **What:** Extract `DESIGN.md` from PRD §11.
- **Why:** AD-21; the Design phase was skipped by user scope, so the design contract is undocumented.
- **Pros:** Shared visual contract before UI build. **Cons:** none material.
- **Context:** Derive from §11; run `/plan-design-review` later.
- **Depends on / blocked by:** none.

## UC-1 — build-before-validate (product)
- **What:** Decide whether to build the full MVP before validating demand.
- **Why:** Carried from the CEO review; not resolvable in Eng.
- **Pros:** Evidence before spend. **Cons:** Slower to a usable product.
- **Context:** Customer discovery / willingness-to-pay first.
- **Depends on / blocked by:** product decision.

## UC-2 — online-only vs top risk R2 (product)
- **What:** Reconcile the online-only MVP against connectivity as the top-ranked risk.
- **Why:** Carried from the CEO review; affects the sale path architecture.
- **Pros:** Simpler sync model. **Cons:** Risk R2 materializes in the field.
- **Context:** Manual/offline sale handling decision.
- **Depends on / blocked by:** product decision.
