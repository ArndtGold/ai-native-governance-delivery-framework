# Brownfield Review: Reliable MCP runtime and coherent Codex host setup

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: mcp-start-timeout-reliability-20261014-01
- related_ur: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/UR.md
- current_gate: Brownfield Review
- reviewer: Coding agent acting as brownfield-analysis
- reviewed_at: 2026-10-14
- source_revision: b2004cdb-58ec-4c65-9212-3043a03171dc

## Objective

Size the approved runtime reliability, coherent Codex host setup, preserved Cockpit capability and bounded diagnostic cleanup outcome. This review establishes owners and delivery depth; it does not claim a root cause, production fix, host rendering or implementation permission.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: The approved outcome spans product/diagnostic activation, configuration origin and scope, multiple runtime/session states, App discovery/rendering and failure/removal recovery. Technical authority remains unchanged but visible working modes and activation/recovery semantics require coordinated product decisions.
- ux_intent_definition_required: yes
- ux_intent_definition_result: pending

The existing internal UX owner must produce ready before PRD readiness; pending is explicitly future analytical work, not a ready or blocked finding.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; existing guided setup and Cockpit contract | UR Scope 9-15; docs/architecture/06-agdf-cockpit.md section 1; packages/control-ui/README.md | high |
| Source of truth | Core operations and plugin/host configuration remain separate owners | SOT_REGISTRY.md; packages/cli/lib/mcp-lifecycle/adapters/codex.js; installed plugin mcp.json | high |
| Runtime path | Existing package publication/claims, launcher, facade/generation and executor | packages/cli/lib/mcp-lifecycle/package.js and plugin-runtime.js; packages/mcp-server/src/worker.js and worker-entry.js | high |
| UI / UX | Existing directory-bound Cockpit and presentation-bound Decision App | packages/cli/lib/mcp-dispatch-runtime.js; packages/mcp-server/src/server.js and ui-capability.js | high |
| Persistence / data | Existing owned config snapshots, runtime markers/references/claims; host owns shared App storage | packages/cli/lib/mcp-lifecycle/adapters/codex.js and file-utils.js; plugin-runtime.js | high |
| Tests / QA | Existing lifecycle/runtime retention, config, safety, generation, protocol and operation tests | packages/cli/scripts/plugin-mcp-runtime-test.js, mcp-runtime-retention-test.js, mcp-lifecycle-test.js, codex-cockpit-config-test.js; packages/mcp-server/test/ | high |
| Release / operations | Existing supported local preparation/install and package generation | scripts/prepare-cockpit-local.mjs; packages/cli/lib/host-adapters/codex/plugin-mcp.js; install owners | medium |

### Current coverage and observed topology

- fully_done: Existing Core exact approval/receipt/original UUID semantics; owned registration snapshots/rollback; package provenance and immutable claim retention; UI resource/capability and distinct Cockpit/Decision session boundaries exist. This is code/history evidence, not qualification of the proposed change.
- partially_done: Plugin-owned product declaration, project/user native adapter, separate local Cockpit preparation and disposable native probe are individually implemented. A common three-layer effective identity/state and cleanup lifecycle is not evidenced for the observed topology.
- not_done: Demonstrated cause and permanent fix for observed generic startup failures/response deadlines; final integrated product/diagnostic lifecycle and exact installed qualification for this Run.
- Configured regular plugin uses the installed marketplace launcher with its own data root. Project config contains two separate dist/local Cockpit builds; user config contains a temporary capability-observer/Decision runtime. Observed multiple processes do not prove a leak, contention or scheduler cause.
- Current source HEAD at review: 6dda9e353f1df87b2049f019417674913cfbb6b8. All 28 previous qualified source files remain byte-identical to their protected final-source-identity.json. Existing unrelated docs/control/UI deltas are outside this Run.
- The Codex native adapter inspects/manages only the exact mcp_servers.agdf section and recognizes its own marker. It preserves the separately named Cockpit entry in codex-cockpit-config-test.js. A successful codex mcp get readback records only presence, not detailed effective permissions, UI rendering or session freshness.
- prepareCockpitLocal writes a reviewable snippet and activated:false; it does not activate or remove host configuration. core-mcp-decision.mjs emits a prepared disposable probe descriptor with installed:false and native_qualified:false. Current wrapper/registration provenance must be matched independently; a path prefix alone is insufficient deletion authority.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Product reconciliation changes a compatibility-sensitive host integration spanning plugin declaration and separately bound project/user registrations, Cockpit opening, actual session freshness and removal. Reliability work crosses executable retention/publication and request execution/uncertain-effect boundaries; it is not a one-function local correction.
- architecture_evidence: UR Scope 10-15 and AC-008 through AC-014; packages/cli/lib/mcp-lifecycle/adapters/codex.js; packages/cli/lib/host-adapters/codex/plugin-mcp.js; scripts/prepare-cockpit-local.mjs; packages/cli/lib/mcp-lifecycle/package.js and plugin-runtime.js; packages/mcp-server/src/worker.js and worker-entry.js.
- architecture_missing_evidence: Causal phase timing and actual triggering exception are not yet known; exact probe descriptor/registration ownership and current host-effective settings also require qualification. These are SD/TP investigation obligations; the external integration depth trigger is already evidenced.
- architecture_next_owner_and_action: PRD resolves preserved product roles, state/cleanup behavior and bounded assurance; SD assigns extensions to existing lifecycle/runtime/session owners and causal instrumentation; TP defines regression, ownership, stress and installed/native evidence lanes.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: broad launch codes lose claim/facade cause | plugin-runtime.js acquireClaim and startFacade catch blocks | warn | Existing launcher owner in SD: retain safe phase/cause distinction and reproduce actual exception; do not infer claim corruption from the label |
| unresolved: claim/publication contention versus actual invalid package | package.js acquires publication lock then re-inspects package; plugin-runtime.js has separate bounded publication retries | warn | Existing package/claim owner in SD/TP: isolate multi-client acquire/publish/retire paths and preserve immutable retention; no PID-based claim garbage collection |
| unresolved: deadline exhaustion versus response loss | worker.js spawns a fresh worker with 10-second execution bound; worker-entry.js builds and checks a fresh runtime | warn | Existing executor/runtime owner in SD/TP: measure startup/verification/operation/response separately; preserve bounded cancel and original receipt recovery |
| problem: product and diagnostic host declarations lack one evidenced lifecycle | Codex exact-agdf adapter; project Cockpit snippets; user temporary probe | warn | Existing Codex configuration and setup owners in PRD/SD: reconcile roles, origin and owned cleanup; no second registry or adapter |
| problem: consolidation can remove the current Cockpit opener | Current regular tool catalog versus separate agdf_cockpit tools; Cockpit documentation | warn | Existing server/App owners in PRD/SD: preserve actual capability and target binding through compatibility-sensitive transition |
| unresolved: descriptor proof for retained native probe wrapper | Current user registration differs from core-mcp-decision.mjs basic candidate entry shape | warn | Existing probe/setup owner in TP: match exact descriptor, bytes and registered command before scoped removal; retain unproven entries with explicit reason |
| problem: host-managed rendering and data can be mistaken for server state | server.js/ui-capability.js; observed host UI separates server settings and MCP-App data | warn | Existing product/status owner in PRD/SD: separate declared/observed/unknown state and preserve host permissions/storage |

No deliberate debt trade-off is accepted by this review. Unresolved causal/design details are assigned to existing downstream owners with exit criteria: reproduce or disprove each hypothesis, preserve protected boundaries and pass required exact-candidate evidence before QA. This review's pass concerns safe sizing/routing only.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: Reconcile compatibility-sensitive plugin/project/user registration and Cockpit opening with coordinated identity, effective state, migration/removal and shared-client behavior; architecture/runtime failure and retention boundaries also require full design. Quick/Verified are ineligible; structured_slice cannot positively prove full-depth impacts absent.
- evidence: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/UR.md Scope 10-15 and AC-008 through AC-014; this Structured Depth Evidence; referenced configuration/lifecycle/App/executor owners.
- transparency_note: Same existing gates, full depth because of actual host integration and runtime/recovery effects; not because of file or owner counts. No approval for implementation is created. UX intent is required before PRD readiness.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: external_or_public_contract; architecture_or_runtime
- rejected_alternative: quick_task fails new product activation/state/cleanup semantics; verified_change fails one clean owner and no runtime/host contract impact; structured_slice fails full_depth_impacts_absent and cannot establish wholly local shared-client rollback.
- missing_or_conflicting_facts: none decisive for depth. Actual startup/timeout causes and migration mechanics remain assigned SD/TP investigation; they are not asserted as solved.
- depth_evidence_refs: Approved UR Scope 10-15; Codex adapter exact section contract and plugin migration helper; Cockpit opener/source binding; claims/publication and worker execution sources.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Accepted UR unifies reliable runtime and coherent observed Codex setup; no unrelated installer/public release |
| authority_boundary | pass | UR preserves host authority and Core receipts; existing plugin/host/operation owners remain canonical |
| owner_consumer_coordination | fail | Plugin and separately bound Cockpit/project/user entries require compatible host/session handoff; independent cosmetic removal is unsafe |
| full_depth_impacts_absent | fail | Host registration/capability/migration contract and runtime failure/retention boundaries are explicitly affected |
| migration_propagation_bounded | unknown | Exact ID/registration reconciliation and probe ownership are downstream decisions; user/project scope and shared clients preclude assuming trivial propagation |
| failure_recovery_local | unknown | Canonical local transactions exist, but host session shutdown/reload and claim retention extend beyond a local source edit |
| independently_acceptable | pass | Full approved scope has explicit AC-001 through AC-014 and its own final installed acceptance; unrelated Runs are not prerequisites |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which product capabilities must remain visible and what qualifies each setup state? | PRD | warn |
| When is an extra AGDF Cockpit entry justified and how are diagnostic roles displayed? | PRD | warn |
| How is unknown/foreign ownership surfaced without automatic adoption/removal? | PRD | warn |
| Which existing owner projects effective state and how does it distinguish declared/observed/unavailable host facts? | SD | warn |
| Which exception/phase produced each startup code and each deadline failure? | SD | warn |
| What bounded transition preserves shared sessions/claims and required Cockpit tools? | SD | warn |
| What measured workload, baseline regressions and installed/native evidence establish the bounded result? | TP | warn |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter; .agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority; .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: This review links preserved MCP adapter, host interaction and canonical Run owners. No new normative rule or graph mutation is needed for sizing. Any later reusable changed invariant requires reassessment before final closeout.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Preserve scope-specific observations and unknowns in this Run; existing contracts retain normative ownership.
- memory_refs: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/UR.md; .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Produce the required bound UX Intent Definition, then draft full-depth PRD from approved UR and analytical evidence.
- forbidden_until_then: SD, TP, production implementation, host mutation, new installed candidate, VCS/publication and automatic restart.

## Quality Outlook

- quality_outlook: Existing reusable owners and route are clear; causal repair and host/App qualification are required later evidence, not completed work.
