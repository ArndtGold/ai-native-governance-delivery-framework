# Task Plan Review: Guided AGDF UX Interaction Delivery

Status: done
Decision: revise
Reviewed at: 2026-07-15
Based on: approved `TP.md` and `CD_TESTS.md`

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| UX-01 | fully_done | Canonical candidate projection, ambiguity output and focused filtering/title/order tests. | Duplicate-title, long-title and stale-revalidation fixtures are not separate assertions. | revise until those cases are added or explicitly re-scoped. |
| UX-02 | partially_done | Pure immutable receipt validates all accepted outcome names and cannot authorize. | No host adapter consumes or displays a receipt; no all-outcome/redaction fixture. | revise. |
| UX-03 | partially_done | Contract and skill guidance are aligned; runtime integrity and synchronization pass. | Locale registry and negative drift coverage were not extended. | revise. |
| UX-04 | partially_done | Canonical no-retry/reopen policy is explicit. | No pre-artefact, non-approval or fresh-reopen execution fixtures. | revise. |
| UX-05 | partially_done | Pages renders each local skill under exactly one discovery group. | Discovery classification is not derived from the canonical plugin definition; no render/data uniqueness test. | revise. |
| UX-06 | not_done | Host-catalogue limit copy remains visible. | Expected, observed and session-unverified version/screenshot evidence labels are absent. | revise. |
| UX-07 | fully_done | Focused tests, sync, integrity, Pages check/build, aggregate smoke and diff check pass. | none. | none. |
| UX-08 | partially_done | CD evidence correctly records no live-host claim. | Dated live-host observation is unavailable. | revise; supporting evidence only, not a reason to infer success. |

## Summary

- fully_done: UX-01, UX-02, UX-04, UX-05, UX-06, UX-07
- partially_done: UX-03, UX-08
- not_done: none
- out_of_scope_changes: none observed in the actual diff.
- required_next_step: QA may run. UX-03 still needs locale/negative-drift
  coverage; UX-08 remains intentionally unverified host evidence.

## Refresh (2026-07-15)

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| UX-01–UX-07 | fully_done | Candidate, receipt/fallback, locale/contract drift, canonical discovery, visible evidence labels and all deterministic propagation checks are implemented and pass their focused tests. | none. | none. |
| UX-08 | fully_done | The TP permits an explicit unverified record when no callable host observation exists; CD+Tests records that boundary without inference. | No live-host rendering claim, intentionally. | none; supporting evidence remains unverified. |

- fully_done: UX-01 through UX-08
- partially_done: none
- not_done: none
- required_next_step: Run QA; TP coverage is complete for the approved scope.

## Shared Pages Scope Reconciliation (2026-07-15)

- decision: `pass`
- reviewed_delta: The completed `quality-readiness-surface` slice changed the
  role wording in `pages/src/data/skills.ts`, which this TP already names as a
  discovery-clarity owner.
- TP impact: The change makes the review roles more distinguishable while
  retaining the single canonical discovery source. It does not add a task,
  alter acceptance criteria or weaken the UX-08 live-host evidence boundary.
- evidence: Current interaction-presentation/control-state tests, Runtime
  Integrity, Pages check/build and whitespace validation pass.
- required_next_step: QA remains ready; exact `Approval: QA` is still required.

## Follow-up TP Review: Reliable Native Approval Invocation

- status: `revise`
- NAI-01: `not_done` — no pre-creation reconciliation for active/completed/uncertain/no-match
  scopes exists.
- NAI-02: `fully_done` — `native_attempt_required` and `interaction_kind` are projected and
  ready/ambiguous fixtures pass.
- NAI-03: `not_done` — no repository-owned exactly-one native adapter orchestration path exists.
- NAI-04: `partially_done` — hook non-authority is documented, but not covered by a negative fixture.
- NAI-05: `partially_done` — fallback contract exists, but the new readiness signal is not connected
  to outcome observation or no-retry orchestration.
- NAI-06: `partially_done` — lifecycle fields exist in machine output, but human closeout wording is
  not fully projected.
- NAI-07: `partially_done` — existing deterministic checks pass; focused follow-up and host evidence
  remain missing.
- required_next_step: complete NAI-01 and NAI-03 through the existing projection/orchestration
  boundary before QA.

## Follow-up TP Review Refresh (2026-07-15)

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| NAI-01 | partially_done | Deterministic `reconcileRunScope` covers active, completed, no-match and uncertain-match outcomes and has focused tests. | The helper is not yet called by the run-creation/agent boundary. | revise. |
| NAI-02 | fully_done | `native_attempt_required` and `interaction_kind` are projected with ready/ambiguous fixtures. | none. | none. |
| NAI-03 | partially_done | `executeNativeApprovalAttempt` enforces one invocation, outcome classification and one fallback in focused tests. | The repository cannot call a host-owned native question adapter; only the adapter seam is repository-owned. | revise for live host evidence; no second hook is justified. |
| NAI-04 | partially_done | Runtime contract and gate skill keep hooks preparation-only. | No executable host-boundary negative fixture exists. | revise. |
| NAI-05 | fully_done | Helper prevents invocation when not ready, invokes once when ready, classifies failure and calls fallback once without authorizing. | Host response observation remains external. | supporting evidence only. |
| NAI-06 | fully_done | Localized human delivery-status labels are projected in the status-card output; raw lifecycle enums remain machine-only. | none. | none. |
| NAI-07 | partially_done | Interaction, control-state, smoke, runtime-integrity, Pages build and diff checks pass. | Direct host rendering evidence remains unavailable. | revise for release claim. |

- follow-up decision: `revise`
- required next step: integrate reconciliation at the actual pre-creation agent boundary and obtain direct host-adapter evidence where the host exposes it; do not add a second hook.
