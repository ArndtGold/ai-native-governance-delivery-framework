# Brownfield Review: Run overview and project-local worktrees

Decision: pass
Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Date: 2026-10-31

## Run

- run_id: run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5
- related_ur: .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/UR.md
- current_gate: Brownfield Review
- reviewer: Codex; cooperative source analysis, no independent reviewer claim
- reviewed_at: 2026-10-31
- inspected_baseline: 8e57078d2a7cbe0f8c071d1c27eac8e0c0a14f52
- execution_checkout: .agdf/worktrees/run-overview-worktree-convention

## Objective

Size the approved requirement to remove mandatory shared-backlog contention, show authoritative Run membership in both Cockpit views and define the project-local worktree convention. This review grants planning authority only. The concurrent CI repair remains outside this Run.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The overview changes the meaning of membership, status grouping and source freshness from stored backlog rows to stored Run inventory; missing/invalid Runs and legacy-only planning data require explicit visibility and recovery semantics in compact and expanded views. Deliberate opening of a Run remains the primary action.
- ux_intent_definition_required: yes

The required UX analysis has not yet run; no ready/blocked/not_applicable result is asserted. This is not a user approval request. The next analysis must settle intended reading modes, counts, coverage and recovery before PRD readiness. No preview was requested by the UR, so no interactive-preview obligation is invented.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | run-inventory.js; handbook de/04-mehrere-runs.md; selected-Run evaluation | Inventory already defines active/history membership, attention precedence, activity, titles and stored-state limitations. Cockpit still consumes backlog sections. | medium |
| Source of truth | RUN_STATE.md and registered artefacts; run-state-reader.js; run-inventory-reader.js | readRunInventory reuses discoverRuns once and feeds the pure buildRunInventory. Discovery reports malformed entries instead of fabricating valid state. | high |
| Runtime path | cockpit.js; cockpit-session.js; HTTP/MCP transport | snapshot without run_id calls backlogScope; named selection reads/evaluates actual Run. Session selectors currently register backlog rows. | medium |
| UI / UX | Overview.tsx; BacklogRows.tsx; mcp/CompactCockpit.tsx; types.ts | Shared cockpit-list.js currently specifies reverse backlog table order, section counts and search of saved row fields. | medium |
| Persistence / data | run-backlog-writer.js; run-steps.js; run-step-transaction.js; run-revision.js | Approval/update/recording use Run-then-Backlog locks; transactions contain nullable backlog snapshots; old recovery can complete a pending backlog write; source revision currently requires the file. | high |
| Tests / QA | cockpit-scoped-read-test.js; run-backlog-writer-test.js; transaction/revision tests; UI browser suites | Current tests intentionally enforce backlog-only initial reads and no automatic Run discovery. They must be replaced with outcome-based tests, not weakened. | high |
| Release / operations | canonical-init-plan.js; scaffold/plan.js; doctor.js; required-files.js; control-scaffold.md; modes.md | New projects seed a backlog and doctor requires it. Normative relevant-Run and closeout guidance still mandates or references updates. Existing package-generation owners propagate those contracts. | high |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: This is an intentional change to the persisted control-file contract and writer/recovery coordination, plus a normative worktree policy. It is not only a visual substitution. Existing control authority and checkout-local target binding must remain intact.
- architecture_evidence: run-backlog-writer.js:16-60; run-step-transaction.js recovery/commit functions; run-revision.js approved-source apply; doctor.js required-file/backlog checks; canonical-init-plan.js:22; control-scaffold.md live-pointer and ended-run synchronization rules; modes.md relevant-Run pointer requirement.
- architecture_missing_evidence: none decisive for routing; exact transition representation, legacy journal compatibility and new inventory read composition are design decisions assigned below, not asserted implementations.
- architecture_next_owner_and_action: PRD defines the replacement behavior and compatibility promise; SD defines the existing owners' persistence/recovery cutover, API/DTO compatibility, limits and rollback; TP maps critical fault and regression evidence before implementation.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: do not create a second Run inventory | run-inventory-reader.js and run-inventory.js already serve inventory inspection and doctor; source-only read is explicitly documented | revise if duplicated | Extend the existing inventory/read-scope composition for Cockpit; reuse attention, lifecycle, title and activity owners. PRD/SD own any intentional contract extension. |
| problem: removing only the UI dependency retains write contention | withRunBacklogLock, run-steps UR/route/closeout and approval-command writer | revise if partial | SD must remove mandatory backlog updates/locks from new ordinary operations and preserve per-Run locking, material publication, receipts and atomic commit semantics. |
| problem: old recovery journals and approved history must remain verifiable | run-step-transaction.js accepts existing journal schemas and backlog old/next snapshots; run-revision.js seals history | revise if rewritten or ignored | SD must distinguish completing an already pending legacy transaction from generating new backlog writes. Preserve original receipts/archives and use explicit version-compatible recovery; no historical resealing. |
| problem: old required-file and linkage checks can veto valid Run-only work | required-files.js; doctor.js; delivery-map.js readBacklogPointers; gate-policy.js links | revise if left mandatory | Adapt checks with the same canonical rule owners. Backlog defects may be optional legacy diagnostics but must not become global blockers for unrelated valid Run work. |
| problem: initializations and shipped contracts otherwise recreate the dependency | canonical-init-plan.js; canonical-initialization.js; CLI scaffold/plan.js; control-scaffold.md; modes.md; release-or skill | revise if inconsistent | Use existing source/projection generation and initialization paths. No new migration service or second source of policy. |
| problem: naive per-row live evaluation broadens reads and cost | readRunInventory stores display facts only; runWorkSummary can consume registered QA/review evidence; snapshot READ_LIMITS bounds files/bytes/time | revise if conflated | UX/PRD distinguish stored list observation from fresh selected-Run evaluation. SD bounds inventory, source capture and refresh without scanning all artefacts merely to show a list. |
| problem: hidden worktree roots are distinct execution targets | repository-context-reader.js accepts linked .git files; resolveControlCommandTarget hashes canonical absolute checkout path; handbook separates Run from working copy | revise if authority inferred | Keep worktree rule in existing normative owners and handbook. Reuse an assigned worktree and explicit target binding; no shared control symlink or automatic cross-worktree scanning. |

No deliberate retained-debt exception is accepted. The listed implementation hazards have named existing owners and are mandatory downstream obligations. Pending product/design choices do not prevent a safe full-depth route; none is silently called resolved delivery evidence.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: persistence_migration_depth: ending the versioned shared-backlog contract changes new writes, required-file validation and compatibility with existing recovery journals/archives. authority_policy_security_depth also applies to the new normative worktree convention. Quick/Verified paths are ineligible and a bounded structured slice cannot hide the coordinated compatibility obligations. Required UX intent analysis precedes PRD readiness.
- evidence: approved UR; Architecture Impact and Structured Depth Evidence in this report; existing writer, recovery, inventory, scaffold and normative owners listed above.
- transparency_note: Preserve one Run for the coherent outcome. Full PRD/SD/TP depth is justified by data/recovery and normative-policy changes, not numbers of files or consumers. No implementation or user gate is skipped. This mode does not require an unrelated release or host reinstallation.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: persistence_migration_depth
- decisive_full_depth_triggers: persistence/data/migration contract changes; architecture/runtime recovery coordination; normative policy change for worktree placement
- rejected_alternative: quick_task and verified_change cannot change policy/persistence boundaries; structured_slice requires full_depth_impacts_absent and migration_propagation_bounded to pass, which this coordinated contract change cannot claim before its compatibility design.
- missing_or_conflicting_facts: none decisive for mode selection. Detailed product and design decisions remain explicitly assigned below.
- depth_evidence_refs: run-backlog-writer.js; run-step-transaction.js; run-revision.js; required-files.js; doctor.js; canonical-init-plan.js; control-scaffold.md; modes.md; approved UR.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR: independent Run work without a mandatory central pointer, discoverable in Cockpit and consistently isolated under the project. |
| authority_boundary | fail | New normative worktree placement and removal of required backlog control semantics affect policy; actual approval authority remains unchanged. |
| owner_consumer_coordination | pass | Existing Core control/evaluation, inventory/read scope, HTTP/MCP adapters and two UI consumers are identifiable. There is no new external service owner. |
| full_depth_impacts_absent | fail | Writer/recovery and persisted-file requirements are materially affected; current source-revision apply requires a readable backlog. |
| migration_propagation_bounded | fail | New default writers and old pending journals/archives need coordinated compatibility; planned/history-only rows require an explicit preservation path. A local UI-only rollback cannot establish complete compatibility. |
| failure_recovery_local | fail | Recovery presently serializes via the shared backlog and may complete its saved write. Ending new writes must preserve this historical transaction responsibility and prevent fresh cross-Run contention. |
| independently_acceptable | pass | The combined Run has its own acceptance boundary and excludes autonomous worktree orchestration and modifications to the concurrent CI fix. No hidden later feature is needed to claim this outcome. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Exact active/history grouping, order, search, counts and explicit stored versus currently evaluated meaning, reusing the inventory contract | PRD | revise until defined; UX intent analysis provides input first |
| Preservation and access for planned ideas/history-only rows without fabricated Runs, silent writes or recurring shared planning contention | PRD | revise until a product compatibility decision is explicit |
| Which current operations cease new backlog locks/writes; how old pending journals complete safely; which public result fields remain compatible | SD | revise until transaction/recovery design is explicit |
| Read-scope dependency capture, changed directory membership, invalid entries, pagination/limits and stale-session recovery | SD | revise until bounded composition is defined |
| Definition of owning project for worktree placement, already-assigned reuse, ignore setup and explicit exceptions, without weakening target binding | PRD | revise until rule semantics are explicit |
| Fresh project initialization and mixed runtime versions after the contract change | SD | revise until compatibility/operational limits are explicit |
| Smallest meaningful targeted checks; mandatory integration checks on the finished CI baseline; native observations without mutating live host setup | TP | revise until obligations are mapped; no full suite during this review |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state; .agdf/control/CONTEXT_GRAPH.md#cg-ux-intent-before-prd; .agdf/control/SOT_REGISTRY.md physical package ownership
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: Existing CG-RUN-SCOPED-CONTROL-STATE describes Run-then-Backlog commit/recovery; after implementation, its durable invariant and the relevant SoT descriptions need reconciliation by the existing owners before clean OR. This review records the obligation, not an automatic graph write or completed reconciliation.

## Next Permissible Step

- next_allowed_action: Record this review and structured_delivery route together; execute required ux-intent-definition, then prepare the bounded PRD within the approved UR and present it for deliberate approval.
- forbidden_until_then: SD/TP authoring before their gates, implementation, CI-baseline repair, mutation of other worktrees, approval inference, commit/push/merge/release.

## Quality Outlook

- quality_outlook: The existing inventory is a strong reuse point. Structural source review establishes the change boundary, not runtime qualification. Existing three scoped Cockpit checks were run in the preceding inspection and confirmed old behavior; they are baseline observations only. No suite was rerun and no production source changed during this analysis. Future tests must cover Run-only operation, two independent Run changes without common-backlog writes, legacy recovery/history, bounded inventory and visible compact/expanded reading states. Native-host claims remain limited to actual observations.
