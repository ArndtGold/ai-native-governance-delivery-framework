# PRD: Doctor and Presentation Identity-Validation Parity

Status: approved
Gate: PRD
Gate approval: revision 1 approved with exact `Approval: PRD` on 2026-09-01 after same-run, same-gate and revision revalidation
Revision: 1
Date: 2026-09-01
Run: `doctor-presentation-identity-parity`
Derived from: approved UR revision 1 and Brownfield Review 2026-09-01 (structured_slice)

## 1. Product Outcome

A run state that `doctor` reports as presentable is actually presentable, and a card that cannot be
rendered names its concrete validation errors instead of disappearing silently. The identity
requirements (`run_id` format, `revision_id` presence) are defined once, consumed by both the doctor
evaluation path and the interaction-presentation layer, and enforced identically on the canonical and
the legacy/content parse path.

## 2. Users And Needs

- A run operator needs `doctor` to name an identity defect (invalid `run_id`, missing `revision_id`)
  with a concrete repair step before the defect silently suppresses the approval or status card.
- An agent driving a gate decision needs the gate-check report to state why an approval presentation
  is unavailable instead of receiving a bare `null`.
- A maintainer needs exactly one identity-requirement definition so doctor verdicts and presentation
  preconditions cannot drift apart again.
- A legacy-state owner needs the finding to point to the existing deterministic repair
  (`run-migrate`), not to a manual guessing game.

## 3. Functional Requirements

### DIP-01 Single identity-requirement owner

The `run_id` format requirement and the `revision_id` requirement must have exactly one code owner:
the canonical run-state parser module (`create-agdf/lib/control-state/run-state-parser.js`, which
already owns `RUN_ID_PATTERN` and the UUID `revision_id` check). The interaction-presentation layer
must consume this owner (imported pattern or exported identity-validation helper) and must not retain
its own inline `run_id` regex. The canonical pattern `/^[a-z0-9][a-z0-9._-]{0,127}$/` is
authoritative; the presentation-side ad-hoc superset `/^[A-Za-z0-9._-]+$/` is retired.

### DIP-02 Identity validation at the parse boundary

The legacy/content read path used by doctor and gate-check (`readRunState` →
`parseControlState`) must apply the same Run-Meta identity validation that `parseRunState` already
applies to canonical run records, producing the existing finding codes `AGDF_RUN_ID_INVALID` and
`AGDF_RUN_REVISION_ID_INVALID`. No doctor-local duplicate checks and no new finding-code family are
introduced.

### DIP-03 Doctor findings with repair step

`doctor` must surface both identity defects for the selected run state as findings with severity
`revise` (consistent with the existing `AGDF_CURRENT_GATE_MISSING` / `AGDF_NEXT_ALLOWED_ACTION_MISSING`
vocabulary for repairable content defects) and a `next_step` that names the deterministic repair path
(`run-migrate` or equivalent). A state with either defect must not be reported as merely `warn`.

### DIP-04 Renderer failures become diagnosable without signature breaks

The renderers keep their fail-closed semantics (invalid input ⇒ no card). The callers must stop
swallowing the reason:

- `gate-check` must run the exported `validateApprovalOrientationSnapshot` before consuming
  `renderApprovalOrientationSnapshot`; on failure, the concrete `errors` array must appear as a
  machine-readable field in the gate-check report (e.g. `approval_presentation_errors`) and the
  localized `interaction.presentationFailure` copy must be used as the visible fallback text.
- `renderOperationalStatusCard` must get an exported precondition check following the same pattern,
  consumed the same way at its call site.
- A dropped card must therefore always be accompanied by its concrete validation errors in the JSON
  report; a bare silent `null` without diagnosis is a defect.

### DIP-05 Sibling renderers only if mechanism-free

`renderTaskTargetOrientation` and `renderScopeClassificationCard` receive the same caller-side
error surfacing only if the identical mechanism covers them without additional design; otherwise they
remain an explicit non-goal of this run and the exclusion is recorded in the Solution Design.

### DIP-06 Parity is testable

Tests must cover, on the legacy/content path: a state with a `run_id` violating the canonical
pattern, and a state without a `revision_id`. Each must yield the corresponding doctor finding with
severity `revise`, and the gate-check report for such a state must contain the presentation error
diagnosis instead of a silent missing card. A regression test must assert that the presentation layer
contains no second `run_id` pattern definition (single-owner import).

### DIP-07 Deterministic propagation and authority preservation

Generated runtime copies under `create-agdf/generated/**` are updated only through the canonical sync
owner (`sync-plugin-runtime.js`); no hand-edits. Gate order, approval values, `schema_version`,
control-state schema, locale-registry structure and public CLI syntax remain unchanged; the JSON
reports change additively only (new findings reusing existing codes, new error field).

## 4. Acceptance Criteria

| ID | Acceptance criterion |
|---|---|
| AC-01 | A legacy/content run state whose `run_id` violates the canonical pattern yields doctor finding `AGDF_RUN_ID_INVALID`, severity `revise`, with a repair `next_step`. |
| AC-02 | A legacy/content run state without a valid `revision_id` yields doctor finding `AGDF_RUN_REVISION_ID_INVALID`, severity `revise`, with a repair `next_step`; doctor status for such a state is at least `revise`, never merely `warn`. |
| AC-03 | `interaction-presentation.js` contains no own `run_id` regex; its identity checks resolve to the parser-owned definition, proven by a structural regression test. |
| AC-04 | When approval-presentation validation fails, the gate-check JSON report contains the concrete `errors` array and the rendered fallback uses `interaction.presentationFailure`; no code path returns a dropped card without accompanying errors. |
| AC-05 | `renderOperationalStatusCard` unavailability is equally diagnosable via an exported precondition check consumed at the call site. |
| AC-06 | Every canonical-pattern-valid `run_id` renders exactly as before; existing valid states produce byte-identical cards (no behavior change for healthy input). |
| AC-07 | Existing suites (`test:interaction-presentation`, `test:control-state`, `test:lifecycle`, `test:cli-modularization`, Runtime Integrity, aggregate smoke) pass without weakened assertions. |
| AC-08 | Generated mirrors match a fresh canonical sync; `git diff --check` clean; no hand-edited generated file. |
| AC-09 | No new gate, approval value, finding-code family, schema field removal or `schema_version` change; JSON changes are additive. |
| AC-10 | The sibling-renderer scope decision (in or out per DIP-05) is recorded explicitly in the Solution Design. |

## 5. Non-Functional Requirements

- Maintainability: one identity-requirement owner; no duplicated pattern constants anywhere.
- Auditability: identity defects and presentation failures are machine-readable in `doctor --json`
  and `gate-check --json`.
- Safety: fail-closed — unknown or invalid identity never renders an approval card; diagnosis is
  added, permissiveness is not.
- Compatibility: healthy states, existing consumers and localized copy behave unchanged; changes to
  JSON reports are additive.
- Determinism: identical inputs produce identical findings, errors and cards.

## 6. Explicit Non-Goals

- Relaxing presentation identity requirements or rendering cards for invalid identities.
- Rewriting or auto-migrating existing legacy run states (repair remains the existing `run-migrate`).
- Changing renderer function signatures, card layout, locale-registry schema or interaction contract.
- New finding codes, severities, gates, approval values or schema fields.
- Commit, push, PR, release or publication as part of this run.

## 7. Evidence Plan

- New test cases per DIP-06 (invalid `run_id`, missing `revision_id`, error-surfacing on the
  gate-check report, single-owner structural check).
- Before/after `doctor --json` and `gate-check --json` output for a reproduced defective legacy state
  demonstrating `warn`-with-silent-card-loss → `revise`-with-diagnosed-card-loss.
- Unchanged-output proof for a healthy state (existing envelope snapshot tests).
- Full existing regression and smoke evidence per AC-07, sync determinism per AC-08.

## 8. Open Design Questions

- Does the shared identity validation live as an exported helper in `run-state-parser.js` or as a
  small shared module both layers import? (Owner stays the parser side either way.)
- Exact shape and name of the additive gate-check error field (`approval_presentation_errors` vs a
  structured `presentation_diagnostics` object also carrying the status-card precondition result).
- Whether the sibling renderers fall inside the same mechanism without extra design (DIP-05).

These are Solution Design decisions. They do not weaken the acceptance criteria.

## 9. Next Step

Review this PRD and approve only with:

`Approval: PRD`
