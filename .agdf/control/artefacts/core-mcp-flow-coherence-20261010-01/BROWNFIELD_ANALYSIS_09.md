# Renewed implementation-preparation Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- run_id: core-mcp-flow-coherence-20261010-01
- input_revision_id: 83ca9059-2b09-4d67-a836-2e23229a98f0
- scope: exact approved TP T-001..018, AC-001..026 and SDD-001..022; no implementation/QA/native success claimed
- required_next_step: CD+Tests, preserve the baseline and execute dependent tasks through existing owners

## Bound sources and fresh baseline

TP digest: sha256:81d3b952710074dd02d5e0c1f77e8a4ac48b0f5155309d07979529ecb86e1ee8
SD digest: sha256:c9fdc53466a90f59b04a6106ea312848554c08978dcb0818daddc3341ceada1a
PRD digest: sha256:e79d198d9bc6041bb0a855d021271745f104f34ba5e1f724d1d6025867e08a6d

Fresh evidence/renewed-tp-09/BASELINE.json records HEAD 01731da1be90659c25706b89c2d7acd494e0862f, all 743 initial status entries, worktree/index patches, 647 tracked source hashes and 5,808 protected foreign control files. No staging/reset, foreign lifecycle edits or old evidence overwrite. ACTIVE_INVENTORY.json comes from actual MCP doctor: complete inventory of 53 active Runs, no finding in the selected Run; three unrelated historical relationship findings remain foreign. Current selected canonical dispatch passes at Brownfield Analysis with exact TP approval. Existing dirty implementation remains a baseline to reassess, not automatically fulfilled renewed work.

## Current coverage, owners and reuse

| Scope | Current coverage / evidence | Reuse strategy and implementation owner |
|---|---|---|
| T-002..007 state, recording, decisions, revision, completion | partially_done: actual shared preparation, typed policy, bounded writers, command receipts, revision history and structured completion already exist in Core; source-revision archives remain exact history | Reuse and test packages/core/lib/control-evaluation and control-state owners; extend only gaps discovered against renewed source obligations |
| T-003 authoring metadata | partially_done: TP_AUTHORING_FORMAT exposes table columns but not single decision and unique criterion/scenario constraints, observed in actual draft checks | Extend metadata at traceability-readiness.js; same executing grammar, no second parser or tool |
| T-008 transport | partially_done: run-command-contract/service, CLI mcp-dispatch-runtime and mcp-server worker/server exist with five groups and bounded app facade | Extend fixed selectors/delegation, preserve exact UUID/revision/receipt and worker uncertainty; inspect schemas and generated manifest budgets |
| T-009 focused view | partially_done: decision-session.js and DecisionCard/DecisionEntry already bind current presentation/read session and exact document return | Reuse session and document proof; retain cooperative assurance, transient comments and no broad cockpit writer |
| T-013 owned generations | not_done: launchPluginMcpServer currently spawns inherited STDIO and only forwards signals; runMcpServer/buildAgdfServer owns SDK registration, actual UI negotiation and worker lifecycle | Refactor existing launcher/server composition into a stable SDK facade plus directly spawned private IPC generations; no Codex connection-manager changes or foreign process scanning |
| T-014 executable retention | not_done: plugin-runtime.js retireRuntimeRoot removes the renamed runtime; pruneMcpDataRoot removes owned older versions/stale directories by age, without live reader/owner claims | Extend existing package publication/lock with immutable digest roots and claims acquired before load/spawn; retain unproven legacy/foreign ends; coordinated with T-013 |
| T-015 qualification causes | partially_done: evaluateDecisionAppQualification currently returns only boolean; runtime reads owned qualification tuple; productive marker lacks required matched native evidence | Add validator-owned read-only structured reasons through existing Inspect; keep provenance publication authority, no synthetic flag acceptance |
| T-016 decision brief and remote Chat | not_done for renewed UX: session currently sets summary to full prepared.text, which contains status tables and detailed IDs; text renderer returns the verbose card. Exact text approval exists, but new contained remote document and human Chat non-approval selectors are planned | Extend current summary/presentation/document reader and shared writer, plus generated forwarding contracts. One canonical source brief, no independent model/UI summary authority |
| T-017 affected shared UI | partially_done: App/state, RunDetail/RunDocuments, DocumentView, draft findings and locale projection exist; new shared role/state/flow matrix must cover reused and changed views | Reuse existing semantic and locale owners and design tokens, separate focused rendering from orchestration; no broad monolith or private evaluator |
| T-010/011/018 and reviews | not_done for renewed candidate: historical tests/observations require exact applicability assessment; new owned-process and iPad/native requirements are open | Fresh evidence namespace, actual package/protocol/process faults before bounded native/iPad observations, whole B-01..11 flow and complete current reviews |

## Reuse and architecture fit

Current architecture/03-agentenkontrolle-zielbild.md explicitly remains a proposed concept, not live policy. Approved PRD/SD/TP and existing executable control contracts own this change. Actual SDK negotiation is in server.js/ui-capability.js; existing server registration stays the public manifest owner. package.js owns stage/verification/publication; extend its current lock, not a new installer or global process ledger. Core owns eligibility, recording and historical truth; CLI/MCP are transports. General cockpit channels remain reads/checks. Private generations retain original sessions, resource roots and command UUIDs; no migration/replay to new current. All existing unrelated approvals/control histories remain protected.

| Finding | Classification | Owner and finite exit / mitigation |
|---|---|---|
| Shared runtime root retirement can invalidate other connections or delayed resources | problem | Existing package owner; exit only after immutable publication/pre-load claim and independent-connection tests pass |
| Inherited child STDIO cannot provide the designed stable facade replacement | problem | Existing launcher/server owner; exit after qualified compatible candidate, pinned work and actual direct-child end/capacity evidence |
| Rendering support is confused with action qualification; disabled native buttons lack useful cause | problem | Existing provenance/Inspect/UI owners; exit after exact read-only diagnostics and truthful usable Chat route with matched actual qualification |
| Complete source metadata appears on first native/Chat decision screen | problem | Existing presentation/summary/render/forwarding owners; exit after one shared brief, complete material access and cross-view semantic/locale proof |
| Independent human origin is unavailable in this local cooperative lane | trade-off | Existing approval owner; approved SD explicitly preserves cooperative_local. Mitigation: deliberate actual intent plus exact bound receipts; exit condition: no stronger origin claim throughout reviewed candidate. No new trust guarantee |

No unresolved architecture/product ownership blocks preparation. The implementation risks above are explicitly decided by approved SD, have executable owners/tasks/tests and must be resolved before fulfillment; pass here grants no QA exception. T-015 diagnostic/code readiness precedes T-010 source/protocol checks, T-011 actual disposable native observations, then guarded matched qualification publication. No circular native prerequisite or production qualification from probe activation.

## Tests, boundary and minimal clean path

Follow the approved dependent chain. First revalidate retained shared-state/command/writer paths on disposable targets. Then extend authoring/qualification diagnostics and exact presentation/remote routes. Integrate immutable package claims before admitting new direct generations. Compare actual unchanged tool/resource/SDK manifests before each candidate switch; exactly three counted slots, one qualifying candidate, thirty-second qualification, ten-second close wait; unconfirmed close retains slot and bytes. Active or uncertain original work has no forced deadline. No arbitrary caller path/shell/PID or incompatible hot upgrade. Core receipts preserve original uncertain operation.

Use existing Core/CLI/MCP/UI package suites and scripts, extending owner tests for new behavior. Native-host qualification stays a separate evidence obligation; permission denial, actual render/input/read-return/teardown/locales and actual private iPad document access are not source assertions. Missing required observation keeps QA open, but does not prevent the already decided scoped source implementation. No speculative timeout increase or automatic installation/restart. The actual timeout diagnostic case separates pre-dispatch busy from post-dispatch uncertainty.

## Context and limits

- context_graph_impact: link_only
- context_graph_refs: docs/architecture/03-agentenkontrolle-zielbild.md; docs/reviews/ARCHITEKTUR_FLOW_MCP_KANDIDATEN_20261010.md
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: existing concept and candidate review linked by this owner/implementation mapping; no new node or memory change
- missing_evidence: renewed implementation/test, directly owned process end/retention, installed exact candidate and actual native/iPad observations, complete renewed reviews
- risks: package deletion/foreign effects, incompatible admission, stale/unknown operation revival, duplicate presentation authority and false native claims; each is bound to the approved tests and owners

Preparation pass means the reusable owners and safe implementation path are understood. No TP implementation task, QA/UAT or native acceptance is marked fulfilled.
