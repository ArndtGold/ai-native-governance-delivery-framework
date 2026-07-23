# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: opencode-surface-hardening-parity
- lifecycle: active
- revision: 11
- revision_id: c1ba5ce0-5ec7-4c83-9554-a81496fa59e6
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
| What is known? | OHP-01 through OHP-09 are implemented and reviewed; installed status reports host 1.18.3, SDK 1.17.11, both hook declarations and warning-only divergence. |
| What is approved? | UR revision 1, PRD revision 1, SD revision 1 and TP revision 1 are approved; Brownfield Review selected a structured slice. |
| What is missing? | OHP-10 lacks one authenticated contract-valid live evaluator response; the current host returned HTTP 401 `No provider available`. |
| What is the next allowed action? | Configure an authenticated OpenCode provider, rerun the bounded live evaluator probe and then rerun QA. |
| What is explicitly forbidden right now? | QA pass, UAT, release and VCS actions while TPR-01 is open. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-23 after same-run, same-revision and durable-artefact revalidation. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-07-23 after same-run, same-revision and durable-artefact revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-07-23 after same-run, same-revision and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-07-23 after same-run, same-revision and durable-artefact revalidation. |
| QA | missing | none |
| UAT | missing | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/opencode-surface-hardening-parity/UR.md` | approved | Revision 1 defines the approved hardening and evaluator-parity boundary. |
| Brownfield Review | `.agdf/control/artefacts/opencode-surface-hardening-parity/BROWNFIELD_REVIEW.md` | done | Existing owners support a bounded structured slice; UI/UX impact is medium and requires UX Intent Definition. |
| UX Intent Definition | `.agdf/control/artefacts/opencode-surface-hardening-parity/UX_INTENT_DEFINITION.md` | ready | Warning-only version policy and stop-then-instruction-only recovery are resolved as PRD input. |
| Verified Change | `.agdf/control/artefacts/opencode-surface-hardening-parity/VERIFIED_CHANGE.md` | missing | Mode is not selected before Brownfield Review. |
| PRD | `.agdf/control/artefacts/opencode-surface-hardening-parity/PRD.md` | approved | Revision 1 defines observable capability evidence, warning-only drift, fail-closed evaluator recovery and acceptance criteria. |
| SD | `.agdf/control/artefacts/opencode-surface-hardening-parity/SD.md` | approved | Revision 1 defines installed-SDK probing, static/dynamic guidance ownership, an invocation-scoped deny preflight, the OpenCode evaluator and typed fail-closed CLI results. |
| TP | `.agdf/control/artefacts/opencode-surface-hardening-parity/TP.md` | approved | Revision 1 maps ten ordered implementation, regression, documentation and live-evidence tasks to every PRD requirement. |
| Brownfield Analysis | `.agdf/control/artefacts/opencode-surface-hardening-parity/BROWNFIELD_ANALYSIS.md` | done | Pre-implementation analysis confirms clean existing owners, isolated source paths and the approved reuse order. |
| CD+Tests | `.agdf/control/artefacts/opencode-surface-hardening-parity/CD_TESTS.md` | done | OHP-01 through OHP-09 and deterministic OHP-10 evidence are complete; full smoke and Runtime Integrity pass. |
| TP Review | `.agdf/control/artefacts/opencode-surface-hardening-parity/TASK_PLAN_REVIEW.md` | revise | 9/10 tasks fully done; OHP-10 is partial because live authentication is unavailable. |
| Clean Review | `.agdf/control/artefacts/opencode-surface-hardening-parity/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Existing owners remain authoritative; no scoring, gate or policy fork was introduced. |
| CR | `.agdf/control/artefacts/opencode-surface-hardening-parity/CODE_REVIEW.md` | done | Pass after resolving Primary-Agent, manifest-resolution, error-classification and no-evaluation enforcement findings. |
| QA | `.agdf/control/artefacts/opencode-surface-hardening-parity/QA_REPORT.md` | revise | Open evidence obligation TPR-01 prevents QA pass. |

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
| UR | approved_by | `Approval: UR` | approved | Exact approval accepted on 2026-07-23 after selected-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | sizes | `structured_slice` | done | Existing OpenCode and Delivery Path Search owners are evidenced; medium UI/UX impact requires UX Intent Definition before PRD readiness. |
| PRD | derived_from | UR | ready | Revision 1 incorporates the approved scope, Brownfield owners and ready UX Intent Definition. |
| PRD | approved_by | `Approval: PRD` | approved | Exact approval accepted on 2026-07-23 after selected-run, same-gate, revision and durable-artefact revalidation. |
| SD | derived_from | PRD | ready | Revision 1 preserves all approved visible states, warning-only version policy, fail-closed recovery and evidence boundaries. |
| SD | approved_by | `Approval: SD` | approved | Exact approval accepted on 2026-07-23 after selected-run, same-gate, revision and durable-artefact revalidation. |
| TP | derived_from | SD | ready | Revision 1 maps the approved resolver, status, static guidance, evaluator, preflight, fallback, documentation and evidence design to OHP-01 through OHP-10. |
| TP | approved_by | `Approval: TP` | approved | Exact approval accepted on 2026-07-23 after selected-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Analysis | prepares | OHP-01 through OHP-10 | done | Existing owners, worktree isolation, permission precedence, regression surface and clean implementation order are evidenced. |
| CD+Tests | implements | OHP-01 through OHP-10 | partial | OHP-01 through OHP-09 are complete; OHP-10 has live status/preflight evidence but no authenticated evaluator payload. |
| TP Review | verifies | TP | revise | 9/10 fully done; TPR-01 routes the remaining live evidence to `evidence_obligation`. |
| Clean Review | verifies | solution integrity | pass | One owner per lifecycle, instruction, evaluator, capability and search concern. |
| Code Review | verifies | implementation diff | pass | No open code finding remains. |
| QA | consumes | reviews and evidence | revise | TPR-01 remains open. |

## Missing Evidence

- One authenticated, bounded OpenCode evaluator result with contract-valid output and zero mutation.

## Risks

- Live `tool_enforced` availability must remain unclaimed until TPR-01 is resolved.
- Experimental hook declaration evidence remains distinct from observed hook execution.

## Closeout

- next_allowed_action: Configure an authenticated OpenCode provider, rerun one bounded evaluator invocation and rerun QA.
- quality_outlook: Deterministic implementation, plan coverage, solution integrity and code quality are green; QA remains revise on one live evidence obligation.
