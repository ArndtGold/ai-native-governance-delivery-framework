# Brownfield Review: Separate PRD authoring from gate-check

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: prd-definition-separation-20261004-01
- related_ur: .agdf/control/artefacts/prd-definition-separation-20261004-01/UR.md
- reviewed_control_revision: d6fd638f-a39d-492b-89e2-139532d7047b
- reviewer: Codex, cooperative repository review
- reviewed_at: 2026-10-04

## Objective

Size the approved separation of semantic PRD drafting and clarification from gate-check. Identify reuse and affected ownership without implementing or choosing the technical handoff design.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: The existing PRD authoring action gains an explicit responsible skill. Drafting, clarification, blockers, revision and exact human approval remain the same user workflow; no new surface, competing state authority or recovery concept is requested.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

Low-impact intent is unambiguous in the approved UR. The PRD must define the unchanged effective-state and visible-result semantics directly. Applicable UX analysis for PRDs authored by the new responsibility remains an input; this review does not suppress such analysis in other runs.

## Existing-System View

| Area | Existing owner or artifact | Evidence | Impact |
|---|---|---|---|
| Product semantics | gate-artifact-preparation; approved UR and applicable UX input | plugins/agdf/meta/contracts/gate-artifact-preparation.md, PRD section | medium: move drafting and clarification ownership |
| Source of truth | canonical skill catalog and run-local artifact bindings | plugins/agdf/meta/agdf-plugin.definition.json; packages/core/lib/control-state/run-artefact-recording.js | medium: add catalog entry while preserving one PRD and existing writer |
| Runtime path | shared Core readiness and dispatch | packages/core/lib/control-evaluation/gate-check.js; packages/core/lib/skill-dispatch/service.js | medium: PRD preparation currently returns skill_id gate-check |
| UI / UX | existing impact routing, interaction presentation and human approval | plugins/agdf/meta/contracts/gate-transition.md; packages/core/lib/interaction-presentation.js | low: explicit authoring responsibility, same visible approval boundary |
| Persistence / data | existing run-step artifact transaction and source proofs | packages/core/lib/control-state/run-artefact-recording.js; artefact-binding-proof.js | low: reuse, no schema migration or second persistence |
| Tests / QA | readiness, continuation, binding, conformance and budget checks | packages/core/test/prd-readiness-test.js; packages/cli/scripts/intake-continuation-test.js; skill-dispatch tests; packages/mcp-server/test/continuation.test.js | medium: qualify new responsibility and unchanged negative guards |
| Release / operations | existing generators, host profiles and installed provenance | scripts/sync-package-assets.js; plugins/agdf/scripts/instruction-footprint.mjs | low: verify package/projection consistency; installation and release excluded |

Current coverage: PRD derivation, source binding, readiness and deliberate approval are implemented. A dedicated semantic PRD authoring responsibility is not implemented. UR authoring already supplies a complementary ownership pattern; it is not a PRD writer.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: Public skill identity and the shared authoring/control handoff cross the catalog, Core dispatcher and host projections. Existing persistence and approval owners must remain authoritative.
- architecture_evidence: gate-check.js gateArtifactPreparationPlans and requiredGateArtifactPreparation; service.js required_gate_artifact continuation; ur-definition.md binding and ownership pattern; run-artefact-recording.js canonical transaction.
- architecture_missing_evidence: none needed to select the route; exact PRD handoff/revision design belongs to SD.
- architecture_next_owner_and_action: Solution Design must choose the smallest extension of these existing seams and map compatibility and failure boundaries.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: semantic PRD ownership currently belongs to control | gate-artifact-preparation.md PRD section and gate-check.js preparation skill_id | revise | PRD defines dedicated authoring responsibility; SD removes competing control-owned drafting |
| problem: second writer would duplicate authority | run-artefact-recording.js verifies approved source, mapping, revision and contained files atomically | block if introduced | SD must retain this writer and its source relationship; no new storage or recording path |
| unresolved: draft-revision handoff mechanics | existing approved-UR conflicts and update_draft proof rules | warn, not route-blocking | SD chooses revision flow using existing operations; approved product changes use existing revision routes |
| problem: fixed catalog assumptions or payload headroom | catalog, conformance and instruction-footprint checks | revise | TP plans canonical-catalog equality, actual regenerated inventory and unchanged limit verification |
| problem: source success could be mislabeled native success | package, protocol and host evidence have different scopes | warn | TP and QA name evidence lanes and leave unperformed native scenarios explicit |

No retained debt is accepted by this review. Existing ownership problems are the approved change objective; no missing debt-acceptance decision is used to claim a completed solution.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: the dedicated public skill identifier and shared dispatch contract require compatible propagation across CLI/MCP and host consumers. Reject structured_slice because full_depth_impacts_absent fails on that evidenced contract effect.
- evidence: this review and its Structured Depth Evidence; approved UR; canonical catalog; gate-check.js; service.js; shared skill-dispatch/contract.js.
- transparency_note: Quick Task is ineligible because semantic authoring ownership and a public catalog contract change. Verified Change is ineligible because this is a contract/architecture change and has multiple authoritative owners. Full depth covers only the approved PRD-authoring outcome and affected consumers, not SD/TP ownership or unrelated runs.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External or public contract: a new callable canonical skill and different responsible continuation are consumed through the shared dispatch contract and generated host catalogs.
- rejected_alternative: structured_slice; its full_depth_impacts_absent condition is not satisfied.
- missing_or_conflicting_facts: none decisive for routing; implementation details remain SD-owned.
- depth_evidence_refs: plugins/agdf/meta/contracts/modes.md; plugins/agdf/meta/agdf-plugin.definition.json; packages/core/lib/skill-dispatch/contract.js; packages/core/lib/control-evaluation/gate-check.js; packages/core/lib/skill-dispatch/service.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR separates only PRD authoring; acceptance is independent of later SD/TP ownership changes |
| authority_boundary | pass | Existing canonical run, approved UR, recording and exact approval owners remain; authoring grants no control authority |
| owner_consumer_coordination | pass | Catalog, Core, CLI/MCP and projections are repository-owned; no external shared cutover is required |
| full_depth_impacts_absent | fail | New public skill identity and responsible dispatch continuation affect the shared consumer contract |
| migration_propagation_bounded | pass | Existing generators propagate the catalog; no persistent schema or existing-run migration is requested |
| failure_recovery_local | pass | Invalid bindings stay in existing fail-closed routing; draft recording and revision stay canonical; release/installation excluded |
| independently_acceptable | pass | Seven UR signals can be tested without moving later artifact or review responsibilities |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Concrete canonical authoring name and observable authoring/clarification boundaries | PRD | resolved by the subsequent PRD before presentation |
| Exact handoff fields, direct invocation and unapproved-draft revision mechanics | SD | warn: named design obligation |
| Evidence lanes and proportionate host observations within the authoring outcome | TP | warn: named planning obligation |

## Context Graph Impact

- memory_target: scope_artifact
- memory_reason: Preserve current ownership evidence for this approved run; durable implemented ownership does not exist yet.
- memory_refs: this BROWNFIELD_REVIEW.md
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-executable-skill-dispatch-authority; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Existing executable dispatch authority and source registry should describe PRD authoring after verified implementation. They are not changed by this planning review; closeout must reconcile the planned update.

## Next Permissible Step

- next_allowed_action: Record this completed review and structured_delivery route together; then draft the PRD from the approved UR through the currently installed preparation contract.
- forbidden_until_then: SD, TP, implementation preparation, implementation and later approval claims.
- required_next_step: PRD preparation after fresh canonical routing.
- missing_evidence: No implementation, test execution or native-host observation is claimed in this review.
