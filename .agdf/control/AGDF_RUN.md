# AGDF Run State

## Run Meta

- run_id: agdf-operating-model-sharpening
- started_at: 2026-07-08
- mode: structured_delivery
- current_gate: UAT
- decision: qa_passed
- owner: agent

## Objective

Sharpen AGDF with reusable operating-model guardrails learned from the MarzipanWeb governance model, and reflect the same concepts in the public Pages site.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | MarzipanWeb has strong patterns for normative source precedence, per-run persistence routing, multi-scope fail-closed, branch-not-proof, bug-lightweight scope and domain/runtime guardrails. |
| What is approved? | UR approved by exact user formula `Approval: UR` on 2026-07-08. |
| What is missing? | UAT approval for commit/release handoff. |
| What is the next allowed action? | Request `Approval: UAT` before committing if this slice should be finalized in git. |
| What is explicitly forbidden right now? | Release or commit handoff without UAT approval; changing AGDF gate order; weakening approval rules; importing MarzipanWeb-specific domain details. |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

- status: qa_passed
- allowed_now: UAT review; commit preparation after UAT approval
- forbidden_now: release or commit handoff without UAT approval
- blocking_condition: UAT not yet approved
- next_skill: agdf-delivery-closeout
- next_step: Request `Approval: UAT` before committing if this slice should be finalized in git.
- quality_outlook: Validate in the next real consumer repo whether the new guardrails reduce ambiguity without increasing ceremony.

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided in session on 2026-07-08 |
| PRD | not_applicable | Brownfield Review selected `structured_slice` with no separate PRD required |
| SD | not_applicable | Existing Runtime Contract, Router, templates, CLI and Pages owners are clear |
| TP | not_applicable | Narrow structured slice with evidence tracked in this run |
| QA | passed | .agdf/control/artefacts/agdf-operating-model-sharpening/QA_REPORT.md |
| UAT | missing | UAT not yet performed |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/agdf-operating-model-sharpening/UR.md | approved | Approved operating-model sharpening |
| PRD |  | not_applicable | Structured slice does not need separate PRD depth |
| SD |  | not_applicable | No architecture redesign |
| TP |  | not_applicable | Narrow slice; evidence tracked in this run |
| Brownfield Review | .agdf/control/artefacts/agdf-operating-model-sharpening/BROWNFIELD_REVIEW.md | done | Mode/Slice Decision recorded |
| Review | .agdf/control/artefacts/agdf-operating-model-sharpening/REVIEWS.md | done | TP coverage, clean review and code review recorded |
| QA | .agdf/control/artefacts/agdf-operating-model-sharpening/QA_REPORT.md | passed | QA pass recorded |
| OR | .agdf/control/artefacts/agdf-operating-model-sharpening/OR.md | done | Closeout recorded |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: none
- scope_reason: The change sharpens AGDF operating rules and public explanation, but is additive, bounded and reuses existing runtime/docs/pages ownership.
- evidence: MarzipanWeb Root `AGENTS.md` patterns map to generic AGDF concepts: source precedence, persistence routing, ambiguous-scope fail-closed, branch-not-proof, bug-lightweight scope, support next step and domain guardrails.
- transparency_note: PRD/SD/TP are skipped because this is a narrow approved improvement to existing operating-model surfaces, not a new architecture.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session and persisted in UR artefact |
| PRD | derived_from | UR | not_applicable: structured_slice skips PRD depth |
| SD | derived_from | PRD | not_applicable: no separate SD |
| TP | derived_from | SD | not_applicable: no separate TP |
| QA_REPORT | tests | TP | .agdf/control/artefacts/agdf-operating-model-sharpening/QA_REPORT.md |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| MarzipanWeb Root AGENTS.md inspection | C:\Workspace\marzipanweb\AGENTS.md | Source patterns to generalize | direct |
| Existing Runtime Contract | plugin/meta/agdf-runtime-contract.md | Runtime owner | direct |
| Existing Router | plugin/meta/agdf-agent-router.md | Agent routing owner | direct |
| Existing Pages source | pages/src/data/site.ts; pages/src/pages/index.astro | Public communication owner | direct |
| Runtime integrity check | `node plugin\scripts\check-runtime-integrity.mjs` | Runtime and generated control integrity | direct |
| create-agdf smoke test | `npm --prefix create-agdf run smoke-test -- --quiet` | Generated scaffold, routing render and post-QA UAT projection | direct |
| Pages check | `npm --prefix pages run check` | Astro/type diagnostics, including Core Control Flow revision | direct |
| Pages build | `npm --prefix pages run build` | Static site build, including Core Control Flow revision | direct |
| Gate-check status projection | `node create-agdf\bin\create-agdf.js gate-check --json` | Current gate UAT and missing `Approval: UAT` | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| UAT approval | block release/commit handoff | Request `Approval: UAT` before committing |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Overfitting AGDF to MarzipanWeb specifics | warn | Generalize patterns and exclude MarzipanWeb-specific fachliche Guardrails |
| More rules could increase ceremony | warn | Phrase as ambiguity reducers and lightweight tracks, not mandatory full-process overhead |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-RUN-STATUS-CARD; new CG-OPERATING-MODEL-SHARPENING
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: This run broadens AGDF runtime knowledge with reusable operating-model guardrails.

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-runtime-contract.md`; `plugin/meta/agdf-agent-router.md`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: UR and Brownfield Review for `agdf-operating-model-sharpening`
- competing_scope_lines: none
- branch_workspace_evidence: working tree changes match active run artefacts
- branch_workspace_scope_effect: supports

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Reusable AGDF operating-model guardrails should inform future governed runs.
- memory_refs: CG-OPERATING-MODEL-SHARPENING

## Closeout

- delivered: Runtime/router/gate-check/template/quality-contract/CLI/Pages sharpening implemented, including QA-passed to UAT status projection and Core Control Flow Pages revision.
- not_delivered: No gate-order change; no approval-rule weakening; no MarzipanWeb-specific domain import.
- verification_performed: runtime integrity; create-agdf smoke/routing; Pages check; Pages build.
- unverified: downstream repo usability until first consumer adoption.
- next_allowed_action: Request `Approval: UAT` before committing.
- quality_outlook: Use first downstream adoption to confirm the guardrails reduce ambiguity without avoidable ceremony.
