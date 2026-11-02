# Brownfield Review: Planned URs and master-backlog replacement

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74
- related_ur: .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/UR.md
- current_gate: Brownfield Review
- reviewer: Codex, cooperative source review
- reviewed_at: 2026-10-31

## Objective

Size the approved replacement of the live shared master backlog with independent planned URs, Core-derived views, a shared UR planning mode and an optional planning extension. The approved UR is the scope owner; this review grants no implementation or downstream approval.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Planned drafts become a different working state from active Runs; list selection, deliberate start, handoff progress/failure, migration ambiguity and Core-without-extension behavior change the primary user decision and recovery feedback. Existing Core, CLI/MCP and Cockpit views must agree.
- ux_intent_definition_required: yes
- ux_intent_definition_result: blocked

UX clarification is not yet authored. This is a pending prerequisite for PRD readiness, not a request to repeat UR approval or proof that a preview was requested. No mandatory interactive preview was specified.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | ur-definition contract and skill; gate-transition and request-activation contracts | UR authoring is currently bound to a Run/revision; planning must remain draft-only and use the same template owner | high |
| Source of truth | run-inventory.js, run-inventory-reader.js, canonical RUN_STATE.md; MASTER_BACKLOG.md | Run inventory already derives stored Run state; cockpit-backlog.js separately reads saved table sections and summary markers | high |
| Runtime path | run-backlog-writer.js, run-command-service.js, run-step-transaction.js | Run lock followed by shared backlog lock; other pending Run journals block new work; Run revision is the transaction commit point | high |
| UI / UX | cockpit-list.js, cockpit-backlog.js, packages/control-ui/src/Overview.tsx and src/mcp/CompactCockpit.tsx | List DTO and selection identities depend on backlog section/order/content digest; planned entries are currently table rows | medium |
| Persistence / data | run-backlog.js, run-revision.js, run-closure.js; scaffold plan and required-files.js | Backlog row updates, migration-sensitive source revision/closure, and required live file are embedded in current control semantics | high |
| Tests / QA | run-backlog-writer-test.js, run-step-transaction-test.js, run-inventory-test.js, run-create-command-test.js, run-material-test.js, cockpit-backlog-title-test.js | Existing fixtures explicitly exercise Run/backlog atomicity, interruption, integrity, inventory and duplicate creation | high |
| Release / operations | canonical-init-plan.js, CLI scaffold/plan.js, installed runtime resources and plugin definition/projection owners | Existing repositories and installed versions expect the old scaffold; new planning capabilities must have explicit compatibility and host evidence | medium |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Persistent planning format and source ownership change together with shared-lock/recovery semantics, the pre-Run authoring boundary and read contracts consumed by UI/CLI/MCP. A folder-only edit cannot satisfy the approved outcome.
- architecture_evidence: packages/core/lib/control-state/run-backlog-writer.js; run-step-transaction.js; run-command-service.js; run-create-command.js; run-material.js; run-inventory-reader.js; packages/core/lib/control-inspect/cockpit-backlog.js; cockpit-list.js; packages/core/lib/control-evaluation/required-files.js; plugins/agdf/meta/contracts/ur-definition.md.
- architecture_missing_evidence: Product decisions on planned metadata, handoff disposition and initial optional-extension packaging belong to PRD; new locking/recovery protocol and supported legacy-journal transition belong to SD. No implementation or host evidence exists for the future model.
- architecture_next_owner_and_action: PRD defines user-visible lifecycle, handoff, migration outcomes and optionality after UX intent clarification; SD specifies ownership, concurrency invariants, compatibility and recovery within that approved product boundary.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: backlog-wide transaction coupling | withRunBacklogLock locks the selected Run then MASTER_BACKLOG.md and rejects a different pending Run; recovery reads captured old/next backlog bytes | revise | SD separates genuine shared invariants from backlog-only serialization; TP retains interruption and same-Run protection tests while proving independent progress |
| problem: two list authorities | run-inventory-reader.js derives Runs from canonical state while cockpit-backlog.js/cockpit-list.js derive section membership and order from Markdown | revise | PRD/SD reuse the existing pure Run inventory and a Core planned-entry reader; migrate consumers without adding another saved status index |
| problem: UR authoring assumes a Run | ur-definition contract requires returned target/Run/revision and current-gate template; material.stage validates an active sealed Run | revise | Extend the shared UR authoring owner with an explicit planning contract; do not pass fake Run IDs or weaken active-Run writers |
| problem: unsafe shortcut through run.create | run-create-command.js already provides UUID-bound idempotent Run creation, but does not bind a planned UR source or transfer receipt | revise | Reuse creation/receipt owners and design an explicit source-version handoff; preserve replay identity and source evidence instead of move-and-create scripting |
| problem: legacy cutover | required-files.js requires MASTER_BACKLOG.md; source revision, closure, transaction fixtures and scaffolds expect it | revise | PRD defines lossless migration/reporting; SD specifies compatibility, interrupted cutover and rollback without resealing historical approvals |
| unresolved: optional extension delivery boundary | Current repository has the canonical AGDF plugin and shared generation/installation owners; no planned-store or UR-planning-mode implementation was found in Core/CLI/contracts | revise | PRD names the initial optional capability and support boundary; SD chooses the smallest existing packaging path without a general extension framework |

These are required design obligations, not accepted retained debt. No deliberate debt waiver is proposed. Their existence does not prevent selecting full structured depth because persistence migration and recovery effects are directly evidenced. They must be resolved by the named downstream owner before that owner's readiness or implementation claim.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: persistence_migration_depth is decisive: retire a required live control source, account for old planned/history rows and preserve existing journals, seals and approvals while changing persistent planning and Run handoff meaning. architecture_runtime_depth and external_contract_depth also apply to shared locking/recovery and pre-Run CLI/MCP/UR contracts. Rejected structured_slice because migration and recovery require coordinated consumer cutover beyond a locally reversible change; Quick/Compact and Verified Change are ineligible for these product/persistence/contract effects.
- evidence: Approved UR scope 1-9 and AC-01 through AC-09; run-backlog-writer.js; run-step-transaction.js; run-command-service.js; run-create-command.js; run-material.js; run-inventory-reader.js; cockpit-backlog.js; required-files.js; existing scaffold and transaction tests.
- transparency_note: Full PRD, SD and TP depth follows the existing gate sequence. No route is selected by file count or historical CI results. UX Intent Definition is required before PRD readiness; no implementation or next gate approval follows from this review.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: persistence_migration_depth
- decisive_full_depth_triggers: Persistence/data/migration: new planned source meaning and mandatory-backlog retirement need lossless legacy cutover. Architecture/runtime: non-local lock and recovery boundaries must change. External/public contract: explicit planned authoring and handoff affect CLI/MCP/skill consumers.
- rejected_alternative: structured_slice cannot hide coordinated migration, old-journal compatibility and authoring/list consumer cutover behind a folder-only acceptance boundary. quick_task and verified_change prohibit these material effects.
- missing_or_conflicting_facts: none for depth selection; exact product/design solutions remain assigned downstream and do not erase the evidenced triggers.
- depth_evidence_refs: UR.md Scope 1-9 and AC-01/03/04/06/07/08; packages/core/lib/control-state/run-backlog-writer.js; run-step-transaction.js; run-command-service.js; run-material.js; packages/core/lib/control-inspect/cockpit-backlog.js; packages/core/lib/control-evaluation/required-files.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | UR defines one user outcome: independent UR planning and Run work without shared-backlog writing, with a traceable handoff |
| authority_boundary | pass | Core retains gate/approval and active-Run authority; planning drafts confer none; exact future contracts still require design |
| owner_consumer_coordination | fail | Core writers/recovery, initialization and existing list consumers need a compatible cutover from a required shared source |
| full_depth_impacts_absent | fail | Persistent format/migration and non-local concurrency/recovery changes are explicitly evidenced |
| migration_propagation_bounded | fail | Existing backlog rows, Run history, markers and pending old-format journal bytes require coordinated migration/compatibility decisions |
| failure_recovery_local | fail | Current journal recovery captures shared backlog bytes and rejects unrelated pending Runs; source-to-Run handoff introduces a new cross-record failure boundary |
| independently_acceptable | fail | Moving only planned drafts leaves mandatory backlog writers/readers and authoring binding unchanged, so the approved outcome cannot be accepted as that local slice |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What metadata, visible draft/handed-off states and deliberate start/retry/cancel feedback form the first supported planning workflow? | PRD | revise |
| What exactly is initially delivered as the optional extension and which host claims require native evidence? | PRD | revise |
| How are legacy planning/history rows accounted for, including ambiguous or missing UR associations, without inventing approvals? | PRD | revise |
| Which locks protect real shared invariants, and how do old journals coexist with or migrate to the new transaction/handoff protocol? | SD | revise |
| How is the shared canonical UR template supplied safely before a Run exists without adding a second authoring authority? | SD | revise |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#run_inventory_20261030; .agdf/control/CONTEXT_GRAPH.md#run_closure_20261029
- context_graph_required_action: update
- context_graph_reconciliation: open_gap
- context_graph_gate_effect: warning
- context_graph_evidence: Existing entries describe Run inventory ownership and closure/backlog recovery. Update them with implemented, verified ownership/cutover facts at closeout; do not replace them now with proposed behavior or create a generic planning-log node.

## Next Permissible Step

- next_allowed_action: Execute required UX Intent Definition, then draft PRD and resolve its material product decisions before presenting Approval: PRD. No additional human approval is needed for those preparation steps.
- forbidden_until_then: No product implementation, real backlog migration/deletion, host installation, approval inference, release or automatic Git closeout.

## Quality Outlook

- quality_outlook: Source-based routing is sufficient; migration, concurrency and host claims remain unproved until implementation and targeted evidence. Existing tests identify the invariants to preserve; no tests were executed during this read-only review and no old CI result is relabelled as new evidence.
