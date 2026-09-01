# UR: Doctor and Presentation Identity-Validation Parity

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation.
Revision: 1
Date: 2026-09-01
Owner: agent

## 1. Problem

`doctor` and the interaction-presentation layer disagree about what makes a run state presentable, and the presentation layer fails silently when its stricter requirements are not met.

`evaluateDoctor` (`create-agdf/lib/control-evaluation/doctor.js`) checks the selected run state only for a placeholder `current_gate`, a placeholder `next_allowed_action` and a filled evidence row (the last one merely `warn`). It validates neither the format of the `run_id` nor the presence of a `revision_id` in the selected run state content.

The presentation layer requires both hard:

- `buildApprovalOrientationSnapshot` (`create-agdf/lib/interaction-presentation.js`) returns `null` when the `run_id` does not match `/^[A-Za-z0-9._-]+$/`;
- `validateApprovalOrientationSnapshot` reports `revision_identity` when the `revision_id` is empty;
- `renderApprovalOrientationSnapshot` and `renderOperationalStatusCard` return bare `null` on validation failure and discard the concrete `errors` array — no finding, no log, no fallback hint.

The canonical run parser (`parseRunState`) does validate `RUN_ID_PATTERN` and a UUID `revision_id`, but only for canonical `.agdf/control/runs/<id>/RUN_STATE.md` records. The doctor evaluation path reads the selected content through `parseControlState` without that meta validation, and `gate-check` extracts `revision_id` via `extractField` without producing a finding when it is missing. A legacy `AGDF_RUN.md` state without a `revision_id`, or with a `run_id` containing characters outside the presentation pattern, therefore passes `doctor` with at most `warn` while the approval/status card silently collapses to `null`.

Observed effect: `doctor` reported the state as merely `warn` while the interaction card was silently dropped, leaving the user without any card and without any diagnosis of why.

## 2. Goal

`doctor` (and the gate-check evidence it feeds) must fail closed on the same identity requirements the presentation layer enforces, and a card that cannot be rendered must surface its concrete validation errors instead of disappearing silently. A state that `doctor` reports as presentable must actually be presentable; a state that is not must name the exact identity defect and the repair step.

## 3. Scope

After the required approvals, deliver the smallest safe change that:

1. adds identity findings to the doctor evaluation path for the selected run state: `run_id` violating the presentation pattern and missing/empty `revision_id`, each with severity at least `revise` and a concrete repair `next_step` (e.g. `run-migrate`);
2. keeps the finding vocabulary aligned with the existing canonical parser codes (`AGDF_RUN_ID_INVALID`, `AGDF_RUN_REVISION_ID_INVALID`) instead of inventing a parallel code family;
3. makes the renderer failures diagnosable: `renderApprovalOrientationSnapshot` / `renderOperationalStatusCard` (and the call sites that currently swallow `null`) must expose the concrete validation errors to the caller so a dropped card becomes a visible finding or fallback message rather than silence;
4. keeps `doctor`/`gate-check` verdicts and presentation preconditions derived from one shared source of truth for the identity requirements (single pattern and requirement definition, no second divergent copy);
5. covers the gap with tests: a legacy/content-path state without `revision_id` and with a non-conforming `run_id` must yield doctor findings and a non-silent renderer outcome;
6. updates generated surfaces via the canonical sync owner where runtime files are mirrored; no hand-edit of generated copies.

## 4. Non-Goals

- changing the canonical run-state schema, gate order, approval values or authority model;
- relaxing the presentation layer's identity requirements (the fix raises doctor to parity, not presentation down);
- migrating or rewriting existing legacy `AGDF_RUN.md` states beyond what the existing `run-migrate` path already offers;
- redesigning the interaction contract, locale registry or card layout;
- performing commit, push, PR, release or publication as part of this run.

## 5. Acceptance Signals

1. A run state whose `run_id` violates the presentation pattern produces a doctor finding naming the pattern and a repair step.
2. A run state without a `revision_id` produces a doctor finding; `doctor` no longer reports such a state as merely `warn` while the card is undeliverable.
3. When card rendering fails validation, the concrete `errors` array reaches the caller and is surfaced (finding, fallback message or structured result), never a bare silent `null`.
4. The identity requirements used by doctor and by the presentation layer are defined once and consumed by both.
5. Tests cover the legacy/content path for both defects and the renderer error surfacing.
6. No new gate, approval value or schema field is introduced.

## 6. Existing Source Of Truth

- `create-agdf/lib/control-evaluation/doctor.js` — doctor evaluation path to extend;
- `create-agdf/lib/control-evaluation/run-state.js` — `readRunState` content path without meta validation;
- `create-agdf/lib/control-evaluation/gate-check.js` — `revision_id` extraction without finding;
- `create-agdf/lib/interaction-presentation.js` — presentation-side identity requirements and silent `null` returns;
- `create-agdf/lib/control-state/run-state-parser.js` — `RUN_ID_PATTERN`, canonical finding codes `AGDF_RUN_ID_INVALID` / `AGDF_RUN_REVISION_ID_INVALID`;
- `create-agdf/scripts/sync-plugin-runtime.js` / `create-agdf/generated/` — generated-surface propagation.

## 7. Risks And Unknowns

- The presentation pattern (`/^[A-Za-z0-9._-]+$/`) and the canonical `RUN_ID_PATTERN` (`/^[a-z0-9][a-z0-9._-]{0,127}$/`) differ (case, leading character, length); Brownfield Review must decide which one is authoritative for doctor findings and whether the divergence itself is part of the defect.
- Raising the two identity defects to `revise`/`block` may newly block existing legacy states that previously passed with `warn`; the severity choice must weigh fail-closed correctness against disruption of active runs.
- Changing renderer return shapes (`null` → structured error result) touches call sites across CLI rendering and possibly generated runtime copies; the inventory of consumers must come from Brownfield Review, not assumption.
- Whether other renderers in `interaction-presentation.js` (`renderTaskTargetOrientation`, `renderScopeClassificationCard`) share the silent-`null` defect and belong in scope must be decided explicitly.

## 8. Next Step

Perform Brownfield Review and select the smallest safe delivery path before drafting later artefacts or implementation. Approve only with:

`Approval: UR`
