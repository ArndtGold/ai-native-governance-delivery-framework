# Brownfield Review: One Run Folder And One Current Control Data Model

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: run-ee983b1f-abf5-42fa-b980-096c1eda647f
- related_ur: .agdf/control/artefacts/run-ee983b1f-abf5-42fa-b980-096c1eda647f/UR.md
- current_gate: Brownfield Review
- reviewer: Codex, cooperative repository/source review; no independent human verification claimed
- reviewed_at: 2026-11-01

## Objective

Size and route the approved clean cut: one current control model and one folder per started Run; preserve independent planned URs, remove Masterbacklog and superseded formats, avoid old-data migration, and retain current exact-version decisions and recovery. Main baseline is c204ab67f3ab212238bfd9ad81de4ddbecacece8. This review is planning evidence, not implementation permission.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Removing the explicit legacy Cockpit view and rejecting old control stores changes a visible viewing mode and its recovery/blocker behavior. The planned-to-Run and current Run decision journeys retain their purpose.
- ux_intent_definition_required: yes
- ux_intent_definition_result: blocked

The blocked value means the required analytical UX input has not yet been recorded. It prevents PRD readiness until that existing owner records ready; it does not mean the approved direction is ambiguous or require a new UX approval gate.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; planned entry/handoff and Run lifecycle owners | packages/core/lib/control-state/planned-handoff.js; run-operations.js; explicit planned/current separation already exists | medium |
| Source of truth | Run state, bindings and inventory | run-state-repository.js, run-inventory-reader.js, artefact-bindings.js; inventory is derived from discovered Runs | high |
| Runtime path | Typed CLI/MCP control and installed versioned runtime | Current accepted UR receipt uses matched 0.20.2 installed runtime; its old step.record reports backlog updated. Source checkout alone does not update the serving plugin. | high |
| UI / UX | Core Cockpit projection/session and React overview | control-inspect/cockpit.js supports runs/legacy; cockpit-contract.js declares both; packages/control-ui/src/Overview.tsx dispatches RunOverview/LegacyOverview | medium |
| Persistence / data | Layout selector, transaction codec, seal and source history | control-layout.js selects master-backlog-v1/v2 or planned-urs-v1/v3; run-step-transaction.js supports journal versions 1 through 6 and legacy backlog recovery | high |
| Tests / QA | Existing behavior-based Core, MCP and UI suites | planned-handoff/concurrency/process tests; run-step-transaction and run-closeout-command tests; cockpit tests; MCP package/protocol tests | high |
| Release / operations | Existing sync/assembly/profile and installation owners | scripts/sync-package-assets.js; scripts/assemble-npm.mjs; installed runtime remains independently versioned | medium |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Persisted schema/path ownership and current recovery proofs change together; consumers cannot retain old path assumptions after the cut.
- architecture_evidence: control-layout.js; run-operations.js source-path predicates; run-seal.js; run-artefact-recording.js; artefact-bindings.js; run-source-revisions.js; Cockpit projection.
- architecture_missing_evidence: The exact new path/schema layout, metadata ownership reduction and governing-Run closeout boundary are SD decisions. No missing fact prevents choosing full structured depth.
- architecture_next_owner_and_action: PRD fixes observable support/reset boundaries; SD defines one canonical store and the controlled self-hosting transition; TP maps failure/recovery and consumer checks before implementation.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: parallel persisted layouts and codecs | control-layout.js has two layouts/default-to-legacy; run-step-transaction.js accepts historical codecs and Masterbacklog recovery | revise | Core persistence owner removes superseded support as a coherent SD/TP change; retain current recovery invariants |
| problem: split Run paths are part of proof semantics | run-operations.js, artefact-bindings.js and recording owners hard-code artefacts/run-id paths while history/presentations are under runs/run-id | revise | Existing shared path/containment and proof owners must agree on the one-folder contract; no alias tree or fallback resolver |
| problem: repeated recording metadata | stagedRecording builds REVIEW and RECORD from shared source/destination/relationship data; bindings repeat these facts | revise | SD assigns each fact one authority and proves which request, review or snapshot information is independently needed before removing it |
| problem: installed writer differs from new source behavior | This Run's matched installed 0.20.2 writer still updates Masterbacklog; new source/package availability does not switch the runtime | revise | SD makes a finite self-hosting/qualification boundary; no installation or protected-record rewrite during planning |
| problem: visible legacy-view dependency | cockpit-contract.js and Overview.tsx still expose the legacy mode | revise | Existing UX intent and PRD owners define removal, current inventory and unsupported-store feedback; Core stays the only observation owner |

These are required design/implementation obligations, not accepted retained debt or a claimed completed repair. Reuse the existing Run, inventory, decision, transaction, package and Cockpit owners; do not create a parallel event registry or generic new governance subsystem.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: persistence_migration_depth: the stored path/schema and proof meaning change across current writers/readers and require a coordinated clean cut, even though migration of old stores is explicitly excluded. Rejected alternative structured_slice fails the absence-of-full-depth and local-recovery checks; Quick/Verified Change are ineligible due to persistence, public CLI/file-format and recovery effects.
- evidence: Approved UR; control-layout.js; run-step-transaction.js; run-operations.js; run-seal.js; cockpit-contract.js.
- transparency_note: Full PRD/SD/TP depth follows the effects on persistence and public contracts, not file counts. UX intent is an existing analytical prerequisite, not another human gate. Implementation remains prohibited before approved TP and preparation.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: persistence_migration_depth
- decisive_full_depth_triggers: Persistence/data meaning changes; externally consumed CLI and file-format changes; non-local transaction/history cutover.
- rejected_alternative: structured_slice; full_depth_impacts_absent and failure_recovery_local fail for the approved whole outcome.
- missing_or_conflicting_facts: none for depth selection; detailed design remains owned by SD.
- depth_evidence_refs: packages/core/lib/control-state/control-layout.js; run-step-transaction.js; run-operations.js; run-seal.js; packages/core/lib/control-inspect/cockpit-contract.js; approved UR.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR: eliminate historical support and make each Run self-contained |
| authority_boundary | pass | Existing human gate and decision owners are retained; no new permissions or decision owner requested |
| owner_consumer_coordination | fail | Writers, seals, operation-path predicates and all consumers require the same stored-path cutover |
| full_depth_impacts_absent | fail | Public file layout and CLI compatibility behavior change; persisted proof semantics change |
| migration_propagation_bounded | fail | Old-data migration is excluded, but generated packages/current consumers still require coordinated propagation and explicit self-hosting handling |
| failure_recovery_local | fail | Run transactions, source archives, exact presentations and closeout proofs cross current owner boundaries |
| independently_acceptable | pass | One new-model lifecycle is independently testable on fresh isolated stores; no old-data migration is needed for product acceptance |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Define current inventory and visible unsupported-store response without an automatic reset | PRD | revise |
| Choose the one supported store layout/schema and eliminate redundant recording facts without losing independent review meaning | SD | revise |
| Finish and retain this governing Run with the pinned old writer while qualifying only fresh stores with the new candidate; define the exact cut boundary before code changes | SD | revise |
| Replace impacted test inputs and prove current recovery/negative rejection without historical-format test matrices | TP | revise |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: Existing CG-RUN-SCOPED-CONTROL-STATE records split path and control ownership; update its current ownership account when the implementation is verified, not during this routing review.
- memory_target: scope_artifact
- memory_reason: Keep current review evidence with this Run; no Codex memory update or new registry.
- memory_refs: BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Record required UX intent, then draft the full PRD from the approved UR and review. No further user decision is needed for this routing operation.
- forbidden_until_then: No implementation, old-data cleanup, source resealing, plugin installation or implied PRD/SD/TP approval.

## Quality Outlook

- quality_outlook: Existing source review supports the routing decision only. No new tests, performance improvement, installed-host qualification or human acceptance are claimed. Plan focused local checks and complete exact-head CI; qualify the new candidate through Codex CLI proportionately, without implying other native hosts were tested.
