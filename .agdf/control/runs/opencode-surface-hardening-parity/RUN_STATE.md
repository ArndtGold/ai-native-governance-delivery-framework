# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: opencode-surface-hardening-parity
- lifecycle: active
- revision: 16
- revision_id: 324e06ae-eafa-479b-a26d-5610963df90d
- mode: structured_delivery
- current_gate: QA
- decision: revise
- owner: agent

## Objective

Make OpenCode degradation observable when experimental hook declarations disappear, and add a
preflight-gated executable Delivery Path Search evaluator without overstating host evidence.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | OHP-11 is implemented in the existing installer: exact-version alignment, matching no-op, mandatory post-probe, partial recovery and read-only status tests pass. The live host and SDK both report 1.18.3 with supported hook declarations. |
| What is approved? | UR, PRD, SD and TP revision 2 are approved; Brownfield Analysis revision 2 passes and authorizes OHP-11 implementation. |
| What is missing? | Only OHP-10's authenticated contract-valid live evaluator response; the available host previously returned HTTP 401 `No provider available`. |
| What is the next allowed action? | Configure an authenticated OpenCode provider, rerun one bounded evaluator invocation and rerun QA. |
| What is explicitly forbidden right now? | QA approval, UAT, release and VCS actions while TPR-01 remains open. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-23 for revision 2 after the automatic-alignment delta was presented. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-07-23 for revision 2 after same-run, same-revision and durable-artefact revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-07-23 for revision 2 after same-run, same-revision and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-07-23 for revision 2 after same-run, same-revision and durable-artefact revalidation. |
| QA | missing | none |
| UAT | missing | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/opencode-surface-hardening-parity/UR.md` | approved | Revision 2 adds automatic exact-version SDK alignment to the approved install scope. |
| Brownfield Review | `.agdf/control/artefacts/opencode-surface-hardening-parity/BROWNFIELD_REVIEW.md` | done | Revision 2 reuses the existing npm/install/status owners and retains a structured slice with medium UI/UX impact. |
| UX Intent Definition | `.agdf/control/artefacts/opencode-surface-hardening-parity/UX_INTENT_DEFINITION.md` | ready | Revision 2 defines aligned, unchanged, unavailable, failed and read-only status states as PRD input. |
| Verified Change | `.agdf/control/artefacts/opencode-surface-hardening-parity/VERIFIED_CHANGE.md` | missing | Mode is not selected before Brownfield Review. |
| PRD | `.agdf/control/artefacts/opencode-surface-hardening-parity/PRD.md` | approved | Revision 2 adds fail-safe, non-interactive exact-host-version SDK alignment and keeps status read-only. |
| SD | `.agdf/control/artefacts/opencode-surface-hardening-parity/SD.md` | approved | Revision 2 keeps one installer owner, defines exact registry targeting, typed alignment outcomes, mandatory post-verification and partial recovery. |
| TP | `.agdf/control/artefacts/opencode-surface-hardening-parity/TP.md` | approved | Revision 2 adds OHP-11 for exact SDK alignment, complete negative coverage, post-verification and status read-only regression proof. |
| Brownfield Analysis | `.agdf/control/artefacts/opencode-surface-hardening-parity/BROWNFIELD_ANALYSIS.md` | done | Revision 2 confirms one installer/probe/lifecycle path, clean code paths and the OHP-11 reuse/test order. |
| CD+Tests | `.agdf/control/artefacts/opencode-surface-hardening-parity/CD_TESTS.md` | done | Revision 2 adds fully tested OHP-11 alignment behavior; complete smoke, package and Runtime Integrity checks pass. |
| TP Review | `.agdf/control/artefacts/opencode-surface-hardening-parity/TASK_PLAN_REVIEW.md` | revise | 10/11 tasks fully done; only OHP-10 is partial because live authentication is unavailable. |
| Clean Review | `.agdf/control/artefacts/opencode-surface-hardening-parity/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Revision 2 confirms one package owner, no rollback loop, no status mutation and no policy fork. |
| CR | `.agdf/control/artefacts/opencode-surface-hardening-parity/CODE_REVIEW.md` | done | Revision 2 passes after exact-target, timeout, post-probe, failure and lifecycle review. |
| QA | `.agdf/control/artefacts/opencode-surface-hardening-parity/QA_REPORT.md` | revise | OHP-11 is green; open TPR-01 still prevents QA pass. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: The slice changes OpenCode CLI/runtime behavior, visible status and recovery semantics, permission evidence and several canonical owners, while reusing existing lifecycle, plugin, evaluator, capability and test seams.
- evidence: `.agdf/control/artefacts/opencode-surface-hardening-parity/BROWNFIELD_REVIEW.md`

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Durable UR draft | `.agdf/control/artefacts/opencode-surface-hardening-parity/UR.md` | Proposed problem, goal, scope, non-goals and acceptance signals. | direct |
| Existing OpenCode activation run | `.agdf/control/runs/opencode-single-install-activation/RUN_STATE.md` | Existing global runtime, plugin-hook and activation ownership requiring Brownfield Review. | direct |
| Runtime contract | `plugin/meta/contracts/control-scaffold.md` | Shared Delivery Path Search enforcement vocabulary and cross-surface contract boundary. | direct |

## Artefact Chain

| From | Relationship | To | Status | Evidence |
|---|---|---|---|---|
| UR | approved_by | `Approval: UR` | approved | Exact approval accepted on 2026-07-23 for revision 2 after the automatic-alignment delta was presented. |
| Brownfield Review | sizes | `structured_slice` | done | Revision 2 evidences the existing npm/install/status owners; medium UI/UX impact is resolved by UX Intent Definition revision 2. |
| PRD | derived_from | UR | ready | Revision 2 incorporates automatic exact-version alignment, read-only status and fail-safe recovery. |
| PRD | approved_by | `Approval: PRD` | approved | Exact approval accepted on 2026-07-23 for revision 2 after selected-run, same-gate, revision and durable-artefact revalidation. |
| SD | derived_from | PRD | ready | Revision 2 adds exact install-time SDK alignment while preserving read-only status, warning-only divergence and fail-closed evaluator boundaries. |
| SD | approved_by | `Approval: SD` | approved | Exact approval accepted on 2026-07-23 for revision 2 after selected-run, same-gate, revision and durable-artefact revalidation. |
| TP | derived_from | SD | ready | Revision 2 preserves OHP-01 through OHP-10 and adds OHP-11 for the approved exact install-time SDK alignment design. |
| TP | approved_by | `Approval: TP` | approved | Exact approval accepted on 2026-07-23 for revision 2 after selected-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Analysis | prepares | OHP-11 | done | Revision 2 evidences the existing installer, read-only probe, lifecycle projection, clean paths and regression surface. |
| CD+Tests | implements | OHP-01 through OHP-11 | partial | OHP-01 through OHP-09 and OHP-11 are complete; OHP-10 lacks only an authenticated evaluator payload. |
| TP Review | verifies | TP | revise | 10/11 fully done; TPR-01 routes the remaining live evidence to `evidence_obligation`. |
| Clean Review | verifies | solution integrity | pass | One installer/probe/lifecycle path; no rollback loop, status mutation or policy fork. |
| Code Review | verifies | implementation diff | pass | No open code finding remains after revision-2 alignment review. |
| QA | consumes | reviews and evidence | revise | OHP-11 passes; TPR-01 remains the sole open finding. |

## Missing Evidence

- One authenticated, bounded OpenCode evaluator result with contract-valid output and zero mutation.

## Risks

- Live `tool_enforced` availability must remain unclaimed until TPR-01 is resolved.
- Experimental hook declaration evidence remains distinct from observed hook execution.
- Install-time SDK alignment must target only the exact detected host version and must not turn
  read-only status into a mutating path.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node records OpenCode's instruction-only baseline, invocation-scoped
  conditional enforcement and unresolved live evidence boundary.

## Closeout

- next_allowed_action: Configure an authenticated OpenCode provider, rerun one bounded evaluator invocation and rerun QA.
- quality_outlook: OHP-11 implementation, deterministic evidence, solution integrity and code quality pass; QA remains revise only on the pre-existing authenticated evaluator evidence obligation.
