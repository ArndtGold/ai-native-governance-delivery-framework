# Brownfield Review: Self-describing MCP inspection

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done
Decision: pass

## Run

- run_id: mcp-inspect-contract-phase2-20261020-01
- related_ur: .agdf/control/artefacts/mcp-inspect-contract-phase2-20261020-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-20

## Objective

Size the approved inspection-contract scope: explain the existing tool and provide a complete MCP-only route to the exact presented document, preserving bindings, read-only behavior and Phase 1 errors. The original UR was approved through operation 40e3754c-1628-4e4d-80a3-8ab922ecc206 against presentation f3ab2ef5-548e-4d09-b6e6-9f0fafae5604. No implementation is authorized here.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Clarify an existing agent-facing read flow and its inputs; preserve the human decision, rendered document, activation, modes, frozen identity and recovery semantics. No UI redesign or ambiguous human working mode is introduced.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; existing presentation reader | UR.md; packages/core/lib/control-state/run-presentation.js readPresentationDocument | low: make the same exact document reachable without guessing |
| Source of truth | Core inspection contract and selection rules | packages/core/lib/control-inspect/contract.js; selection.js | medium: descriptions and operation requirements must have one canonical owner |
| Runtime path | Core service, CLI projection, MCP SDK adapter | packages/core/lib/control-inspect/service.js; packages/cli/lib/mcp-dispatch-runtime.js; packages/mcp-server/src/server.js | medium: externally discovered contract reaches several model hosts |
| UI / UX | Existing MCP inspection and frozen document presentation | contract.js; run-presentation.js | low: no new UI, approval or document state |
| Persistence / data | Existing immutable presentation records and operation receipts | run-presentation.js; run-operations.js | none: no new writer, record format or migration is needed |
| Tests / QA | Existing protocol and native ergonomics tooling | packages/mcp-server/test/contract.test.js; structured-flow.test.js; evals/mcp-ergonomics/ | medium: verify discoverability, content completeness and backward compatibility separately |
| Release / operations | Existing build and generated projections | scripts/sync-package-assets.js; scripts/assemble-npm.mjs; packages/mcp-server/test/package.test.js | low: ordinary propagation, no installation or release in this scope |

Current coverage is partial. All fourteen inspect parameters lack individual descriptions. A direct import of the canonical definition on 2026-10-20 measured 4,723 bytes against CONTROL_INSPECT_MAX_DEFINITION_BYTES=5,000. The 277-byte remainder cannot be treated as permission to increase that limit; SD must budget the whole useful contract.

readPresentationDocument already validates target, run, gate, original revision and presentation, reads an immutable snapshot, returns byte ranges, content identity, complete and next_cursor, and marks historical applicability. Its 32,768-byte page boundary is UTF-8 safe. Reuse this reader; do not create another filesystem/document authority. Preserve historical read semantics rather than declaring every non-current snapshot unreadable.

The operation-contract response exposes target/run/revision binding, and preparation exposes a presentation ID. Inspection discovery does not currently advertise a supported exact lookup of an already presented document's ID from the T4 request alone. The T4 fixture prepares an immutable document but its task prompt names only the run; injecting the fixture's expected UUID would hide the missing contract. PRD/SD must define a supported read-only discovery route through existing inspection operations, with ambiguity and historical/current applicability explicit. Creating another presentation through agdf_prepare is not proof of reading the originally presented one.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: The model-visible externally consumed MCP contract and the discovery of exact presentation bindings change. Existing Core ownership and semantic writers remain intact.
- architecture_evidence: packages/core/lib/control-inspect/contract.js and service.js; packages/core/lib/control-state/run-presentation.js; evals/mcp-ergonomics/lib/fixtures.js presentedUr; tasks.v1.json T4.
- architecture_missing_evidence: none for route selection; exact contract representation and lookup policy require SD after product acceptance is fixed.
- architecture_next_owner_and_action: prd-definition fixes the exact-document and ambiguity behavior; sd-definition owns a bounded compatible projection through the existing Core contract and reader.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Parameter meaning and binding discovery are absent from the exposed read contract | contract.js parameters; service.js operation-contract; T4 fixture/prompt | revise | PRD defines discoverability and ambiguity acceptance; SD extends the existing Core owner without filesystem/ID guessing. This is the approved problem being routed, not accepted debt. |
| problem: Contract budget has only 277 bytes of current headroom | canonical controlInspectDefinitionBytes=4723; limit=5000 | revise | SD budgets descriptions, examples and schema together; preserve the limit and eliminate representational duplication through the existing owner if necessary. |
| problem: Original native T4 verifier is weaker than the approved complete-flow claim | native-tasks.js all_document_pages checks matching presentation, distinct offsets and a complete flag; mcp_only permits Read | revise | Preserve v1 historical metrics and fixtures; add trace/content proof for ordered exact bytes and absence of shell/control-file ID lookup. Do not count the original predicate alone as stronger evidence. |
| problem: Host evidence is narrower than green CI | retained win32-x64 baseline; current local claude executable exists but no session was invoked | warn | TP binds the native candidate, environment, models, repetitions, credentials isolation and explicit cost cap before execution. No native claim follows from binary availability. |

No debt trade-off is accepted. These known requirement/design/test obligations have existing downstream owners; they do not prevent a safe route. A proposal that leaves an obligation unresolved at its required gate must return to that owner.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: model-visible MCP call/discovery contracts consumed by independent hosts require explicit compatibility treatment. Quick/Verified routes exclude this impact; structured_slice is rejected because full_depth_impacts_absent cannot pass for this external contract change.
- evidence: This review's Architecture Impact and Structured Depth Evidence; approved UR; contract.js; service.js; run-presentation.js; original T4 fixture and task.
- transparency_note: Full-depth contract and qualification decisions are required, while implementation remains restricted to the one inspection/document outcome. This is not permission to expand into command tools, intake, UI, performance or rollout work.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: external_or_public_contract: change to externally discovered parameter semantics and supported binding discovery through MCP; host compatibility needs explicit evidence.
- rejected_alternative: structured_slice because the published MCP contract changes; quick_task and verified_change because this is not a single-owner internal correctness-only fix and native-agent acceptance is mandatory.
- missing_or_conflicting_facts: none decisive for choosing the route; downstream contract representation and native execution parameters are identified obligations.
- depth_evidence_refs: packages/core/lib/control-inspect/contract.js; packages/core/lib/control-inspect/service.js; packages/core/lib/control-state/run-presentation.js; evals/mcp-ergonomics/tasks.v1.json; evals/mcp-ergonomics/lib/native-tasks.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR: discover and read the exact full presented document through MCP. |
| authority_boundary | pass | Core keeps binding, reads, snapshots, receipts and approvals; MCP only projects. |
| owner_consumer_coordination | pass | Core/CLI/MCP/eval owners identified; no shared deployment is authorized. |
| full_depth_impacts_absent | fail | Published call/discovery contract is externally consumed; external_contract_depth applies. |
| migration_propagation_bounded | pass | Existing generation and assembly paths; no persistent schema migration is proposed. |
| failure_recovery_local | pass | Existing reader and Phase 1 errors remain canonical; revert candidate source/generated projection locally. |
| independently_acceptable | pass | Exact frozen document and ordered bytes, no guessing or shell fallback, preserved guard behavior; no later command-tool slice is required. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which presented document is intended when no exact presentation is named and several valid records exist? | PRD | revise: define a unique or explicit-ambiguity result; never choose by recency alone. |
| How are all descriptions, discoverable bindings and operation requirements exposed inside 5000 bytes? | SD | revise: single canonical owner and compatibility proof required. |
| How is native exact-byte/order and no hidden-identifier lookup evidence added without rewriting historical v1 metrics? | TP | revise: retain original task identity and report the additional evidence separately. |
| Which installed host/model and paid-run ceiling can produce the required actual native evidence? | TP | revise: no execution or native-success claim before bound availability and cost authorization. |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter
- context_graph_required_action: link
- context_graph_gate_effect: warning
- context_graph_evidence: Existing CG-MCP-DISPATCH-ADAPTER remains the canonical architecture node; link final scope/qualification at closeout rather than create a new node or change authority now.

## Next Permissible Step

- next_allowed_action: Record this review and its route together, then prepare the bounded PRD from the approved UR.
- forbidden_until_then: Implementation, new approvals, native paid sessions, installation and publication.

## Quality Outlook

- quality_outlook: Existing owners are understood and the route is safe; product ambiguity, definition-budget design and stronger native proof must be resolved at the named gates.
