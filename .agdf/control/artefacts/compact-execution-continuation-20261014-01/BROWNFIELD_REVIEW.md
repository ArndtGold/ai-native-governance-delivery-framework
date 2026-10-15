# Brownfield Review: Compact execution continuation

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: compact-execution-continuation-20261014-01
- related_ur: .agdf/control/artefacts/compact-execution-continuation-20261014-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-14
- decision: pass

## Objective

Size and route only the approved repair of executable continuation for canonical Quick Task Execution and eligible Verified Change, including verification of the updated local Codex plugin. Preserve compact prerequisites and existing recording/closeout authority.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Restore already permitted agent execution instead of stopping at a status card; existing human gate choices, documents, interaction owner and approval meaning remain unchanged. Preserve truthful progress, blockers and explicit status.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR and compact contracts | UR.md; plugins/agdf/meta/contracts/modes.md and gate-transition.md | medium |
| Source of truth | Core policy and canonical Run writers | packages/core/lib/control-evaluation/gate-policy.js; control-state/run-steps.js | low |
| Runtime path | Core dispatcher and shared continuation service | packages/core/lib/skill-dispatch/service.js; delivery-continuation/service.js | high |
| UI / UX | Existing interaction renderer and host-action contract | plugins/agdf/meta/contracts/interaction.md; packages/core/lib/interaction-presentation.js | low |
| Persistence / data | Existing recording and closeout operations | packages/core/lib/control-state/run-command-service.js; run-steps.js; control-evaluation/closeout-readiness.js | low |
| Tests / QA | Existing dispatch, compact eligibility and MCP tests | packages/cli/scripts/skill-dispatch-test.js; verified-change-test.js; packages/mcp-server/test/ | medium |
| Release / operations | Supported content-derived local Codex installer | package.json install:codex; packages/cli/scripts/install-local-plugin.js; installed provenance marker | medium |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: The change affects the shared agent-execution handoff and its externally consumed CLI/MCP outcome. It must preserve the single Core eligibility/permission owner and canonical writers while enabling permitted compact execution.
- architecture_evidence: gate-policy.js currently gives both executable compact gates the fallback resolve_control_state operation; skill-dispatch/service.js has a nonterminal implementation branch for structured CD+Tests but no compact equivalent; installed-baseline.json reproduces the resulting terminal responses.
- architecture_missing_evidence: none for ownership and route sizing; detailed interrupted-execution handling and installed transport qualification belong to SD/TP and later verification.
- architecture_next_owner_and_action: Existing Core policy/dispatcher owners under this Run; PRD defines observable continuation boundaries, then SD defines the minimal shared handoff and compatibility treatment.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: compact permission lacks an executable handoff | evidence/installed-baseline.json; gate-policy.js semanticOperation; skill-dispatch/service.js implementation and terminal branches | revise | Extend the existing Core operation/dispatcher ownership; retain each compact path's prerequisites. |
| problem: separate execution policy would duplicate authority | Core index.js uses delivery-continuation/service.js for CLI/MCP; run-step-policy.js reuses gate-policy.js | revise | Keep eligibility, approved scope and completion with current owners; derive handoffs from canonical evaluated state. |
| problem: replayed compact work could repeat an already performed change | run-steps.js review and closeout; verified-change.js eligible/executed distinction | revise | SD/TP must specify bounded interruption/re-entry, evidence applicability and completion tests. Do not claim durable exactly-once implementation. |
| problem: installed and running generations can differ | plugin runtime provenance and immutable MCP generation paths | revise | Verify the newly installed build and actual launched runtime identity separately; identify any native host observation still outstanding. |

No deliberate debt acceptance or alternate source of truth is proposed. These findings are scoped implementation/verification obligations, not unresolved product-authority decisions.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: architecture_runtime_depth: Repair changes the shared execution-orchestration boundary and externally consumed continuation behavior for both compact routes. Quick Task is ineligible for this governance-runtime change; Verified Change explicitly prohibits runtime, gate and external contract impact. Reject structured_slice because a full-depth runtime trigger is evidenced, although the final implementation must stay bounded.
- evidence: Approved UR; evidence/installed-baseline.json; packages/core/lib/control-evaluation/gate-policy.js; skill-dispatch/service.js; delivery-continuation/service.js; plugins/agdf/meta/contracts/modes.md.
- transparency_note: Structured Delivery is needed for this framework repair; the repaired user workloads retain their existing quick_task and verified_change routes. This decision grants no implementation permission.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: architecture_runtime_depth
- decisive_full_depth_triggers: Architecture or runtime (shared permitted-execution orchestration); external or public contract (CLI/MCP continuation outcome semantics).
- rejected_alternative: structured_slice; evidenced full-depth execution/protocol impact prevents the bounded-slice classification. Compact paths were assessed first and are ineligible for this repair's effects.
- missing_or_conflicting_facts: none for depth selection.
- depth_evidence_refs: evidence/installed-baseline.json; Core files listed in Existing-System View; plugins/agdf/meta/contracts/modes.md Structured Depth Decision.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR repairs exactly two existing compact execution handoffs. |
| authority_boundary | pass | No new authority: Core remains eligibility owner and exact approval/Run/revision boundaries remain binding. |
| owner_consumer_coordination | pass | Existing Core, CLI/MCP adapters, generated runtime and supported local installer; no new decision owner. |
| full_depth_impacts_absent | fail | Shared runtime execution and CLI/MCP continuation semantics change; full-depth triggers are evidenced. |
| migration_propagation_bounded | pass | Existing generators and content-derived local installation; no persisted schema migration is proposed. |
| failure_recovery_local | pass | Existing bound re-evaluation and writer refusal/recovery; SD/TP must retain concrete blockers and completed-run guards. |
| independently_acceptable | pass | Positive compact handoffs plus refusal scenarios and installed-build verification define acceptance without another feature. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Exact structure of compact execution handoffs and in-progress re-entry | SD | revise |
| Supported actual CLI/MCP qualification when Verified Change Git observations are unavailable | SD | revise |
| Disposable complete-flow fixtures, locality of installed runtime evidence and native host observation sequence | TP | revise |

Product decisions are supplied by the approved UR: preserve authority and compact eligibility, continue permitted work without redundant user prompts, and verify the installed Codex build. Detailed design/planning questions have existing owners and do not block PRD drafting.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY and CG-MCP-DISPATCH-ADAPTER remain authoritative; this review changes no graph owner. Run-specific baseline evidence stays in this scope. Assess any durable new invariant at closeout through existing context ownership.
- memory_target: scope_artifact
- memory_reason: Keep bounded reproduction, design and verification evidence with this repair Run.
- memory_refs: .agdf/control/artefacts/compact-execution-continuation-20261014-01/

## Next Permissible Step

- next_allowed_action: Draft the PRD through its existing bound owner and prepare its exact decision presentation.
- forbidden_until_then: Implementation, approved-source editing, plugin reinstall and transfer of other Runs' approvals remain disallowed before their applicable gates.

## Quality Outlook

- quality_outlook: Demonstrate permitted compact continuation and protected refusal/completion behavior through source, installed-runtime and separately stated host evidence.

## Baseline Reproduction And Limit

The actual installed gate policy and dispatcher were imported by evidence/installed-baseline-repro.mjs. Target resolution, evaluated control input and status text were supplied at explicit disposable unit seams; no live Run implementation or human approval was exercised. An initially incomplete synthetic route lacked scope_reason/evidence and correctly routed to Mode/Slice recovery; the retained harness supplies complete route facts and asserts the expected baseline states.

The retained run confirms quick_task and eligible verified_change return control_result, terminal true, with resolve_control_state/effect none; structured CD+Tests returns skill_continuation, phase implementation, terminal false. This is executed installed-code evidence, not live repository eligibility, MCP protocol or native-host proof. Installed build: 0.14.5+codex.local-2459f4dd156c. Source/Runtime checksums and exact code identity were previously verified in this chat.
