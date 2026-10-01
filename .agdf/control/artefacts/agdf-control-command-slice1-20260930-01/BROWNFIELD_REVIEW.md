# Brownfield Review: One Approval-Recording Command

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: agdf-control-command-slice1-20260930-01
- related_ur: UR.md; approved revision f0a79d98-2d53-4c8f-bf2e-61ffc0a94804
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-09-30
- decision: pass

## Objective

Size the approved outcome around recording one deliberate reply to a previously prepared current gate presentation, advancing that Run once and exposing the actual authority/evidence boundary. This review selects an existing transition, not an implementation or a new human-identity system.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The command makes the effective approval state, replay/conflict outcome and evidence assurance visible to consumers; confusing a caller assertion with verified human authority would materially mislead the primary decision.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready; UX_INTENT_DEFINITION.md is non-authorizing analytical input for PRD

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Runtime gate-transition and interaction contracts | Exact replies, prior presentation, current Run binding and post-approval continuation already required | high |
| Source of truth | control-state Run and referenced artefacts | run-state-writer.js and run-seal.js; no second state store is needed | medium |
| Runtime path | CLI handlers and local validator; MCP read/dispatch adapters | validation-handlers.js delegates approval to approveRunGate; control-inspect/service.js reuses evaluators | medium |
| UI / UX | interaction-presentation and run-presentation-render | Existing approve/revise/decline choices and canonical presentation; no new UI renderer | medium |
| Persistence / data | run-recording, run-presentation, run-state-writer | Exact revision/content checks, presentation digests, locked atomic Run write | medium |
| Tests / QA | intake-continuation-test, control-state-test, run-step-transaction-test | Fixtures cover stale presentation and concurrent approval; no new test was run in this review | medium |
| Release / operations | Existing package/runtime projectors | Source, generated package and installed host must be qualified separately; no install or release in this planning stage | low |

## Current Coverage And Reuse

- fully_done (source evidence): common evaluators; exact gate/revision/presentation validation; Run locking and atomic replacement; deliberate-reply formula; non-authorizing read tools.
- partially_done: explicit executable action identity; command/result binding across adapters; distinguishable retry acknowledgement; recovery guarantees for this specific approval operation.
- not_done / not evidenced: independent host-issued proof of human visibility/decision in the inspected CLI path. run-recording.js supplies responseOrigin itself, and run-presentation.js explicitly disclaims human-visibility proof.
- reuse_strategy: extend the existing approval-recording service boundary and consumer adapters; preserve the canonical writer and presentation owner. Extract shared orchestration only if the later SD demonstrates a concrete responsibility that needs it.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: The proposed command exposes an explicit authority/assurance contract and externally consumed execution result. This is a full-depth authority/public-contract effect even though the selected outcome is narrow.
- architecture_evidence: UR Scope and Acceptance Signals; run-recording.js:109-151; run-presentation.js:28-60; validation-handlers.js:157-166; control-inspect/service.js:12-15; mcp-dispatch-runtime.js:129-161.
- architecture_missing_evidence: No independently verifiable host decision channel has been evidenced. This is a declared guarantee ceiling, not a prerequisite hidden behind a stronger claim.
- architecture_next_owner_and_action: PRD defines the supported assurance ceiling and user outcome; SD assigns verification and command/result persistence to the existing owners.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: caller assertion can be mistaken for independently verified human authority | run-recording.js sets responseOrigin to deliberate_user_input; run-presentation.js says prepared evidence is not human-visibility proof | revise | PRD must distinguish the cooperative caller contract from independent verification; SD must reject unsupported stronger authority claims. |
| problem: a new kernel package or MCP handler could duplicate policy and writing | Existing control-evaluation, control-state and thin MCP transport already share responsibilities | revise | SD must reuse these owners; no generic set_state, independent policy map or adapter-owned writer. |
| problem: same evaluator does not imply same observed inputs | CLI uses cliGitObservation; control-inspect states Git observation is absent | warn | Bind/report observations relevant to the selected operation and test missing observations; do not assert universal CLI/MCP parity. |
| trade-off: retain a cooperative local approval lane while independent host provenance is unavailable | Existing interaction contract delegates display and verbatim response transfer to host/agent | warn | Preserve compatibility and label the guarantee accurately; never use this lane as independent proof or to preserve historical approvals. |
| problem: unrelated approval-recovery design gap overlaps the mechanism but not this delivery scope | restore-unsealed-active-run-records-20260929-01/QA_REPORT.md, TPR-APPROVAL-SOURCE | warn | Link the gap as related evidence. This Run neither closes it nor changes historical approval-preservation policy. |

### Retained Debt Detail

- finding: trade-off: retain a cooperative local approval lane while independent host provenance is unavailable
- rationale: The approved UR explicitly permits an accurately described cooperative-host result when no verifiable decision channel exists; introducing a fabricated receipt or identity platform would exceed that boundary.
- accountable_owner: AGDF approval-recording owner; product decision in this Run's PRD, technical enforcement in its SD.
- mitigation: Visible structured assurance and provenance limitation; reject claims of independent human verification; preserve exact current presentation/revision requirements.
- review_date_or_exit_condition: Before enabling any independently verified approval lane or claiming adversarial non-bypassability, require a separately accepted host evidence producer, verifier and visible end-to-end host proof.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth; the selected approval command changes how consumers express and assess authority and adds an execution/result contract. structured_slice is rejected because authority_boundary and full_depth_impacts_absent fail; compact paths exclude authority/public-contract effects.
- evidence: This review, UR.md, plugin/meta/contracts/modes.md, run-recording.js and run-presentation.js.
- transparency_note: Full depth covers the actual affected command and assurance boundary; it does not enlarge the scope into a universal kernel, write API, host rollout or identity platform.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: authority_policy_security_depth
- decisive_full_depth_triggers: authority/assurance contract; external/public command/result contract
- rejected_alternative: structured_slice; quick_task and verified_change are ineligible because authority and public-command behavior are affected.
- missing_or_conflicting_facts: none decisive for routing; host provenance and technical retry mechanism remain explicit later-gate design/evidence questions.
- depth_evidence_refs: UR.md; this review's Existing-System View and Architecture Impact; plugin/meta/contracts/modes.md; create-agdf/lib/control-state/run-recording.js; create-agdf/lib/control-state/run-presentation.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One current gate reply is recorded and its resulting Run state is observable. |
| authority_boundary | fail | New explicit guarantee/authority contract; existing caller assertion cannot establish independent human provenance. |
| owner_consumer_coordination | pass | Existing approval service, writer, CLI and selected local consumer; no shared host cutover is required for this slice. |
| full_depth_impacts_absent | fail | Authority and compatibility-sensitive consumer contract are materially affected. |
| migration_propagation_bounded | pass | Existing approvals remain unchanged; new historical provenance is not invented; compatibility and any new record are SD obligations. |
| failure_recovery_local | pass | Selected operation uses the canonical local Run writer; recovery remains within the selected Run. |
| independently_acceptable | pass | Cooperative guarantee ceiling is an explicit accepted UR alternative, with no hidden external identity prerequisite. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which user-visible assurance and retry/conflict outcomes are supported? | PRD | revise |
| Does this slice require a mutating MCP consumer or suffice with CLI/local service plus read-only MCP observation? | PRD | revise |
| How are accepted retries recognised without a second approval or authoritative state store? | SD | revise |
| Which observations, policy identity and scope digest are required for this specific transition? | SD | revise |
| Which failure boundaries and environments must the selected evidence cover? | TP | revise |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_required_action: link
- context_graph_gate_effect: warning
- context_graph_evidence: Existing nodes already own durable Runs and thin MCP adapters. Run-specific findings stay here; closeout must reconcile the accepted result with those owners.

## Next Permissible Step

- next_allowed_action: Record this review and route; perform required UX Intent Definition; prepare the current PRD and present it for a new deliberate approval.
- forbidden_until_then: SD, TP, production implementation, gate auto-approval, installation/release claims, historical approval recovery or broader kernel replacement.

## Quality Outlook

- quality_outlook: Existing-system owners and full-depth route are evidenced; the next product artefact must make the assurance ceiling and consumer scope explicit. No implementation or test-pass claim is made.
