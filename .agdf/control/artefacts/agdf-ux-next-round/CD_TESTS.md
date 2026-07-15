# CD+Tests: Guided AGDF UX Interaction Delivery

Status: done
Gate: CD+Tests
Based on: approved `TP.md` and passed `BROWNFIELD_ANALYSIS.md`
Date: 2026-07-15
Owner: AGDF

## Delivered behavior

- Ambiguous active runs now expose a bounded, active-only candidate projection
  through `gate-check --json`: stable run ID, display-safe artifact title,
  current gate, next action and revision ID. It remains clarification-only.
- Interaction-attempt receipts validate the four presentation outcomes and are
  immutable, explicitly non-authoritative values.
- The Runtime Contract and `gate-check` guidance require a visible native
  presentation outcome and an exact-text fallback that preserves authority.
- The AGDF-owned Pages skill surface groups the same skill identifiers into
  `Start here`, `Used automatically` and `Optional`, and discloses that host
  catalogues can remain flat.

## Task evidence

| task_id | Status | Evidence |
|---|---|---|
| UX-01 | done | `buildRunCandidates` filters active valid runs, uses artifact headings before a normalized run-ID fallback, sorts deterministically and is returned for ambiguous `gate-check` state. Focused tests cover filtering, titles and order. |
| UX-02 | partial | Immutable, non-authoritative attempt receipts and outcome validation are implemented and tested. A host-adapter invocation path does not exist in this repository to consume the receipt directly. |
| UX-03 | partial | Runtime Contract and gate-check guidance are aligned and generated assets synchronize. Locale-registry keys and negative drift fixtures for this copy contract are not yet implemented. |
| UX-04 | partial | The no-retry, exact-text fallback and explicit-reopen semantics are specified in canonical guidance. Dedicated pre-artefact/reopen fixtures are not yet present. |
| UX-05 | partial | Pages groups every local skill once and preserves IDs. The classification currently lives in the Pages data projection rather than the canonical plugin definition. |
| UX-06 | not_done | Existing Pages copy discloses host-owned catalogue limits, but expected/observed/session-unverified version and screenshot labels are not implemented. |
| UX-07 | done | Focused, integrity, Pages and aggregate smoke checks pass; generated assets were synchronized. |
| UX-08 | partial | No live host rendering was claimed or inferred. Native-host observation remains explicitly unverified because no callable host session was available. |

## Test evidence

| Check | Result | Evidence |
|---|---|---|
| Interaction presentation | pass | `node create-agdf/scripts/interaction-presentation-test.js` |
| Control state | pass | `npm --prefix create-agdf run test:control-state` |
| Package interaction test | pass | `npm --prefix create-agdf run test:interaction-presentation` |
| Asset synchronization | pass | `npm --prefix create-agdf run sync-package-assets` |
| Runtime integrity | pass | `node plugin/scripts/check-runtime-integrity.mjs` — 9 skills and 15 control files checked |
| Pages type check | pass | `npm --prefix pages run check` — 0 errors, 0 warnings, 0 hints |
| Pages build | pass | `npm --prefix pages run build` |
| Aggregate package smoke | pass | `npm --prefix create-agdf run smoke-test` — focused checks, smoke and routing passed |
| Whitespace | pass | `git diff --check` |

## Evidence boundary

Deterministic checks prove the code and generated-surface behavior listed
above. They do not prove a host rendered a native control, the installed host
version, or the historical context of a screenshot. Those surfaces remain
unverified until observed directly.

## Required next step

Task Plan Review, Clean Implementation Review and Code Review are complete in
their linked artefacts. Run QA with the declared partial and missing TP
coverage; QA must not pass UX-06 or live-host evidence by inference.

## QA-Revise Control Delta (2026-07-15)

- Added a single transition guard that treats the existing QA artefact status
  `revise` as remediation-only: no missing QA approval, no approval action and
  no UAT transition are projected.
- Added a hermetic CLI regression fixture proving that the Gate-Check JSON and
  Status Card expose `qa_revise_required`, `missing_approval: none`, no next
  gate/user action and explicit QA/UAT/release prohibitions.
- Validation: `npm --prefix create-agdf run test:control-state`,
  `node create-agdf/scripts/interaction-presentation-test.js`,
  `node plugin/scripts/check-runtime-integrity.mjs`, selected-run Gate Check
  and `git diff --check` all pass.
- The delta resolves `P1_QA_REVISE_APPROVAL_PROJECTION_CONFLICT`; it does not
  resolve the remaining UX-02 through UX-06 or UX-08 TP coverage gaps.

## Remediation Delta (2026-07-15)

- UX-02/04: Interaction fixtures cover every permitted presentation outcome,
  preserve the exact expected approval, freeze the receipt and prove it cannot
  authorize. Existing control-state fixtures cover pre-artefact and stale/non-
  approval rejection.
- UX-05: `plugin/meta/agdf-plugin.definition.json` is the canonical discovery
  owner. Pages derives each grouping from `skillSet`.
- UX-06: Pages visibly label expected release, observed-install state
  (`session-unverified`) and the screenshot evidence boundary.
- Validation: Pages check/build, asset synchronization, runtime integrity,
  interaction presentation, control-state and `git diff --check` pass.

## UX-03 Drift-Coverage Refresh (2026-07-15)

- Runtime Integrity now requires the canonical Runtime Contract to name
  `attempted_not_applied` and `unsafe_to_wait`, and gate-check to retain the
  visible-outcome and explicit-reopen/no-retry contract.
- Negative fixtures prove that removal of either contract anchor fails; the
  existing negative fixture proves missing German locale interaction copy fails.
- Validation: `node create-agdf/scripts/runtime-integrity-negative-test.js`,
  Runtime Integrity, full package smoke and `git diff --check` pass.

## Shared Pages Scope Reconciliation (2026-07-15)

- The later completed `quality-readiness-surface` slice refined the skill-role
  copy in `pages/src/data/skills.ts`, a shared path in this run's approved
  discovery-clarity scope.
- The delta preserves this run's canonical discovery ownership and does not
  add a gate, approval or host-rendering claim. It is a compatible refinement,
  not an unrecorded scope expansion.
- Revalidation: interaction-presentation and control-state tests, Runtime
  Integrity, Pages type check, Pages production build and `git diff --check`
  pass on the combined current tree.
