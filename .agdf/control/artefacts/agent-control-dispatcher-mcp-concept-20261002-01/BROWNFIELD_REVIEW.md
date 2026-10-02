# Brownfield Review: Joint Coding-Agent Control Concept

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: agent-control-dispatcher-mcp-concept-20261002-01
- related_ur: .agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/UR.md
- reviewer: Coding agent; source review, not independent assurance
- reviewed_at: 2026-10-02
- decision: pass

## Objective

Size and route the approved concept deliverable. Runtime implementation remains outside this run. The concept must cover the whole control boundary before separate implementation slices are chosen. Formal requirements and architectural decisions are needed even though the executable deliverable of this run is documentation.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: The target concept spans human decisions, control status, activation, interruptions and recovery across hosts. This is conceptual UX impact; this run does not change live UI.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready; UX_INTENT_DEFINITION.md records the analytical intent and state/recovery semantics without new authority

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Gate transition, modes, quality contracts | plugins/agdf/meta/contracts/{gate-transition,modes,quality}.md | high: control promises and residual limits need integrated requirements |
| Source of truth | Control state and canonical services | .agdf/control/SOT_REGISTRY.md; packages/core/lib/control-state/ | high: preserve existing ownership in proposed model |
| Runtime path | Dispatcher and evaluators | packages/core/lib/skill-dispatch/; packages/core/lib/control-evaluation/gate-policy.js; docs/architecture/dispatcher.md | high: conceptual execution/bypass boundary spans direct tools and routed steps |
| UI / UX | Canonical interaction owner | packages/core/lib/interaction-presentation.js; plugins/agdf/meta/contracts/interaction.md | high: preserve semantics across rendering capabilities |
| Persistence / data | Revision, seal, presentation and approval writers | packages/core/lib/control-state/{run-presentation,gate-approval-validator,run-recording,run-steps}.js | medium: proposed lifecycle must reuse these boundaries; no schema change now |
| Tests / QA | Protocol, continuation, dispatcher and approval tests | packages/mcp-server/test/{protocol,continuation}.test.js; packages/cli/scripts/{skill-dispatch,intake-continuation}-test.js | high: distinguish bounded validator checks from execution prevention and live-host proof |
| Release / operations | Host profiles and consent | plugins/agdf/host-templates/; packages/cli/lib/runtime-check-consent/codex-hooks.js | medium: later roadmap must qualify each host; no activation/rollout now |

## Coverage And Reuse

- fully_done: Existing source has canonical gate evaluation, exact-response/revision validation, prepared-presentation bindings and separate state writers. Source existence does not assert complete host enforcement.
- partially_done: Common Dispatcher/inspect entry and presentation semantics exist, but remain agent-mediated; current MCP server advertises tools only. The server registers supplied runtime tools and emits text plus structuredContent; it has no native elicitation, form or event handler.
- not_done: No complete integrated control concept or universal mediator for direct coding-agent tools is evidenced by these owners.
- reuse_strategy: Extend the explanation and target contracts around existing owners; do not replace the workflow or add parallel state/approval semantics. Assess new enforcement mechanisms as explicitly proposed decisions, not as capabilities already delivered.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: The deliverable designs the joint trust, execution, recovery and cross-host boundary beyond a local interface slice. It must reconcile canonical services with host/tool interception or detection. This is architectural planning, not runtime-change authority.
- architecture_evidence: Approved UR sections 2-5; docs/architecture/dispatcher.md responsibilities and known limits; packages/mcp-server/src/server.js; packages/core/lib/control-state/run-presentation.js.
- architecture_missing_evidence: Host interception capability, independent response attestation and acceptable residual enforcement level remain design inputs; PRD/SD owners must classify supported/unsupported/unknown with evidence.
- architecture_next_owner_and_action: This run's PRD defines concept completeness and the treatment of uncertainty; SD records the proposed boundaries and decisions. Implementation stays in separate runs.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Routing is not tool mediation | Dispatcher returns authorizes:false; server exposes routed tools; arbitrary shell/file calls are outside that path | revise | PRD/SD must require explicit bypass paths and prevention/detection classification; no claim of universal prevention |
| problem: Human provenance is cooperative | This UR run-approve returned assurance lane cooperative_local, caller_forwarded_deliberate_reply, independent_human_proof unavailable; run-presentation says preparation is not proof of display | revise | SD must distinguish cooperative validation from host-attested human input and name unsupported guarantees |
| problem: Agent selects control depth | gate-policy.js quick_task branch trusts the stored route; Verified Change has additional eligibility validation | revise | PRD/SD assess self-classification and the assurance needed; no new route policy is installed by this review |
| problem: Conditional checks and reviews can depend on agent behavior | docs/architecture/dispatcher.md known limits; gate-transition.md and quality.md | revise | Concept must state review independence and conditional-check enforcement separately from step completion |
| unresolved: Host capability is not protocol availability | Existing server has tools capability only; host templates/consent paths have separate responsibilities | revise | SD capability matrix must separate official protocol, installed exposure and live evidence; unsupported states block only dependent guarantees |
| problem: New presentation or MCP writer could duplicate authority | interaction-presentation.js; control-state writers; read-only MCP boundaries | revise | Reuse these canonical owners; proposals must specify compatibility and authority without a second gate/state/renderer semantics owner |

These are requirements for the concept to resolve, not accepted debt or a claim of current safe enforcement. No debt-bearing runtime change is accepted. Review pass means owners and the safe concept route are established; it does not close the above design obligations.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: architecture_runtime_depth: the approved deliverable is an integrated architectural concept across execution, human authority, recovery and host boundaries. A local structured_slice could document one interface but would not satisfy the required overall control model. No runtime implementation is authorized.
- evidence: Approved UR sections 3 and 5; this review's Architecture Impact and Structured Depth Evidence.
- transparency_note: Quick Task and Verified Change are ineligible because formal architectural decisions and control semantics are the deliverable. Full structured depth applies to the concept, not to implementing all its roadmap items.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: architecture_runtime_depth
- decisive_full_depth_triggers: Architecture/runtime target design beyond a local slice: joint execution, bypass, concurrency and recovery boundaries; cross-host authority and contract decisions are integral deliverables.
- rejected_alternative: structured_slice: locally documenting one adapter or renderer leaves required authority/execution boundaries outside acceptance. Compact modes exclude formal architecture/control work.
- missing_or_conflicting_facts: none needed to choose depth; host capabilities and exact enforcement mechanism remain explicitly unresolved concept decisions, not reasons to infer implementation scope.
- depth_evidence_refs: UR.md sections 3-5; docs/architecture/dispatcher.md; packages/mcp-server/src/server.js; packages/core/lib/control-state/run-presentation.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One complete joint control concept, approved UR goal |
| authority_boundary | fail | Trust and control boundaries must be decided in the proposed architecture; UR scope covers human authority and bypass |
| owner_consumer_coordination | pass | Existing core, CLI, MCP, presentation and host owners are identifiable; concept creates no shared executable cutover |
| full_depth_impacts_absent | fail | Overall execution/recovery architecture is the concept's explicit subject, not an isolated adapter |
| migration_propagation_bounded | pass | Concept-only files and this run's state; runtime migrations are future separately authorized work |
| failure_recovery_local | fail | The concept must cover concurrent revisions, interrupted decisions and host/transport failures across boundaries |
| independently_acceptable | pass | Concept completeness can be reviewed before any implementation |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What constitutes a complete concept and a sufficient evidence/uncertainty register? | PRD | revise |
| Which prevention and detection guarantees are feasible for each host and tool path? | SD | revise |
| Which independent approval/review evidence is needed for each proposed assurance level? | SD | revise |
| What MCP mechanisms are necessary, and how do they reuse canonical writers and presentation semantics? | SD | revise |
| Which implementation dependencies require separate new scopes or coordination with existing runs? | SD | revise |

## Related Scope Reconciliation

Current referenced state files remain active: cross-surface-executable-skill-dispatcher records UR/revise; codex-harness-conformance-slice and agdf-product-maturity-roadmap record UR; MCP architecture documentation and inspect slice record QA. These are raw current-state observations, not fresh gate evaluations or completion claims. Their approved artefacts and actual implementation must be reconciled individually in the concept; no approval transfers or edits to those runs occur here.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: Existing dispatcher and interaction context nodes are reading references only.
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: This review records scope-specific observations; no settled reusable target architecture or source-of-truth change exists yet. Re-evaluate on concept closeout.
- memory_target: scope_artifact
- memory_reason: Keep these bounded findings and open decisions with the selected run.
- memory_refs: BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Prepare UX intent input, then draft and present the concept PRD after canonical route recording.
- forbidden_until_then: SD, TP, runtime implementation, interface extension, installation and release claims.
- quality_outlook: Require observable control guarantees and honest enforcement limits instead of equating successful dispatch with controlled execution.
