# User Requirement: Add A Fail-Closed Verified Change Path

## Work Item

- key: `verified-change-path`
- title: Add a fail-closed Verified Change path between Trivial Change and Structured Slice
- status: approved
- approval: `Approval: UR`

## User Need

AGDF must preserve strict governance where ownership, impact or evidence are uncertain, while avoiding a full structured-delivery pipeline for a small, user-visible change whose owner, allowed files, deterministic propagation and acceptance checks are all known. The recently completed README/default-prompt change demonstrated that the current boundary treats a compact, mechanically verifiable metadata-and-copy change as a full structured slice.

## Desired Behavior

Introduce `verified_change` as a distinct, fail-closed Mode/Slice Decision between the existing Trivial Change boundary and `structured_slice`.

A Verified Change may proceed after an approved UR and Brownfield Review with one compact change record, implementation, deterministic validation and a mini-closeout. It must not require PRD, SD, TP, separate pre-implementation Brownfield Analysis, QA or UAT when every eligibility condition is mechanically evidenced. Any failed, unknown or ambiguous condition must route the work to the existing `structured_slice` or `structured_delivery` path before implementation.

## Acceptance Criteria

1. The Runtime Contract defines `verified_change`, its compact artefact shape, exact lifecycle, permitted work and mandatory mini-closeout.
2. Eligibility is fail-closed and machine-checkable where possible. It must require a single canonical owner, bounded approved files, no change to gates/permissions/persistence/security/architecture/CLI behavior, deterministic propagation where derived surfaces exist, and passing relevant checks.
3. A user-visible but bounded metadata/copy change with an existing canonical owner and deterministic integrity validation can qualify; unbounded wording, unclear ownership or missing checks cannot.
4. The gate transition model, control-state parser, status output, templates and agent guidance recognize `verified_change` without creating a second gate model.
5. `doctor` or an equivalent deterministic validation detects malformed or invalid Verified Change control records and fails closed.
6. Regression tests cover one qualifying path, key disqualifiers and escalation to structured delivery.
7. Existing Trivial Change, Quick Task and Structured Slice/Delivery behavior remains compatible and protected by regression tests.
8. Runtime-contract, template and generated-surface copies remain synchronized; runtime-integrity and package smoke checks pass.

## Scope Boundary

In scope: the governance model, templates, parser/transition behavior, deterministic validators, agent guidance, generated-surface propagation and regression tests required to make Verified Change a trustworthy path.

Out of scope: weakening existing gates globally, retroactively reclassifying completed runs, changing external agent APIs, adding a new plugin surface, commits, pushes, pull requests or releases.

## Evidence And Approval

- observed trigger: `.agdf/control/artefacts/agdf-onboarding-fit-readme-clarity/OR.md` documents a small, validated README/default-prompt scope that required the full structured-slice chain.
- existing boundary decision: `.agdf/control/CONTEXT_GRAPH.md` node `CG-DOCUMENTATION-CEREMONY-BOUNDARY`.
- approval: `Approval: UR` received on 2026-07-14.
