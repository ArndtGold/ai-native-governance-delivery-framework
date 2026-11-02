# UAT Report: State Orientation Visibility

Status: accepted
Date: 2026-07-17
Based on: `.agdf/control/artefacts/agdf-state-orientation/QA_REPORT.md`

## Acceptance Scope

Validate that users can see their path through the selected delivery flow, understand what happens
after an accepted gate and receive stable human labels instead of raw internal state values without
changing gate authority or the machine contract.

## Evidence

- QA passed and exact `Approval: QA` is recorded after same-run and same-gate revalidation.
- SO-01 through SO-12 are complete; BT-01 through BT-14, TP Review, Clean Implementation Review,
  Code Review, control-state tests, Runtime Integrity and aggregate smoke pass.
- Fresh AGDF 0.9.8 UAT visibly rendered the derived breadcrumb
  `UR ✓ · PRD ✓ · SD ✓ · TP ✓ · QA ✓ · UAT ●`, the separate transition card and one safe exact-text
  fallback without changing the canonical approval value.
- The user supplied exact `Approval: UAT` for `agdf-state-orientation` on 2026-07-17 after same-run,
  same-gate and revision-10 revalidation.
- The post-acceptance narration is emitted separately after persistence; internal-state collapse
  remains covered by the approved deterministic regression matrix rather than an exhaustive live
  host demonstration.

## Decision

- decision: accepted
- accepted_evidence: visible path orientation, exact approval transport, approved QA evidence and
  deterministic regression coverage for narration and internal-state projection.
- missing_evidence: no blocking evidence gap; exhaustive live rendering of every internal-state
  variant was not required and is not claimed.
- required_next_step: Update `CG-RUN-STATUS-CARD`, produce OR and close the run; VCS and release
  actions require separate explicit instruction.
