# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: codex-harness-conformance-slice
- lifecycle: active
- revision: 2
- revision_id: 8DDED160-6D2A-46F1-B286-AC2A8B039090
- started_at: 2026-08-21
- mode: `structured_delivery`
- current_gate: `UR`
- decision: `in_progress`
- owner: Arndt Gold

## Objective

Establish a bounded, portable and evidence-safe AGDF conformance boundary for the open Codex harness
before any adapter, protocol integration or public capability claim is designed or implemented.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | OpenAI documents the Codex harness as an open execution and integration layer; AGDF already owns durable governance, approval and host-adapter boundaries. |
| What is approved? | No gate approval is recorded for this new scope. |
| What is missing? | Review of the durable UR and exact `Approval: UR`. |
| What is the next allowed action? | Review or refine the UR and request the exact UR approval. |
| What is explicitly forbidden right now? | Brownfield Review, PRD, SD, TP, adapter design, implementation, QA, UAT and release claims. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and its focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: User selected planning the Codex harness conformance slice as the next AGDF step on 2026-08-21; durable UR at `.agdf/control/artefacts/codex-harness-conformance-slice/UR.md`.
- competing_scope_lines: Existing active runs remain independent; no existing Harness or App Server integration run was found.
- branch_workspace_evidence: Branch `main` at baseline `23fef180a4d8aa540270b566f6eb2a99a7e54194`; pre-existing untracked `.github/workflows/publish-create-agdf.yml` is unrelated and excluded from this scope.
- branch_workspace_scope_effect: `supports`

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open |
| Current gate | UR |
| Allowed now | Review or refine the durable UR. |
| Blocked by | Exact UR approval is missing. |
| Missing approval | `Approval: UR` |
| Next step | Review the UR and provide the exact approval, request revision or decline. |
| Quality outlook | Preserve the host-execution versus AGDF-governance boundary during Brownfield Review. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `missing` | none |
| PRD | `missing` | none |
| SD | `missing` | none |
| TP | `missing` | none |
| QA | `missing` | none |
| UAT | `missing` | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/codex-harness-conformance-slice/UR.md` | `draft` | New bounded conformance need; approval open. |
| PRD |  | `not_applicable` | Not allowed before approved UR, Brownfield Review and Mode/Slice Decision. |
| SD |  | `not_applicable` | Not allowed. |
| TP |  | `not_applicable` | Not allowed. |
| Brownfield Review |  | `missing` | Becomes the next internal step only after approved durable UR. |
| Verified Change |  | `missing` | No mode decision exists. |
| Review |  | `missing` | Not applicable at the current gate. |
| QA |  | `missing` | Not allowed. |
| OR |  | `missing` | Not allowed. |

## Mode / Slice Decision

Set this after Brownfield Review. Do not assume the full gate chain before the existing-system impact is understood.
Quick Task execution or implementation is not allowed until this decision is visible with scope reason and evidence.

- decision: `undecided`
- required_next_gate: `none`
- scope_reason: Brownfield owners, protocol impact and bounded-slice facts have not yet been assessed.
- evidence: `.agdf/control/artefacts/codex-harness-conformance-slice/UR.md`
- transparency_note: The proposed conformance slice is a hypothesis until post-UR Brownfield Review sizes it.

## Artefact Chain

Keep the active work item traceable. A gate may open only when the previous gate has both exact approval and a durable or linked artefact.

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | `approved_by` | `Approval: UR` | approval missing |
| PRD | `derived_from` | UR | not allowed |
| SD | `derived_from` | PRD | not allowed |
| TP | `derived_from` | SD | not allowed |
| QA_REPORT | `tests` | TP | not allowed |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Official Codex platform article | `https://developers.openai.com/blog/codex-as-a-platform` | Open harness capabilities and integration boundary | `direct` |
| Existing AGDF interaction contract | `plugin/meta/contracts/interaction.md` | Tool-permission versus gate-approval authority | `direct` |
| Existing AGDF portability run | `.agdf/control/artefacts/agent-skills-conformance-portability/OR.md` | Skill format, plugin integration and governance boundary | `direct` |
| Current public boundary | `README.md` | Skills-only distribution and explicit service/runtime non-claims | `direct` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Existing owner and protocol-impact inventory | `warn` | Perform Brownfield Review only after UR approval. |
| Direct authenticated Codex host behavior for any future adapter | `warn` | Keep as later UAT evidence; do not infer it from repository or protocol tests. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Codex tool permissions are mistaken for AGDF gate approvals. | `warn` | Preserve `interaction.md` as sole approval authority and require exact AGDF approval validation. |
| Codex integration duplicates AGDF state, rendering or gate logic. | `warn` | Brownfield Review must identify and reuse canonical owners before any design. |
| Codex-specific integration weakens cross-host portability. | `warn` | Keep host-specific transport behind shared AGDF contracts and test host-neutral semantics. |
| Repository evidence is overstated as live-host behavior. | `warn` | Maintain separate repository, protocol and authenticated-host evidence classes. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing nodes already own approval transport, target authority and deterministic status projection; Brownfield Review must reassess whether a new reusable node is justified.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: The new intent and its current unknowns are run-specific until Brownfield Review identifies reusable architecture knowledge.
- memory_refs: `.agdf/control/artefacts/codex-harness-conformance-slice/UR.md`

## Closeout

- delivered: Durable draft UR and current gate state only.
- not_delivered: Brownfield Review, mode decision, PRD, design, plan, adapter, implementation, QA, UAT, VCS and release.
- verification_performed: Target resolution, exact-version validator resolution, all-active inventory and existing-owner search.
- unverified: App Server or SDK protocol fit, adapter feasibility and direct host behavior.
- next_allowed_action: Review the UR and provide exact `Approval: UR`, request revision or decline.
- quality_outlook: Keep the conformance outcome independently acceptable and avoid a parallel runtime or authority owner.
