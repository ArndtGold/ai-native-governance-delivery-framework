# Brownfield Review: MCP error contract, Phase 1

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: mcp-error-contract-phase1-20261019-01
- related_ur: .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-19
- source_commit: a66a14cac6f405192f0021407e6ac1cf219b39e7
- approved_ur_revision: 7790ae7e-d596-4dc1-8b31-a40a1cb35105

## Objective

Size the approved outcome: recognizable actual MCP failures with specific, safe correction guidance across the existing AGDF tools, Cockpit and worker boundaries. Source review only: no implementation or native-host qualification is claimed.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The primary error state, visible feedback and recovery action change for model-driven tool calls and their human readers. A successful blocked-state read must remain distinct from an actual failed operation; uncertain writes must guide observation rather than blind retry. This is a bounded interaction change, without a new approval authority or user mode.
- ux_intent_definition_required: yes
- ux_intent_definition_result: blocked

The required analysis is pending, not failed. It will clarify scenarios and evidence limits before PRD readiness. No UI preview was requested; an analytical scenario walkthrough suffices.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Core dispatch/inspect/command outcomes and AGDF contracts | packages/core/lib/control-state/run-command-service.js distinguishes rejected, recovery_required, effect_unknown, accepted and already_applied; plugins/agdf/meta/contracts/ | medium |
| Source of truth | Core decisions and operation receipts; CLI composes runtime failures | .agdf/control/SOT_REGISTRY.md; packages/cli/lib/mcp-dispatch-runtime.js | low |
| Runtime path | MCP server, worker and generation facade | packages/mcp-server/src/server.js toolResult serializes results without an error flag; worker-entry.js catch collapses causes; worker.js retains timeout/cancellation capacity control; generation-entry.js tracks unknown operations | medium |
| UI / UX | Agent-visible content and current Cockpit/decision consumers | server.js content/structuredContent; packages/core/lib/control-inspect/cockpit-session.js; packages/control-ui/src/mcp/transport.ts | medium |
| Persistence / data | Existing run journal, operation identities, receipts and source bindings | run-command-service.js; approved UR requires unchanged authority and recovery checks | none |
| Tests / QA | Existing protocol, safety, run-command, Cockpit and generation suites; ergonomics evaluation | packages/mcp-server/test/protocol.test.js, safety.test.js, run-command.test.js, cockpit-gating.test.js, generation.test.js; evals/mcp-ergonomics/ | medium |
| Release / operations | Exact-version packaged runtime, generated payload and existing installers | packages/mcp-server/package.json pins SDK server 2.0.0; packages/cli/lib/mcp-dispatch-runtime.js provenance checks; no rollout requested | low |

SDK evidence: the locally installed server package identifies version 2.0.0. Its dist/mcp-D7GmuPnv.cjs tools/call handler validates input before calling the tool and creates isError results on ordinary handler/validation exceptions; output validation returns early on isError. Existing protocol.test.js separately checks SDK schema failures with isError true and domain target_unresolved without it, for both 2025-11-25 and 2026-07-28. Therefore a protocol-wide remapping or SDK upgrade is not justified by this need.

Current coverage: partially_done. Existing Core effects and receipts, SDK validation errors, fixtures and comparison tooling are reusable. Actual domain failures lack consistent MCP error signalling and actionable recovery. The historical baseline remains evidence of its captured source, not a fresh measurement of this checkout.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: The externally consumed MCP result contract and worker-to-runtime error boundary change. Correctness depends on preserving Core decisions and known execution effects while changing their delivery to models/hosts. This is an external compatibility obligation even if the code diff is local.
- architecture_evidence: packages/mcp-server/src/server.js; packages/mcp-server/src/worker-entry.js; packages/mcp-server/src/worker.js; packages/mcp-server/src/generation-entry.js; packages/cli/lib/mcp-dispatch-runtime.js; packages/core/lib/control-state/run-command-service.js; packages/mcp-server/test/protocol.test.js.
- architecture_missing_evidence: Exact new result fields and consumer compatibility treatment remain SD design work; native recovery behavior remains an implementation/evidence obligation. Neither is required to establish the evidenced external-contract full-depth trigger.
- architecture_next_owner_and_action: Existing Core, CLI/runtime and MCP owners must define the compatible mapping in SD after PRD acceptance. No separate policy service or state store.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Domain failures are delivered as ordinary results | server.js toolResult; baseline QA_REPORT.md F01 | warn | MCP owner must project existing failure meaning into isError and visible recovery without re-evaluating gate policy. PRD defines cases; SD defines placement. |
| problem: Worker failure mapping loses cause and execution boundary | worker-entry.js catch; worker.js DispatchExecutionError; mcp-dispatch-runtime.js failure | warn | Runtime/MCP owners must retain trustworthy known causes and dispatch evidence. Preserve genuinely unknown effects rather than guessing non-execution. |
| problem: Repair hints may imply an unsafe replay or wrong repair | mcp-dispatch-runtime.js FAILURE_ACTIONS and command failure branch | warn | Reuse Core operation-status, original UUID and payload checks. PRD requires safe next actions; SD owns deterministic guidance and unknown-code treatment. |
| problem: Blocked reports and failed reads share similar words | cockpit.js status projection versus cockpit-session.js failure; baseline I-SEM-UNKNOWN-RUN | warn | UX/PRD must distinguish successful report delivery from failure to fulfil the selected operation. No blanket substring or state=blocked classifier. |
| problem: Independent per-tool recovery text could become a parallel policy | Core outcomes, CLI failure construction and MCP delivery are distinct owners | warn | Extend existing owners; derive transport classification and guidance from their semantics. Do not introduce a second gate/retry authority. |

No retained-debt exception is proposed or accepted. These are existing problems to resolve under this run, not waived obligations. No diagram is needed to settle the observed ownership boundary.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: actual MCP result error signalling and recovery feedback change a compatibility-sensitive external protocol contract. Compact/Verified Change are ineligible because external behavior changes. Rejected alternative structured_slice: full_depth_impacts_absent fails on the evidenced external-contract boundary, regardless of file or owner counts.
- evidence: This review's Architecture Impact and Structured Depth Evidence; approved UR ERR-01 through ERR-06; server.js; protocol.test.js.
- transparency_note: Full gate sequence, with artefacts focused on this error contract and affected consumers. No unrelated feature, general schema redesign, performance or release work is added. UX analysis precedes PRD readiness; implementation-preparation Brownfield Analysis is required again after TP approval.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: external_or_public_contract
- rejected_alternative: structured_slice; externally consumed failure flags and guidance change, so the absence of full-depth external-contract impact cannot be evidenced.
- missing_or_conflicting_facts: none for depth selection; later product and design questions are listed below.
- depth_evidence_refs: packages/mcp-server/src/server.js; packages/mcp-server/test/protocol.test.js; packages/cli/lib/mcp-dispatch-runtime.js; approved UR.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | UR defines one outcome: recognizable failures and actionable correction. |
| authority_boundary | pass | UR preserves Core decisions, source bindings and human approval; no new trust permission or authority is requested. |
| owner_consumer_coordination | pass | Core/CLI/MCP/consumer owners are identified; compatibility must be covered in SD using their existing contracts. No independent migration is requested. |
| full_depth_impacts_absent | fail | Externally consumed MCP error flag/result interpretation and recovery contract change; server.js and protocol.test.js demonstrate the boundary. |
| migration_propagation_bounded | pass | Existing package/provenance flow can propagate the change; no persistent schema migration or host installation is part of this scope. SD must verify result compatibility. |
| failure_recovery_local | pass | Existing operation-status, UUID, receipt and unknown-effect recovery owners are available; this run changes their communication, not their authority. |
| independently_acceptable | pass | UR acceptance is independently testable; new intake tools, performance and broad host qualification are explicitly excluded. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which actual failed operations versus successful blocked-state reports must receive isError? UX analysis supplies scenarios; PRD owner Codex resolves product acceptance under approved UR. | PRD | warn |
| Which guidance is observable for correction, denied access, stale revisions and uncertain effects without authorizing a retry? UX/PRD owner Codex. | PRD | warn |
| Where does one compatible classification/projection live, and which fields/locale behavior are preserved? Existing Core/CLI/MCP design owners through SD, accountable Arndt Gold. | SD | warn |
| How are SDK-owned validation errors, both supported protocol eras, Cockpit consumers and generation replacement covered? SD defines compatibility; TP makes scenarios executable. | SD | warn |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: The existing node links the baseline; only verified implementation/recovery results should be reconciled at closeout. This review creates no graph node and makes no completion claim.

## Next Permissible Step

- next_allowed_action: Record this review and route together, then perform the required UX Intent Definition and derive PRD.
- forbidden_until_then: Implementation, new approval inference, installation, VCS and publication.

## Quality Outlook

- quality_outlook: Review pass for sizing and routing. Reuse existing Core outcomes, transport boundaries, fixtures and evals. UX, PRD/SD/TP decisions and implementation/native evidence remain pending; no production behavior has changed.
