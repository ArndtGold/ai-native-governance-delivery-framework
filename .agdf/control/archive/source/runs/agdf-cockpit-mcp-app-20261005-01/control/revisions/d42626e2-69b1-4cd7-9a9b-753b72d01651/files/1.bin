# Brownfield Review: Embedded AGDF Cockpit for Codex

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: agdf-cockpit-mcp-app-20261005-01
- related_ur: .agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex implementing agent; no independent review claimed
- reviewed_at: 2026-10-05
- decision: pass

## Objective

Size the approved local embedded-cockpit journey, preserving canonical control and human decisions. This review authorizes no implementation.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: Existing browser inspection becomes cross-surface exploration and deliberate model-context/question transfer, with capability-dependent activation and recovery.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- ux_intent_definition_evidence: .agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/UX_INTENT_DEFINITION.md; completed 2026-10-05 after explicit recovery, before PRD authoring.

## Existing-System View

Baseline commit: `67a97ae80d1fcd286b4b4d5e21e8606fb3c31f26`. At review, tracked delta is only MASTER_BACKLOG and untracked paths are this run's artefact/state directories. Previously discussed cockpit code is now committed. Do not overwrite other delivery scopes or change the installed AGDF runtime during planning.

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Browser cockpit overview/detail/document | packages/control-ui/src/App.tsx; README.md | high: deliberate question/context action is new |
| Source of truth | Core state reader/parser and canonical control | packages/core/lib/control-evaluation/run-state.js; .agdf/control/CONTEXT_GRAPH.md | medium: add a read projection, keep original ownership |
| Runtime path | Core composition and bounded read provider | packages/core/lib/index.js; control-inspect/cockpit.js; control-read/ | high: an additional MCP consumer needs mediation and session lifetime |
| UI / UX | React reducer, navigation, passive document view | packages/control-ui/src/{App,state,api,DocumentView}.tsx/.ts | high: HTTP/secret assumptions must become transport-independent |
| Persistence / data | Canonical files; ephemeral captured read state | cockpit.js destroys old selectors on replacement; state.ts keeps view state in memory | low: no durable schema or data migration required by UR |
| Tests / QA | Core read/projection, UI/service/browser and MCP suites | packages/core/test/control-cockpit-projection-test.js; packages/control-ui/test/; packages/mcp-server/test/ | high: protocol, bridge and actual-host lanes are required |
| Release / operations | Private UI excluded from public payload; version-matched MCP runtime | packages/control-ui/README.md; packages/mcp-server/package.json; src/server.js | medium: bounded local activation/build/cleanup needs SD treatment; no publication |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: The existing MCP adapter registers tools only; the requested app adds UI resources and a host-facing context exchange contract. Browser App currently constructs a secret-authenticated HTTP reader directly. Captured Core data must remain the owner across both consumers.
- architecture_evidence: packages/mcp-server/src/server.js; packages/core/lib/index.js; packages/core/lib/control-inspect/cockpit.js; packages/control-ui/src/App.tsx; docs/architecture/04-mcp-schnittstellen.md.
- architecture_missing_evidence: Live Codex rendering, capability negotiation and message/context behavior are unverified; implementing agent owns the early TP host feasibility obligation. Official source capability is not installed capability.
- architecture_next_owner_and_action: SD author decides the bridge/resource, transport seam, ephemeral session ownership and local activation/rollback contracts within approved PRD behavior.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: App couples view orchestration to HTTP and secret | App.tsx creates createApi(secret); api.ts validates envelopes and DTOs | warn | SD: preserve common views, state and validators behind an explicit transport seam; do not create a second cockpit implementation |
| problem: MCP has no resource registration or cockpit operation | server.js capabilities tools only; Core composition exposes dispatch/inspect | warn | SD: delegate cockpit reads through the Core owner and extend the existing adapter; preserve trusted-runtime checks and worker bounds |
| problem: Context Graph projection is absent | cockpit.js manifest exposes state/Artefacts rows; state parser owns context_graph; graph has maintained Markdown headings | warn | PRD defines explicit relation semantics; SD extends bounded Core projection, not a second graph database or arbitrary file reader |
| unresolved: live host contract | Official MCP app guide exposes portable UI/context/message mechanisms; Codex changelog confirms panels, not all bridge methods | warn | SD/TP owner defines capability qualification, early host check and honest fallback; successful browser/mock bridge does not satisfy host acceptance |
| problem: obsolete selection can be mistaken for authority | snapshot IDs differ from run revisions; current read lane already revalidates | warn | PRD requires server-checked current sources before transfer; later actions retain existing dispatch and fresh binding validation |

No retained debt is accepted. These are existing gaps and scoped future design obligations, not unresolved ownership preventing the sizing route. Detailed contracts remain SD-owned.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth — adding MCP app resources and model-context exchange changes a compatibility-sensitive host protocol contract. structured_slice is rejected because full_depth_impacts_absent fails; compact paths cannot introduce this product/protocol behavior.
- evidence: This review, approved UR, packages/mcp-server/src/server.js, packages/control-ui/src/App.tsx, official MCP app guide.
- transparency_note: Full depth is justified by the external contract and source/provenance boundary, not file count. Artefacts remain focused on this local first journey; broader agent-control, distribution and graph-editing scopes are excluded.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External or public contract: new MCP UI resource/bridge and model-visible context contract. No gate-policy change or durable migration is proposed.
- rejected_alternative: quick_task and verified_change fail on new capability/external protocol; structured_slice fails full_depth_impacts_absent.
- missing_or_conflicting_facts: none for the depth decision; exact host capability remains an explicit later evidence obligation and does not erase the already evidenced external-contract trigger.
- depth_evidence_refs: Approved UR sections 3/5; server.js registration/capabilities; App.tsx transport binding; https://developers.openai.com/plugins/build/chatgpt-ui.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One bounded open/select/inspect/question journey, UR acceptance 1 |
| authority_boundary | fail | UI-to-model source transfer adds a host-facing provenance/trust boundary; original approval authority remains unchanged |
| owner_consumer_coordination | pass | Existing Core, MCP and private React owners are identified; intended consumer is this local Codex workflow |
| full_depth_impacts_absent | fail | MCP resource and context exchange are new compatibility-sensitive integration contracts |
| migration_propagation_bounded | pass | UR requires no durable migration; new local build/activation must be isolated and reversible |
| failure_recovery_local | pass | Source/bridge failures remain local; reject stale transfer and preserve existing browser path; no remote or irreversible action |
| independently_acceptable | pass | Actual Codex journey has independent acceptance; no concept-run completion or public release is required |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Exact user-visible selection, question and stale-context behavior; empty/missing graph references | PRD | warn |
| Resource/bridge API, allowed Core selectors, context size and fresh revalidation strategy | SD | warn |
| Compatible SDK, UI bundling, session lifetime, version provenance and local activation/cleanup | SD | warn |
| Actual Codex capabilities, rendered journey and trace of model-visible context | TP | warn |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: Existing local_read_cockpit_20261005 entry records captured reads and UI boundaries; curate verified MCP extensions only after implementation evidence, before clean closeout. No graph change made by this review.

## Next Permissible Step

- next_allowed_action: Execute required UX Intent Definition, then draft PRD through its owner and request fresh Approval: PRD.
- forbidden_until_then: SD/TP authoring, implementation, installed runtime changes, QA/UAT/publication claims.

## Quality Outlook

- quality_outlook: Clear reuse/ownership route. New contract and actual-host evidence need planned verification. Browser success alone cannot establish embedded completion.

## Official Source Evidence

Fetched 2026-10-05: https://developers.openai.com/plugins/build/chatgpt-ui describes portable UI resources, bridge methods and state ownership. https://learn.chatgpt.com/docs/changelog (2026-04-24 Codex app entry) explicitly names embedded MCP app panels. The latter was opened with the web tool after direct Markdown retrieval returned 404. No current AGDF MCP app exists or was installed/tested during this review.
