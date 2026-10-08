# Brownfield Review: Stale next step after internal step recording

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: status-card-stale-next-action-20261008-01
- related_ur: `.agdf/control/artefacts/status-card-stale-next-action-20261008-01/UR.md` (approved, revision 3)
- current_gate: Brownfield Review
- reviewer: Claude Code implementing agent (cooperative review, not independent proof)
- reviewed_at: 2026-10-08

## Objective

Size and route the approved UR. After an internal step is recorded, the run must show and route on a next step that belongs to the evaluated current gate, without regressing run-specific next-step text.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: Only the status card's next-step line (and the same value in the gate-check report, the cockpit and the backlog) changes, and only in stale states. There it is brought in line with the gate and the allowed and forbidden lists the card already shows. Working modes, actions, activation and recovery semantics stay unchanged and unambiguous.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Gate transition model in `plugins/agdf/meta/contracts/gate-transition.md` | The table already defines "Brownfield Analysis passed for approved TP → `CD+Tests`". The fix restores that behavior and adds no semantics. | `none` |
| Source of truth | `packages/core/lib/control-evaluation/gate-policy.js:238-261` (evaluated decision); persisted `next_allowed_action` in each `RUN_STATE.md` | `gate-check.js:333-337` and `delivery-map.js:228` prefer the persisted text unless it is a placeholder. Verified Change and source revisions already bypass the persisted text (commit 8c4d3d95). | `medium` |
| Runtime path | `packages/core/lib/skill-dispatch/service.js:474-476` (implementation continuation); `gate-check.js:447-452` (`continuePostTpWork`) | Both compare the next-step text exactly. With stale text, `continue_delivery` returns a terminal status card (observed on `agdf-cockpit-claude-host-20261008-01`). | `medium` |
| UI / UX | Status card via `buildStatusCard` / `interaction-presentation.js`; cockpit `control-inspect/cockpit.js:56-107` | The card shows the evaluated gate and lists but the persisted next step. The cockpit already exposes evaluated and persisted fields separately. | `low` |
| Persistence / data | `run-update` = `recordRunRevision` in `packages/core/lib/control-state/run-recording.js:84-114` | Re-seals hand-edited content (`allowContentChange: true`) without recomputing `current_gate`, `next_allowed_action` or the Current Control State rows. `run-steps.js:244-257`, the approval writer (`run-recording.js:170-192`) and `run-state-writer.js:255-285` already refresh these fields. `RUN_STEPS` has no internal-step kind (`run-steps.js:28`). No schema or meaning change is needed. | `low` |
| Tests / QA | `packages/core/test/control-state-test.js`, `run-revision-test.js`, `interaction-presentation-test.js`; `packages/cli/scripts/skill-dispatch-test.js`, `cli-gate-scenarios-test.js`, `smoke-test.js` | Existing suites cover next-step texts and dispatch phases. No test covers a persisted gate that differs from the evaluated gate. | `low` |
| Release / operations | Generated runtime copies under `packages/cli/runtime/core/lib/**` and `packages/cli/generated/**`, synced by the existing scripts; installed plugin 0.14.5 | The fix takes effect in Claude and Codex only after sync and plugin reinstall. No separate rollout is needed. | `low` |

Evidence for the read-side boundary: [NEXT_ACTION_DIVERGENCE_SCAN.md](evidence/NEXT_ACTION_DIVERGENCE_SCAN.md).

- **All runs.** 69 of 115 runs persist a next step that differs from the evaluated text. Nearly all are completed runs with deliberate closeout text, and several completed legacy runs evaluate to non-OR gates.
- **Active runs.** Of 48 active runs, exactly one is `GATE-MOVED`: the cockpit run, Brownfield Analysis → CD+Tests. Five carry deliberate same-gate text, such as "Choose whether AC-006 stays open…" or "Execute LIVE_VALIDATION.md after Codex restart…".

Always preferring the evaluated text would therefore regress both groups.

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `low`
- architecture_reason: The data and source-of-truth boundary between the evaluated gate decision and the persisted next-step refinement is affected. Today the persisted text silently overrides the evaluated authority even after the gate has moved. The internal runtime contract between gate-check and the dispatcher continuation depends on exact text. No external interface, host contract, security or policy authority, migration or module-ownership boundary changes.
- architecture_evidence: `gate-check.js:333-337`, `:447-452`; `delivery-map.js:228`; `service.js:474-476`; `run-recording.js:84-114`; divergence scan above.
- architecture_missing_evidence: `none` for routing. SD must decide the exact discriminator and the write-path mechanism.
- architecture_next_owner_and_action: SD (sd-definition) decides three things:
  1. The precedence rule. Recommended evidence-based candidate: the persisted text applies only while the persisted `current_gate` equals the evaluated gate on an active run; otherwise the evaluated text applies.
  2. Whether `run-update` refreshes the derived fields when the evaluated gate moved, while preserving same-gate custom text, or whether a dedicated internal-step `run-step` is added.
  3. Whether the two exact-text checks are replaced by state-based conditions.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: persisted `next_allowed_action` overrides the evaluated gate decision after the gate moved | SoT boundary; `gate-check.js:333-337`, `delivery-map.js:228`; scan: 1 active `GATE-MOVED` run | `revise` | SD defines one shared precedence helper used by gate-check and delivery-map. Reuse `isPlaceholderValue` and the existing Verified Change / source-revision exceptions; no second evaluator. |
| problem: `run-update` re-seals without refreshing derived control fields | Persistence boundary; `run-recording.js:84-114` versus the existing refresh in `run-steps.js:244-257` and `run-recording.js:170-192` | `revise` | SD reuses the existing refresh pattern (`replaceFirstScalar` / `upsertTableRow` with `transitionDecisionForRunState`). Do not create a parallel writer. Preserve run-specific same-gate text. |
| problem: routing depends on exact next-step text | Runtime boundary; `service.js:474-476`, `gate-check.js:447-452` | `warn` | SD decides whether the checks rely on evaluated gate state instead of string equality. The fix must keep continuations unchanged for `equal` runs. |
| No parallel structure needed | Existing helpers cover parsing, evaluation and section edits | `none` | Extend the existing functions only. |
| Observation, out of scope: completed legacy runs evaluate to non-OR gates | Scan, for example `agdf-run-scoped-control-state` OR → CD+Tests | `none` | Not part of this UR. The precedence rule must leave completed runs' displayed next step unchanged. Record as an open question in the backlog only if it is later confirmed as a defect. |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: bounded_structured_slice. One coherent outcome: next step and routing follow the evaluated gate after internal step recording. No full-depth trigger applies. Rejected alternatives:
  - `quick_task`: the Narrow Code-Fix Criterion fails because the change spans `control-evaluation`, `control-state` and `skill-dispatch`, and the UR explicitly defers the write-path decision to SD.
  - `verified_change`: no single canonical owner, and the change touches the control-state writer.
  - `structured_delivery`: no authority, runtime, persistence-schema, external-contract, release or coordination trigger is evidenced.
- evidence: `.agdf/control/artefacts/status-card-stale-next-action-20261008-01/BROWNFIELD_REVIEW.md`; `evidence/NEXT_ACTION_DIVERGENCE_SCAN.md`
- transparency_note: PRD, SD and TP stay at slice depth. The PRD fixes the observable rules: which next step is shown when, and which continuation results. The SD fixes the precedence helper, the `run-update` refresh and the string-check replacement. The TP maps these to tests plus the cockpit-run verification after sync and reinstall.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_delivery`, because no authority, policy, security, architecture, runtime, persistence-schema, external-contract, release, cross-host or unbounded-coordination effect is evidenced. `quick_task` and `verified_change` were rejected as above.
- missing_or_conflicting_facts: none
- depth_evidence_refs: this review; `evidence/NEXT_ACTION_DIVERGENCE_SCAN.md`; `gate-policy.js:238-261`; `gate-check.js:333-337`, `:447-452`; `delivery-map.js:228`; `service.js:474-476`; `run-recording.js:84-114`; `run-steps.js:28`, `:244-257`

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome with the UR acceptance boundary: stored and shown next step plus routing match the evaluated gate. |
| authority_boundary | `pass` | `gate-policy.js` remains the gate authority. The persisted text keeps its existing role as a same-gate refinement. No trust, permission or policy change. |
| owner_consumer_coordination | `pass` | Owners are `packages/core/lib/control-evaluation`, `control-state` and `skill-dispatch`. Consumers are gate-check, status card, dispatcher, cockpit and backlog, all in this repository with no shared external cutover. |
| full_depth_impacts_absent | `pass` | No architecture or runtime boundary change, no schema or meaning change of persisted fields, no public CLI flag or schema change, no release plan. Plugin sync and reinstall are routine. |
| migration_propagation_bounded | `pass` | No data migration: stale existing runs are handled by the read rule. Generated copies propagate through the existing sync scripts. Reversible by revert. |
| failure_recovery_local | `pass` | A failure only affects next-step text and routing for gate-moved active runs. Recovery is a revert or a canonical `run-update`. Approvals and seals stay valid. |
| independently_acceptable | `pass` | UR acceptance signals 1-5 are testable in isolation. Signal 4 needs only sync and reinstall, not other runs' work. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Exact observable rule for which next step is shown, for active runs with the same gate versus a moved gate, and for completed runs | PRD | `revise` |
| Shared precedence helper and its use in `gate-check.js` and `delivery-map.js` | SD | `revise` |
| `run-update` derived-field refresh versus a dedicated internal-step `run-step`, preserving same-gate custom text and seal rules | SD | `revise` |
| Replace the exact-text checks (`service.js:476`, `gate-check.js:449`) with state-based conditions without changing `equal`-run behavior | SD | `warn` |
| Verification path for the cockpit run (sync scripts, plugin reinstall or local CLI) | TP | `warn` |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md` → `CG-RUN-STATUS-CARD`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: After implementation, add the invariant: the next step derives from the evaluated gate, and persisted text is only a same-gate refinement for active runs. Curate before clean closeout. Reconciliation stays `open_gap` until then.

## Next Permissible Step

- next_allowed_action: Draft the slice-depth PRD for the next-step precedence and routing rules.
- forbidden_until_then: SD, TP, implementation-preparation Brownfield Analysis, implementation, QA and release claims.

## Quality Outlook

- quality_outlook: The cause is evidenced at three code points, and the scan gives a precise regression boundary: five active same-gate custom runs plus completed runs must keep their text, and one gate-moved run must change. The main risk is breaking existing `continue_delivery` continuations for `equal` runs. The TP must pin these with tests before any change to the exact-text checks.
