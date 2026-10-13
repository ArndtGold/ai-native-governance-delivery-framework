# Brownfield Review: coherent flow, contextual approval and earliest-source revision

Type: Brownfield Review
Mode: post_ur_review
Status: done

Prepared recording source: becomes current only when the canonical route writer installs the review and Mode/Slice together. No implementation or QA authority.

## Run

- run_id: core-mcp-flow-coherence-20261010-01
- related_ur: .agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/UR.md
- source_revision_id: 8eade2ba-6409-4c6f-ae4f-e55b5fb8661e
- source_ur_digest: sha256:1fd8023903193ec530433a5f9b0878e7dbf633c2a62b20552f370c0572f02313
- source_approval: d3ce91fa-cb3b-48ee-b87f-6be5369cfc28; presentation 22240394-393e-46d6-9afd-bdd062ade9de
- reviewer: Codex
- reviewed_at: 2026-10-11
- decision: pass
- scope: UR Scope 1-9 and AC-001..017; integrated contracts/current state/closeout, contextual UI approval with equal Chat path, controlled pre-UAT revision and bounded owned generations
- supersedes: previously archived review; previous implementation/test/native observations remain candidate-bound inputs for reassessment

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: Primary approval action, Chat/native/remote availability, revision consequence, current quality evidence, completion and generation recovery span decision and working modes. User authority must remain consistent across surfaces.
- ux_intent_definition_required: yes
- ux_intent_definition_result: reassessment required before PRD readiness

## Current Coverage And Reuse

| Area | Coverage | Existing owner/evidence | Minimal reuse path |
|---|---|---|---|
| Current state, typed follow-up and closeout | partially_done | run-recording.js now uses prepareRunContentState; gate-policy.js/skill-dispatch service consume next_operation; prior TP-09 generated/source evidence | Retain existing repairs, qualify current integrated state/closeout; no adapter policy table |
| Bound reading, preparation and approval | partially_done | Actual agdf_prepare and agdf_approve calls accepted exact renewed UR; run-presentation.js, approval-command.js, decision-session.js | Reuse exact material/presentation/receipt owner for UI and text; do not add an approval writer |
| Simplified primary UI action and coordinated Chat | not_done for renewed intent | Prior native candidate exercised three actions; currently prepared productive result is not_qualified and returns complete Chat | Reassess UX and define one eligible approval or already permitted next step; full Chat when display is unavailable/unconfirmed |
| Source revision | partially_done | run-revision-boundary.js allows structured CD+Tests and approved UR at SD, excludes QA/UAT approvals and other boundaries; actual same-Run source apply archived prior sources | Extend this boundary/history/transaction owner for the declared pre-UAT matrix; no independent policy or substitute Run |
| Earliest-source classification and selective quality renewal | not_done for complete AC-017 | quality.md already normalizes requirements/design/plan/implementation/evidence gaps; existing source/history proof determines dependencies | Explain changed source statements, reuse normalized owners, preserve verified unaffected upstream sources and requalify affected quality evidence |
| Connection-owned generations | partially_done | generation.js has createOwnedGenerationFacade, direct child handles, finite slots, original-session/presentation/operation pinning, qualification, protected retirement and uncertainty | Preserve existing owned facade and package retention; new native proof is required. No PID discovery or foreign-host controller |
| Host capability and close | unverified on latest candidate | UI negotiation belongs to actual host; historical source/protocol/native evidence classes are separate; no current native qualification | Keep explicit external dependencies and full Chat fallback; do not infer Mac interaction from iPad replies |
| Dispatch continuation | existing contract works | Corrected actual MCP gate-check returns bound post_ur_review at revision 46; DISPATCH_CONTINUATION_CORRECTION_12.json | Correct caller field selection. expected_revision_id is intake-specific, not a continuation field; no schema weakening or Core change |
| Authoring/recording contracts | partially_done | Dispatched UR contract required CLI run-update; step.record/artefact.record and operation-contract are already exposed | Assess contract reachability and registered-UR update parity under existing owner; not one new tool for every lookup |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Earlier-source reopening through QA/pending UAT changes lifecycle eligibility and applicability of durable approvals/quality proofs. Public writer contracts, native/Chat decision convergence and owned-generation routing/recovery are coordinated boundaries, not local presentation styling.
- architecture_evidence: Approved UR Scope 8/AC-017; run-revision-boundary.js; run-revision.js/run-revision-history.js/run-step-transaction.js; decision-session.js; generation.js; actual renewed presentation/approval and continuation receipts
- architecture_missing_evidence: Full source/phase compatibility matrix and affected-quality renewal are not implemented/qualified. Latest native candidate, external host close/capability, remote iPad same-material access and full-flow measurement require renewed TP evidence. These gaps do not obscure the evidenced full-depth trigger.
- architecture_next_owner_and_action: Existing Core revision and quality/proof owners for eligibility/impact/history; presentation/approval owners for one decision; AGDF owned facade for its direct child generations; external host for capability/teardown. PRD fixes user outcomes/support boundary and SD specifies extensions and compatibility without parallel authority.

## Reuse And Parallel-Structure Risk

| Finding | Class | Evidence | Required action |
|---|---|---|---|
| Historical assessment is not current coverage | problem | Initial thirteen-group assessment predates implemented current-state writers/MCP/generation facade | Preserve assessment as input; separate actual existing source, executing installed capability and latest native proof |
| Existing revision excludes newly required QA/UAT cases | problem | run-revision-boundary.js | Extend existing eligibility/history owner under renewed SD/TP; declare unsupported paths until qualified |
| Lower-level change can contradict an earlier source | problem | Approved UR earliest-statement rule; quality normalized gaps | Require concrete reason/source mapping and impact preview, not current-gate or keyword-only selection |
| Reusing changed-source approvals or QA would misstate readiness | problem | Existing exact source bindings and historical receipts | Renew affected current decisions/evidence; retain checked unaffected upstream authority and history only |
| UI and Chat can race or show different material | problem | Existing presentation/approval identity and session owner | One current exact version/presentation, one effect, receipt-based resolution; availability does not alter policy |
| Process age and shared install path do not establish ownership | problem | generation facade directly owns children; historical host finding | Retire eligible direct-owned idle generations only; active/uncertain/foreign work remains protected |
| Earlier claimed continuation defect was caller misuse | problem | Actual schema and corrected MCP response | Preserve correction evidence; improve reusable operation examples/orientation in PRD, not an unnecessary writer/schema change |

No retained debt is accepted as a trade-off. Missing implementations are explicit work owned by the renewed design/plan; external host dependencies remain explicit qualification limits. This review passes sizing/reuse, not implementation, native qualification or QA.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: controlled approved-source return through QA/pending UAT changes durable decision/quality applicability; architecture_runtime_depth and external_contract_depth also apply. Reject structured_slice because lifecycle/proof/public transport and native/Chat recovery require coordinated design; compact paths cannot change these semantics.
- evidence: Approved UR AC-001..017; Current Coverage; Architecture Impact; Structured Depth Evidence; UR_APPROVAL_RESULT_12.json; DISPATCH_CONTINUATION_CORRECTION_12.json
- transparency_note: Same Run, dependent stages, shared design and whole-flow qualification. Required UX precedes PRD readiness; new PRD/SD/TP approvals precede implementation. No new internal user approval gate.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: authority_policy_security_depth
- decisive_full_depth_triggers: durable approval/quality applicability and lifecycle boundary; public CLI/MCP compatibility; owned-runtime generation and cross-surface recovery
- rejected_alternative: structured_slice; Quick/Compact and Verified Change are ineligible for material policy, lifecycle, persistence and public-contract effects
- missing_or_conflicting_facts: none decisive for full-depth selection; implementation matrix and latest host proof remain explicit downstream obligations
- depth_evidence_refs: UR Scope 8/AC-017; run-revision-boundary.js; generation.js; existing typed approval/recording/proof owners; actual approval/continuation receipts

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Same bound delivery flow handles deliberate approval, proportional revision and truthful completion |
| authority_boundary | fail | Prior decisions and QA applicability change with earlier-source reopening; one Core authority must enforce it |
| owner_consumer_coordination | fail | Revision/proof/quality consumers, public adapters and UI/Chat need consistent cutover |
| full_depth_impacts_absent | fail | Approved lifecycle, persistent proof, runtime and public-contract effects are explicit |
| migration_propagation_bounded | unknown | SD must specify compatible history/readability and expanded boundary propagation; decisive trigger already evidenced |
| failure_recovery_local | fail | Concurrent decisions, archive/backlog interruptions and externally owned host teardown are not a local visual fix |
| independently_acceptable | fail | An adapter-only or UI-only repair cannot satisfy integrated revision and current-state acceptance |

## Context And Remaining Evidence

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-specific reassessment stays in this Run; existing architecture catalogue remains authoritative. Durable architectural reconciliation is a downstream design/closeout obligation, not a new node for this version.
- memory_target: scope_artifact
- missing_evidence: Expanded boundary implementation and current full-flow/native/iPad evidence; no claims transferred from prior candidate tests
- required_next_step: Record this review and route together, complete required UX reassessment, then derive the PRD from approved UR. No implementation before renewed TP approval.
