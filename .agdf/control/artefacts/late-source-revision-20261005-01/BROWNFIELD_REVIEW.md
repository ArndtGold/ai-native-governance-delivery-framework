# Brownfield Review: Controlled late source revision

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Review decision: pass

## Run

- run_id: late-source-revision-20261005-01
- related_ur: .agdf/control/artefacts/late-source-revision-20261005-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex (cooperative existing-system review)
- reviewed_at: 2026-10-05

## Objective

Size the approved reusable revision capability for valid active CD+Tests runs after approved
TP. The separate design-author run supplies a concrete UR-first conflict, not implementation
or source-change permission for this capability.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: One bounded new revision action changes the user's recovery path, effective approval state and next allowed work; the same human decision authority remains. The impact preview must distinguish history from current permission and re-opening from renewed approval.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; gate-transition contract and gate-policy evaluation | UR Scope and Acceptance Signals; current run-revise stops at PRD-to-SD | high: a new lawful return from implementation to earlier source gates |
| Source of truth | Core run-state writer, run-seal, presentation and approval recording | writeRunLocked protects approval/binding histories; run-present binds exact current digests | high: superseded authority must remain historical without authorizing current work |
| Runtime path | Core run-revision.js, CLI validation-handlers.js, dispatcher service | CLI currently calls reopenPrdRevision; dispatch routes evaluated state | high: broaden the shared lifecycle operation, retain one policy owner |
| UI / UX | Shared interaction presentation and revision recovery text | Existing gate/status cards and run-presentation render actual authority | medium: preview impact and communicate the return gate and pending decisions |
| Persistence / data | Artefact Bindings, Approval Operations, run-step transaction | Append-only proof receipt chains; journal covers Run/Backlog/OR, not source-version archives | high: exact old source bytes and active relationship invalidation need design |
| Tests / QA | run-revision-test.js, artefact-recording-test.js, run-step-transaction-test.js, lifecycle and MCP suites | Existing early-window, stale-seal, recording and fault/concurrency cases | high: add actual four-source late paths and version/history/failure cases |
| Release / operations | Existing package/runtime generators and scoped evidence | Installed 0.14.5 rejects the actual late attempt; candidate and installation remain distinct | medium: package conformance; no automatic rollout/install or production application |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Approval supersession, historical source bytes, current derivation proofs and multi-file failure boundaries cross the existing lifecycle and persistence owner seams.
- architecture_evidence: packages/core/lib/control-state/run-revision.js; run-state-writer.js; run-step-transaction.js; artefact-bindings.js; artefact-binding-proof.js; run-presentation.js; packages/cli/lib/cli/validation-handlers.js.
- architecture_missing_evidence: Exact new archive/active-binding representation and crash/retry proof are SD/TP obligations, not existing capabilities. Existing owners and decisive full-depth effects are evidenced.
- architecture_next_owner_and_action: Shared Core lifecycle/history owners; SD must design exact version preservation and one atomic authority transition using existing locks/writers.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: late revision unavailable | reopenPrdRevision permits only approved PRD at SD with no linked downstream artifact; PAYLOAD_REVISION_ATTEMPT-01.json records actual rejection | revise | Core lifecycle owner: define the bounded extension in PRD/SD, preserving the early path |
| problem: historical receipts do not archive prior approved bytes | Artefact Bindings retains receipt/digest history, but validateBindingProof resolves canonical live source paths | revise | Existing binding/history owner: SD must separate current proof from retained exact old versions without a parallel authority |
| problem: existing transaction does not cover source archives | run-step-transaction journal supports Run/Backlog/OR with Run commit point and existing recovery | revise | Existing transaction owner: SD must define the archive/authority commit and TP must prove interruptions/replay |
| problem: approval reset alone can leave stale derivation and evidence | Gate routing consumes approvals, artifact statuses and approved source proofs together | revise | Existing gate/recording owner: PRD define impact; SD align all current projections and preserve historical records |
| problem: dirty adjacent work and installation distinction | WORKSPACE_REVIEW_SNAPSHOT-01.json; installed rejection vs candidate source | warn | Delivery owner: preserve baseline paths; test isolated fixtures and candidate packages; do not claim an installed fix |

These are identified extension obligations with named owners and later gates. No known debt is
accepted as a shipped solution; no second writer, gate or same-scope substitute run is proposed.
Review pass means the existing-system view and safe route are sufficient, not that these problems
are implemented or solved. No architecture diagram is needed to identify the present owner seams.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: late source revision changes which recorded approvals authorize current implementation, and needs reviewed impact, exact historical content and current-proof invalidation; structured_slice is rejected because authority_boundary and full_depth_impacts_absent fail.
- evidence: This review, approved UR and WORKSPACE_REVIEW_SNAPSHOT-01.json.
- transparency_note: Quick/Compact is ineligible because lifecycle authority and persistent proof semantics change. Verified Change is ineligible because gate/permission, public CLI and persistence impacts are prohibited. Full structured delivery is required by actual authority and persistence effects, not file counts. PRD follows required UX Intent analysis; SD/TP and implementation remain closed.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: authority_policy_security_depth
- decisive_full_depth_triggers: authority/policy (superseding implementation authority); persistence/data (historical source versions and active relationship meaning); external/public contract (supported lifecycle/CLI behavior).
- rejected_alternative: structured_slice; Quick/Compact and Verified Change were evaluated first and are ineligible.
- missing_or_conflicting_facts: none for the route; product/design/test decisions remain explicitly assigned to PRD/SD/TP below.
- depth_evidence_refs: Approved UR; run-revision.js; run-state-writer.js; artefact-bindings.js; artefact-binding-proof.js; run-step-transaction.js; CLI validation-handlers.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One bounded reusable late-source revision capability at CD+Tests |
| authority_boundary | fail | Source/dependent approvals stop authorizing current implementation and require renewed existing gate decisions |
| owner_consumer_coordination | pass | Existing Core owner with CLI/dispatcher/protocol consumers; no separately owned workflow engine |
| full_depth_impacts_absent | fail | Evidenced authority, persistent proof meaning and public lifecycle changes |
| migration_propagation_bounded | pass | Explicit selected-run operation; unrelated runs and closed/QA/UAT states excluded; no automatic migration |
| failure_recovery_local | fail | Exact source-history preservation must be coordinated with Run authority and projection commit/recovery |
| independently_acceptable | pass | Isolated four-source fixtures can accept the mechanism without applying the separate payload revision |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What exactly does the preview show and which work/evidence requires renewed validation for each source gate? | PRD | revise |
| When must Brownfield/UX/route analysis be repeated versus retained as explicitly reviewed analytical input? | PRD | revise |
| How do exact old bytes, approvals and proof records remain inspectable after canonical draft replacement? | SD | revise |
| How are active proof mappings invalidated while immutable receipt history stays protected? | SD | revise |
| Which authority commit point, interruption outcomes and retry/replay behavior are supported? | SD | revise |
| Which actual packaged consumers and platform/fault cases establish the changed contract? | TP | revise |

These are required next-gate decisions, not unanswered user intent or permission for implementation.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-specific source inspection and scope decision remain in this review; no implemented new invariant or authoritative owner change yet.
- memory_target: scope_artifact
- memory_reason: Preserve this exact existing-system view and workspace boundary with the selected run; curate reusable implemented knowledge at closeout.
- memory_refs: This review and WORKSPACE_REVIEW_SNAPSHOT-01.json.

## Next Permissible Step

- next_allowed_action: Record this review and Mode/Slice route, complete the required UX Intent analysis, then draft PRD from approved UR and ready analyses.
- forbidden_until_then: Source-code implementation; later SD/TP artifacts; applying revisions to the design-author run; baseline changes; QA/release claims.

## Quality Outlook

- quality_outlook: Review/source evidence only. Existing suites are inspected, not rerun as proof of an unimplemented mechanism. Full candidate, semantic, transaction, protocol and native evidence remains a later obligation.
