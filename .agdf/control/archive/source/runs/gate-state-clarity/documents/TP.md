# Task/Test Plan: Gate State Clarity

## Status

- status: approved
- approval: Approval: TP (2026-07-10)
- derived_from: PRD and SD for `gate-state-clarity`
- created_at: 2026-07-10

## Objective

Implement additive gate/status clarity fields without changing AGDF gate order, approval formulas or implementation authority semantics.

## Task Plan

| Task ID | Area | Task | Acceptance Evidence |
|---|---|---|---|
| T01 | Gate-check report model | Add additive `next_gate_after_approval` and `allowed_after_approval` fields to gate-check JSON output and `status_card`. | `gate-check --json` fixture for a missing-approval user gate exposes deterministic field values while existing fields remain present. |
| T02 | Transition derivation | Implement a small helper in the existing gate-check owner that derives immediate post-approval transition metadata from the current transition decision and missing approval. | Smoke tests prove `Approval: PRD` maps to `SD`, and missing/none approvals map to `none`. |
| T03 | Status-card output | Print `Next gate after approval` and `Allowed after approval` only when useful values exist. | `gate-check --status-card` missing-approval fixture includes the new lines; internal-step and OR fixtures omit them. |
| T04 | Current-authority wording | Keep `Allowed now` and `Forbidden now` semantics unchanged and make sure post-approval wording does not imply implementation authority. | PRD-gated smoke fixture asserts allowed-now text still forbids implementation and allowed-after-approval text only unlocks SD drafting. |
| T05 | Runtime contract | Update authoritative runtime-contract wording to define current authority, missing approval, next step, next gate after approval and allowed after approval. | Runtime integrity check passes and generated package output syncs from `plugin/`. |
| T06 | Durable status guidance | Update AGDF run-status/template guidance if required so durable status cards can carry the same semantics. | Smoke/runtime checks pass; no generated output is edited as an independent source. |
| T07 | Regression coverage | Extend `create-agdf/scripts/smoke-test.js` for one missing-approval user gate, one internal-step case and one OR/completed handoff case. | Smoke test covers all three cases and remains green. |

## Test Plan

| Test ID | Covers | Method | Expected Result |
|---|---|---|---|
| TT01 | T01, T02, T03, T04 | Add or extend a PRD-gated gate-check fixture in `create-agdf/scripts/smoke-test.js`. | JSON/status-card show `next_gate_after_approval: "SD"` and allowed-after-approval text while implementation stays forbidden now. |
| TT02 | T01, T02, T03 | Add or extend a Brownfield Review/internal-step fixture. | JSON/status-card show no post-approval transition fields or report them as `none`. |
| TT03 | T01, T02, T03 | Add or extend an OR/completed handoff fixture. | JSON/status-card show no misleading post-approval transition fields. |
| TT04 | T05, T06 | Run runtime integrity and package smoke checks. | Runtime contract, templates and generated output remain synchronized. |

## Required Validation

- `npm --prefix create-agdf run smoke-test`
- `node plugin/scripts/check-runtime-integrity.mjs`
- `npx --yes @agdf/cli@latest doctor --json`
- `git diff --check`

## Review Gates After Implementation

After `Approval: TP`, implementation must be preceded by implementation-prep Brownfield Analysis. After code changes, run Task Plan Review, Clean Implementation Review and Code Review before QA.

## Out Of Scope

- Changing gate order or approval formulas.
- Treating implicit consent as approval.
- Letting post-approval text unlock implementation, QA, release or VCS actions.
- Creating a parallel gate model or new status engine.
- Removing or renaming existing JSON fields.

## Approval Request

Exact approval required to start implementation preparation:

`Approval: TP`
