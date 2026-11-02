# Brownfield Review: Complete existing MCP contracts

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: mcp-contract-completeness-20261025-01
- related_ur: .agdf/control/artefacts/mcp-contract-completeness-20261025-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex brownfield-analysis, cooperative local
- reviewed_at: 2026-10-25

## Objective

Reassess routing after TP-only source revision bf7982be-3d0c-4c94-8376-b575da83d1c9 at revision 360e7d48-0851-4e35-a24b-71d075350e6c. The direct owner decision accepts C2: two additional protected gpt-6.1-sol/low T7 sessions, at most three real invocations including the retained original failed attempt. Approved UR, PRD and SD remain byte-identical. Existing product scope remains modern capability errors, complete command discovery/results, metadata consistency and bounded evidence. Every MCP limit and the 397-file / 3509461-byte Copilot baseline remain unchanged. This analytical routing grants no implementation or model-execution authority.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Existing actions, working modes, approval authority and recovery choices remain fixed. Discovery becomes understandable and a specified capability failure becomes correctly distinguishable. No new UI, activation choice or effective-state transition is requested; the exact distinction between malformed metadata, missing capability and domain rejection is clear from the approved scope and protocol.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR and existing command family effects | UR scope preserves all five tool names, effects and approval/replay rules; run-command-contract.js declares the fixed groups | low |
| Source of truth | Core command descriptors, service and tool-error owner | packages/core/lib/control-state/run-command-contract.js; run-command-service.js; packages/core/lib/mcp-tool-errors.js | medium |
| Runtime path | Existing McpServer/serveStdio adapter and version-matched runtime | packages/mcp-server/src/server.js; ui-capability.js; packages/cli/lib/mcp-dispatch-runtime.js; installed @modelcontextprotocol/server 2.0.0 | medium |
| UI / UX | Existing discovery, domain guidance and MCP App resource delivery | server.js checks request capabilities; Core guidance remains agdf-tool-result/1; no visual change | low |
| Persistence / data | Existing Run, approval, receipt and operation owners | run-command-service.js delegates to current family owners; no stored schema migration requested | none |
| Tests / QA | Protocol, errors, gating, generation, package, safety and native evaluation infrastructure | packages/mcp-server/test/; evals/mcp-ergonomics/; scripts/host-compatibility/ | medium |
| Release / operations | Existing generated/package projection | scripts/sync-package-assets.js; scripts/assemble-npm.mjs; scripts/core-projection.mjs; package manifests | low |

Current coverage remains partially_done. CD_TESTS-02.md records twenty passed MCP test files, relevant Core/CLI checks, full build/archive consumers, exact discovery sizes and quiescent 20+20 p95. One real Codex low session completed the fixture action but failed config isolation; its original records remain immutable and unqualified in evidence/native-01/. The existing native-run.js auditor and codex-host-e2e.mjs owner were repaired, with focused parser and OS write-denial regressions. Model-free real guarded preflight passed with unchanged settings (evidence/guarded-preflight-01/). TP_GUARDED_NATIVE_DECISION-01.md records the owner answer for C2. Both new qualified native repetitions remain absent. Reassess exact source applicability under renewed TP; do not erase the old failure or relabel preflight/offline tests as native completion.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: The scope changes an externally consumed protocol error and advertises previously absent client-visible result schemas. It crosses the Core domain contract to MCP adapter/SDK boundary, while retaining current execution, persistence and decision authority.
- architecture_evidence: server.js tool registration and capability-denial branches; run-command-contract.js commandGroupDefinition and budgets; run-command-service.js result construction; mcp-tool-errors.js validateToolDomain; mcp-dispatch-runtime.js failure and decision postprocessing paths.
- architecture_missing_evidence: none for routing. Approved SD has selected the public Transport seam and Core full/compact schema ownership; candidate and tests implement these owners. Renewed implementation evidence and native trials remain pending, not routing unknowns.
- architecture_next_owner_and_action: tp-definition renews only the answered C2 native execution/cohort allowance from unchanged approved PRD/SD; Brownfield Analysis reassesses retained product/harness and evidence applicability before any additional real session.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: first real native session violated settings immutability | CD_TESTS-02.md and evidence/native-01/; exact fixture trust key matches the observed target hash; no complete before-config text diff is available | warn | Preserve original failure and untouched user config; existing T7 owner now enforces macOS write denial and three manifest stages. Renew exact TP execution authority before new guarded sessions |
| problem: auditor falsely rejected pure Promise projection and classified SDK input rejections | native-run.js repair, focused regression logs and derived-wrapper-reanalysis-02.json; original raw records unchanged | warn | Existing auditor owns the narrow correction; do not accept arbitrary effects or unclassified errors, and do not waive the independent config violation |
| Existing Core/adapter/generation ownership is retained | run-command-contract.js, mcp-dispatch-runtime.js, server.js/ui-capability.js; actual deterministic/build/archive evidence in implementation-02 | none | Reuse these approved owners and assess evidence applicability; no new dispatcher, policy registry, writer, SDK patch or persistence model |
| Public discovery has limited measured headroom | Four actual assembled compositions, 24509 bytes maximum against unchanged 24576; command maximum 7083 against 8192 | warn | Preserve the exact MCP budgets and metadata; retain qualified measurement and remeasure only if affected executable/schema inputs change |
| C2 adds bounded account usage, not a product authority | Owner answer accepts two additional sessions, gpt-6.1-sol/low, existing ChatGPT, no extra API spend; guard preflight has zero model invocations | warn | TP binds max three Run-wide real invocations including old failure; new first-session infrastructure/isolation failure stops its second, with no retry/fallback |

No deliberate technical-debt acceptance is proposed. The original isolation failure is retained and its implementation cause is mitigated by the existing host owner; real guarded model evidence is still a required execution obligation. The public Core -> runtime projection -> SDK adapter owner boundary stays unchanged. No separate diagram is needed to settle this bounded evaluation-harness refinement.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: TP
- scope_reason: external_contract_depth: modern MCP error classification and new advertised command result schemas change a compatibility-sensitive public integration contract. Quick Task and Verified Change are ineligible because this is more than internal correctness and changes external protocol/schema behavior. structured_slice is rejected because full_depth_impacts_absent fails on that evidenced external boundary, not because of file/tool counts.
- evidence: This review's Architecture Impact, Reuse And Parallel-Structure Risk and Structured Depth Evidence; approved UR; packages/mcp-server/src/server.js; packages/core/lib/control-state/run-command-contract.js.
- transparency_note: Full-depth artefacts cover the affected protocol, domain/result, compatibility and evidence boundaries only. No deployment, migration, new permission model or tool regrouping is added. Existing PRD/SD approvals remain exact under the revision receipt; TP must be freshly drafted, recorded and approved.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: external_public_contract: a modern protocol error code/data contract changes and client-visible output schemas are introduced for existing commands; legacy interoperability must be separately preserved.
- rejected_alternative: structured_slice; full_depth_impacts_absent fails for the explicitly affected compatibility-sensitive external protocol contract. Quick Task/Verified Change are ineligible for the same impact.
- missing_or_conflicting_facts: none decisive for routing. Detailed schema representation and pre-handler mechanism remain SD work; evaluation mechanics remain TP work.
- depth_evidence_refs: approved UR sections 3 and 5; server.js capability denial and tool registration; run-command-contract.js commandGroupDefinition; official MCP 2026-07-28 basic metadata and tools/output-schema sources linked from UR; installed SDK setToolRequestHandlers/validateToolOutput.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Existing commands become self-describing and yield compatible, correctly classified responses; approved UR fixes the acceptance boundary |
| authority_boundary | pass | Core retains command effects, target/revision/source checks and deliberate human decisions; no new trust or permission authority |
| owner_consumer_coordination | pass | Core contracts, runtime projection, server adapter, generated consumers and evaluators are identified; no shared external cutover is requested |
| full_depth_impacts_absent | fail | Advertised external result schemas and protocol -32021/data semantics are compatibility-sensitive public contract changes |
| migration_propagation_bounded | pass | Existing generated/package owners project current source; no stored-data migration or installed-host rollout belongs to this scope |
| failure_recovery_local | pass | Existing error projector, original-operation UUID/status and owned-worker shutdown stay authoritative; adapter defects remain within the candidate |
| independently_acceptable | pass | Approved UR has protocol, schema, consistency, safety/budget and targeted native acceptance; tool regrouping and predecessor UAT remain separate |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| None upstream: renew the answered C2 native execution/evidence allowance, retaining approved behavior, ownership and all budgets | TP | warn |

The owner answer is recorded, and the guard/auditor implementations and model-free preflight are observable. No new product or design authority is inferred. Renewed TP approval and required preparation still precede all additional model use.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#mcp_error_contract_phase1_20261019; .agdf/control/CONTEXT_GRAPH.md#mcp_inspect_document_contract_phase2_20261020; .agdf/control/CONTEXT_GRAPH.md#mcp_ergonomics_baseline_20261017
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes link Core result ownership, discovery budgets and distinct protocol/native qualification limits. This review links them without rewriting historical nodes or creating a new node. Reassess durable findings at closeout.
- memory_target: scope_artifact
- memory_reason: Contract gaps and routing evidence are specific to this Run; prior reusable boundaries are already recorded.
- memory_refs: This Brownfield Review and the existing graph nodes above.

## Next Permissible Step

- next_allowed_action: Record this reassessed review and unchanged structured_delivery route together; the source-revision receipt preserves PRD/SD approvals, so fresh gate evaluation must route the same Run to renewed TP authoring.
- forbidden_until_then: Resumed implementation or additional native model execution before renewed TP approval and Brownfield preparation; global config cleanup or changed budgets; predecessor UAT recording and VCS/release actions.

## Quality Outlook

- quality_outlook: Existing Core and transport owners provide a bounded reuse path. Approved public-contract intent and design remain unchanged. Retained implementation needs renewed source-bound assessment; native evidence remains pending. C2 neither relaxes any MCP limit nor converts the retained failed native cohort into qualified evidence.
