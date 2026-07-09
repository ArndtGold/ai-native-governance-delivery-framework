# AGDF Run State

## Run Meta

- run_id: agdf-delivery-path-search
- started_at: 2026-07-09
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Add a surface-neutral, read-only AGDF Delivery Path Search capability with evaluator and surface adapters for multiple coding agents, without bypassing AGDF gates.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The existing AGDF control model is surface-neutral and already maps shared skills to Codex, Claude Code, GitHub Copilot and OpenCode through different delivery mechanisms. |
| What is approved? | Revised UR, PRD, SD, TP, QA and UAT approved by exact user formulas; pre-implementation Brownfield Analysis passed. |
| What is missing? | No missing evidence for the approved first-release scope. |
| What is the next allowed action? | Delivery closeout handoff; commit, push, PR, release and publish require separate explicit instruction. |
| What is explicitly forbidden right now? | Commit, push, PR, release, tag or npm publish without separate explicit user instruction. |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | Pass |
| Current gate | OR |
| Allowed now | Delivery closeout handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | Offer commit-ready handoff; wait for explicit commit/push/PR/release instruction |
| Quality outlook | No further technical follow-up required for first release; AI-native candidate generation is tracked as a separate future UR |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided for the revised cross-agent scope on 2026-07-09 |
| PRD | approved | `Approval: PRD` provided in session on 2026-07-09 |
| SD | approved | `Approval: SD` provided in session on 2026-07-09 |
| TP | approved | `Approval: TP` provided in session on 2026-07-09 |
| QA | approved | `Approval: QA` provided in session on 2026-07-09 |
| UAT | approved | `Approval: UAT` provided in session on 2026-07-09 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/agdf-delivery-path-search/UR.md | approved | Surface-neutral core plus evaluator and surface adapters |
| Brownfield Review | .agdf/control/artefacts/agdf-delivery-path-search/BROWNFIELD_REVIEW.md | done | Repeated for cross-agent scope; structured delivery |
| PRD | .agdf/control/artefacts/agdf-delivery-path-search/PRD.md | approved | Portable core, adapter contracts and enforcement levels |
| SD | .agdf/control/artefacts/agdf-delivery-path-search/SD.md | approved | CLI runtime, module boundaries, contracts, adapters and persistence |
| TP | .agdf/control/artefacts/agdf-delivery-path-search/TP.md | approved | DPS-01 through DPS-14 task and evidence plan |
| Brownfield Analysis | .agdf/control/artefacts/agdf-delivery-path-search/BROWNFIELD_ANALYSIS.md | passed | Existing owners, reuse path, package boundary and risks confirmed |
| CD+Tests | .agdf/control/artefacts/agdf-delivery-path-search/IMPLEMENTATION_EVIDENCE.md | completed | DPS-01 through DPS-14 implemented and checks passed |
| Reviews | .agdf/control/artefacts/agdf-delivery-path-search/REVIEWS.md | passed | TP, clean implementation and code review completed |
| QA | .agdf/control/artefacts/agdf-delivery-path-search/QA_REPORT.md | approved | Passing QA report approved on 2026-07-09 |
| OR | .agdf/control/artefacts/agdf-delivery-path-search/OR.md | completed | UAT approved; delivery closeout handoff ready |

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: The shared search runtime, model-evaluator contract, enforcement capability model and four materially different delivery surfaces introduce product, architecture, security and cross-surface compatibility decisions.
- evidence: Existing AGDF documentation and generators identify separate Codex, Claude Code, GitHub Copilot and OpenCode ownership paths that share one canonical skill and control model.
- transparency_note: Focused PRD, SD and TP artefacts are required; implementation can later be sliced by core and surface adapters.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured for revised cross-agent scope on 2026-07-09 |
| Brownfield Review | sizes | UR | Repeated review covers the approved cross-agent UR |
| PRD | derived_from | UR | Product requirements preserve the approved portable cross-agent scope |
| PRD | approved_by | Approval: PRD | Exact approval captured in session on 2026-07-09 |
| SD | derived_from | PRD | Architecture implements the approved product boundaries |
| SD | approved_by | Approval: SD | Exact approval captured in session on 2026-07-09 |
| TP | derived_from | SD | Tasks and tests implement the approved architecture |
| TP | approved_by | Approval: TP | Exact approval captured in session on 2026-07-09 |
| Brownfield Analysis | validates | TP | Pre-implementation analysis passed against DPS-01 through DPS-14 |
| CD+Tests | implements | TP | Implementation evidence covers DPS-01 through DPS-14 |
| Reviews | verifies | CD+Tests | TP coverage, clean review and code review passed |
| QA_REPORT | tests | TP | Passing QA decision covers approved TP and evidence |
| QA_REPORT | approved_by | Approval: QA | Exact approval captured in session on 2026-07-09 |
| UAT | approved_by | Approval: UAT | Exact approval captured in session on 2026-07-09 |
| OR | closes | QA_REPORT | OR-full records delivered scope, limitations, verification, risks and delivery handoff readiness |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Runtime contract | plugin/meta/agdf-runtime-contract.md | Canonical gates, permissions and durable state rules | direct |
| Plugin definition | plugin/meta/agdf-plugin.definition.json | Canonical skill routing and surface prefixes | direct |
| Codex manifest | plugin/.codex-plugin/plugin.json | Installed skill and hook packaging | direct |
| Hook configuration | plugin/hooks/hooks.json | Existing lifecycle enforcement boundary | direct |
| Runtime integrity | plugin/scripts/check-runtime-integrity.mjs | Existing cross-surface validation owner | direct |
| Repository search | `rg` for MCTS and delivery-path terms | No existing search implementation observed | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none | none | none |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Search could become a second gate authority | high | Consume canonical state; AGDF gates decide execution |
| Model scores could be mistaken for measurements | high | Label facts, judgements and uncertainty separately |
| Repeated evaluations add cost, latency and non-determinism | high | Define budgets, stopping rules and evidence |
| Persisted traces could expose sensitive context | high | Define redaction and retention boundaries |
| Current CLI projection does not consume persisted Brownfield Analysis completion | warn | Treat Runtime Contract plus persisted analysis as operative; keep the projection limitation visible |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: UAT-approved Delivery Path Search invariants are linked to the dedicated Context Graph node and preserved in the approved artefact chain and runtime-contract updates.

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-runtime-contract.md`; `plugin/meta/agdf-plugin.definition.json`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: approved revised UR and repeated Brownfield Review for `agdf-delivery-path-search`
- competing_scope_lines: none
- branch_workspace_evidence: repository owners and absence of existing search implementation inspected
- branch_workspace_scope_effect: supports

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: UAT-approved Delivery Path Search decisions now define reusable AGDF planning and evaluator-boundary invariants.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-DELIVERY-PATH-SEARCH; .agdf/control/artefacts/agdf-delivery-path-search/

## Closeout

- delivered: Approved artefact chain, Brownfield analysis, DPS-01 through DPS-14 implementation, tests, mandatory reviews, QA approval, UAT approval, OR closeout and Context Graph node `CG-DELIVERY-PATH-SEARCH`.
- not_delivered: commit, push, PR, release, tag and publish.
- verification_performed: Codex read-only evaluator probe; focused Delivery Path Search tests; create-agdf smoke and routing tests; runtime integrity including exact Pages/plugin skill equality; packaged @agdf/cli wrapper smoke; package dry-run; Pages check and static build; TP, clean implementation and code review.
- unverified: none for the approved first-release scope.
- next_allowed_action: Offer commit-ready handoff; wait for explicit commit/push/PR/release instruction.
- quality_outlook: No further technical follow-up required for first release; AI-native candidate generation is tracked as a separate future UR.
